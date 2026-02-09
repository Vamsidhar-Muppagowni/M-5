const farmerController = require('../../controllers/farmerController');
const {
    Crop,
    Bid,
    Transaction,
    sequelize
} = require('../../models');

jest.mock('../../models', () => ({
    Crop: {
        count: jest.fn(),
    },
    Bid: {
        count: jest.fn(),
    },
    Transaction: {
        count: jest.fn(),
        findAll: jest.fn(),
    },
    sequelize: {},
}));

describe('Farmer Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: {
                id: 1
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        // Suppress console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getStats', () => {
        it('should return farmer stats successfully', async () => {
            Crop.count.mockResolvedValue(5);
            Transaction.count.mockResolvedValue(10);
            Transaction.findAll.mockResolvedValue([{
                    final_price: '100'
                },
                {
                    final_price: '200'
                }
            ]);
            Bid.count.mockResolvedValue(3);

            await farmerController.getStats(req, res);

            expect(Crop.count).toHaveBeenCalledWith({
                where: {
                    farmer_id: 1,
                    status: 'listed'
                }
            });
            expect(Transaction.count).toHaveBeenCalledWith({
                where: {
                    farmer_id: 1
                }
            });
            expect(res.json).toHaveBeenCalledWith({
                activeListings: 5,
                totalSales: 10,
                pendingBids: 3,
                earnings: 300
            });
        });

        it('should handle errors', async () => {
            Crop.count.mockRejectedValue(new Error('Database error'));

            await farmerController.getStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Internal server error'
            });
        });
    });
});