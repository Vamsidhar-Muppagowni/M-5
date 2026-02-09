const marketController = require('../../controllers/marketController');
const {
    Crop,
    Bid,
    Transaction,
    User,
    PriceHistory,
    sequelize
} = require('../../models');
const mlService = require('../../services/mlService');
const {
    Op
} = require('sequelize');

jest.mock('../../models', () => ({
    Crop: {
        create: jest.fn(),
        count: jest.fn(),
        findAndCountAll: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
    },
    Bid: {
        create: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        count: jest.fn(),
    },
    Transaction: {
        create: jest.fn(),
    },
    User: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
    PriceHistory: {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
    },
    FarmerProfile: {
        create: jest.fn(),
    },
    sequelize: {
        transaction: jest.fn(),
    },
}));

jest.mock('../../services/mlService', () => ({
    getRecommendedPrice: jest.fn(),
    predictPrice: jest.fn(),
    getMarketInsights: jest.fn(),
}));

jest.mock('../../config/redis', () => ({
    get: jest.fn(),
    setEx: jest.fn(),
}));

jest.mock('../../services/smsService', () => ({
    sendSMS: jest.fn(),
}));

describe('Market Controller', () => {
    let req, res, mockTransaction;

    beforeEach(() => {
        req = {
            user: {
                id: 1,
                user_type: 'farmer'
            },
            body: {},
            query: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn(),
            finished: false,
        };
        sequelize.transaction.mockResolvedValue(mockTransaction);

        // Suppress console.error and console.log
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('listCrop', () => {
        it('should list crop successfully', async () => {
            req.body = {
                name: 'Rice',
                quantity: 100,
                min_price: 2000
            };
            mlService.getRecommendedPrice.mockResolvedValue(2200);
            Crop.create.mockResolvedValue({
                id: 1,
                name: 'Rice'
            });
            mlService.predictPrice.mockResolvedValue({
                predicted_price: 2300
            });

            await marketController.listCrop(req, res);

            expect(Crop.create).toHaveBeenCalled();
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should rollback on error', async () => {
            req.body = {
                name: 'Rice'
            };
            Crop.create.mockRejectedValue(new Error('DB Error'));

            await marketController.listCrop(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getCrops', () => {
        it('should get crops successfully', async () => {
            Crop.count.mockResolvedValue(1); // For seeding check
            Crop.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{
                    toJSON: () => ({
                        id: 1,
                        name: 'Rice',
                        location: '{"district": "Guntur"}'
                    })
                }]
            });

            await marketController.getCrops(req, res);

            expect(Crop.findAndCountAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('getCropDetails', () => {
        it('should return crop details', async () => {
            req.params.id = 1;
            const mockCrop = {
                id: 1,
                name: 'Rice',
                increment: jest.fn(),
            };
            Crop.findByPk.mockResolvedValue(mockCrop);
            mlService.getMarketInsights.mockResolvedValue({});
            Crop.findAll.mockResolvedValue([]); // For similar crops

            await marketController.getCropDetails(req, res);

            expect(Crop.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(mockCrop.increment).toHaveBeenCalledWith('view_count');
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if crop not found', async () => {
            req.params.id = 1;
            Crop.findByPk.mockResolvedValue(null);

            await marketController.getCropDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('placeBid', () => {
        it('should place bid successfully', async () => {
            req.user = {
                id: 2
            }; // Buyer
            req.body = {
                crop_id: 1,
                amount: 3000
            };
            const mockCrop = {
                id: 1,
                farmer_id: 1,
                status: 'listed',
                min_price: 2000,
                current_price: 2500,
                increment: jest.fn(),
                update: jest.fn(),
            };
            Crop.findByPk.mockResolvedValue(mockCrop);
            Bid.create.mockResolvedValue({
                id: 1
            });

            await marketController.placeBid(req, res);

            expect(Bid.create).toHaveBeenCalled();
            expect(mockCrop.increment).toHaveBeenCalledWith('bid_count', {
                transaction: mockTransaction
            });
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should fulfill error conditions', async () => {
            req.user = {
                id: 1
            }; // Farmer (same as owner)
            req.body = {
                crop_id: 1,
                amount: 3000
            };
            const mockCrop = {
                id: 1,
                farmer_id: 1
            };
            Crop.findByPk.mockResolvedValue(mockCrop);

            await marketController.placeBid(req, res);

            expect(res.status).toHaveBeenCalledWith(400); // Cannot bid on own crop
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });
    });

    describe('respondToBid', () => {
        it('should accept bid successfully', async () => {
            req.user = {
                id: 1
            }; // Farmer
            req.body = {
                bid_id: 1,
                action: 'accept'
            };
            const mockBid = {
                id: 1,
                crop_id: 1,
                crop: {
                    farmer_id: 1
                },
                update: jest.fn(),
            };
            Bid.findByPk.mockResolvedValue(mockBid);

            await marketController.respondToBid(req, res);

            expect(mockBid.update).toHaveBeenCalledWith({
                status: 'accepted'
            }, {
                transaction: mockTransaction
            });
            expect(Crop.update).toHaveBeenCalledWith({
                status: 'reserved'
            }, {
                where: {
                    id: 1
                },
                transaction: mockTransaction
            });
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('getPriceHistory', () => {
        it('should return price history', async () => {
            PriceHistory.findAll.mockResolvedValue([]);
            PriceHistory.findOne.mockResolvedValue({
                crop_name: 'Wheat'
            }); // Fallback

            await marketController.getPriceHistory(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should handle errors in getPriceHistory', async () => {
            PriceHistory.findOne.mockRejectedValue(new Error('DB Error'));
            await marketController.getPriceHistory(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getRecentPrices', () => {
        it('should return recent prices', async () => {
            const mockPrices = [{
                id: 1,
                crop_name: 'Wheat',
                price: 2000,
                date: '2023-01-01'
            }];
            PriceHistory.findAll.mockResolvedValue(mockPrices);

            await marketController.getRecentPrices(req, res);

            expect(PriceHistory.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({
                    crop: 'Wheat'
                })
            ]));
        });

        it('should return fallback prices if history empty', async () => {
            PriceHistory.findAll.mockResolvedValue([]);
            Crop.findAll.mockResolvedValue([{
                id: 1,
                name: 'Rice',
                current_price: 2500,
                updated_at: new Date()
            }]);

            await marketController.getRecentPrices(req, res);

            expect(Crop.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        it('should handle errors in getRecentPrices', async () => {
            PriceHistory.findAll.mockRejectedValue(new Error('DB Error'));
            await marketController.getRecentPrices(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getFarmerReceivedBids', () => {
        it('should return bids for farmer', async () => {
            req.user = {
                id: 1
            };
            Bid.findAll.mockResolvedValue([{
                id: 1,
                amount: 1000
            }]);

            await marketController.getFarmerReceivedBids(req, res);

            expect(Bid.findAll).toHaveBeenCalledWith(expect.objectContaining({
                include: expect.arrayContaining([
                    expect.objectContaining({
                        model: Crop,
                        where: {
                            farmer_id: 1
                        }
                    })
                ])
            }));
            expect(res.json).toHaveBeenCalledWith({
                bids: [{
                    id: 1,
                    amount: 1000
                }]
            });
        });

        it('should handle errors in getFarmerReceivedBids', async () => {
            req.user = {
                id: 1
            };
            Bid.findAll.mockRejectedValue(new Error('DB Error'));
            await marketController.getFarmerReceivedBids(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});