const mlService = require('../../services/mlService');
const redisClient = require('../../config/redis');
const {
    PriceHistory,
    Crop,
    Transaction
} = require('../../models');
const axios = require('axios');

jest.mock('../../config/redis', () => ({
    get: jest.fn(),
    setEx: jest.fn(),
}));

jest.mock('../../models', () => ({
    PriceHistory: {
        find: jest.fn(),
        findOne: jest.fn(),
    },
    Crop: {
        find: jest.fn(),
        countDocuments: jest.fn(),
    },
    Transaction: {
        find: jest.fn(),
    },
}));

jest.mock('axios');

describe('MLService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('predictPrice', () => {
        it('should return cached prediction if available', async () => {
            const mockPrediction = {
                prediction: 100
            };
            redisClient.get.mockResolvedValue(JSON.stringify(mockPrediction));

            const params = {
                crop: 'Wheat',
                location: 'Delhi',
                days: 7
            };
            const result = await mlService.predictPrice(params);

            expect(redisClient.get).toHaveBeenCalledWith('price_prediction:Wheat:Delhi:7');
            expect(result).toEqual(mockPrediction);
        });

        it('should use ML API if cache miss and API succeeds', async () => {
            process.env.NODE_ENV = 'production';
            redisClient.get.mockResolvedValue(null);

            // Mock historical data
            const mockHistoricalData = [{
                    date: new Date('2023-01-01'),
                    price: 90
                },
                {
                    date: new Date('2023-01-02'),
                    price: 92
                },
            ];
            PriceHistory.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockHistoricalData),
            });

            // Mock ML API response
            const mockApiResponse = {
                predictions: [{
                    date: '2023-01-08',
                    predicted_price: 105
                }]
            };
            axios.post.mockResolvedValue({
                data: mockApiResponse
            });

            // Mock weather API (called internally)
            axios.get.mockResolvedValue({
                data: {
                    forecast: {
                        forecastday: []
                    }
                }
            });

            const params = {
                crop: 'Wheat',
                location: 'Delhi',
                days: 7
            };
            const result = await mlService.predictPrice(params);

            expect(axios.post).toHaveBeenCalled();
            expect(redisClient.setEx).toHaveBeenCalledWith(
                'price_prediction:Wheat:Delhi:7',
                1800,
                JSON.stringify(mockApiResponse)
            );
            expect(result).toEqual(mockApiResponse);
        });

        it('should fallback to local prediction if ML API fails', async () => {
            process.env.NODE_ENV = 'production';
            redisClient.get.mockResolvedValue(null);
            PriceHistory.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            });
            axios.post.mockRejectedValue(new Error('API Error'));

            // Mock weather API failure too, just in case
            axios.get.mockRejectedValue(new Error('Weather API Error'));

            const params = {
                crop: 'Wheat',
                location: 'Delhi',
                days: 7
            };
            const result = await mlService.predictPrice(params);

            // Should call localPrediction (which returns synthetic data)
            expect(result).toHaveProperty('predictions');
            expect(result.predictions).toHaveLength(7);
            expect(result).toHaveProperty('trend');
            expect(result).toHaveProperty('recommendation');
        });

        it('should return fallback prediction on critical error', async () => {
            // Force an error in getHistoricalData or somewhere else
            redisClient.get.mockRejectedValue(new Error('Critical Redis Error'));

            const params = {
                crop: 'Wheat',
                location: 'Delhi',
                days: 7
            };
            const result = await mlService.predictPrice(params);

            expect(result.recommendation).toBe('Limited data available');
        });
    });

    describe('getRecommendedPrice', () => {
        it('should calculate average price from current listings', async () => {
            const mockPrices = [{
                    current_price: 100,
                    quality_grade: 'A',
                    quantity: 50
                },
                {
                    current_price: 110,
                    quality_grade: 'A',
                    quantity: 60
                },
            ];
            Crop.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue(mockPrices),
                    }),
                }),
            });

            const params = {
                crop: 'Rice',
                quality: 'A',
                location: 'Punjab',
                quantity: 500
            };
            const result = await mlService.getRecommendedPrice(params);

            expect(Crop.find).toHaveBeenCalledWith({
                name: 'Rice',
                status: 'listed',
                'location.district': 'Punjab',
            });
            expect(result).toBe(105); // (100 + 110) / 2
        });

        it('should use historical data markup if no current listings', async () => {
            Crop.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            PriceHistory.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue({
                    price: 100
                }),
            });

            const params = {
                crop: 'Rice',
                quality: 'A',
                location: 'Punjab'
            };
            const result = await mlService.getRecommendedPrice(params);

            expect(result).toBeCloseTo(110); // 100 * 1.1
        });

        it('should apply bulk discount', async () => {
            const mockPrices = [{
                current_price: 100,
                quality_grade: 'A',
                quantity: 1500
            }, ];
            Crop.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue(mockPrices),
                    }),
                }),
            });

            const params = {
                crop: 'Rice',
                quality: 'A',
                location: 'Punjab',
                quantity: 1500
            };
            const result = await mlService.getRecommendedPrice(params);

            // Avg = 100. Discount 5% -> 95.
            expect(result).toBe(95);
        });

        it('should apply small quantity premium', async () => {
            const mockPrices = [{
                current_price: 100,
                quality_grade: 'A',
                quantity: 50
            }, ];
            Crop.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue(mockPrices),
                    }),
                }),
            });

            const params = {
                crop: 'Rice',
                quality: 'A',
                location: 'Punjab',
                quantity: 50
            };
            const result = await mlService.getRecommendedPrice(params);

            // Avg = 100. Premium 5% -> 105.
            expect(result).toBe(105);
        });
    });

    describe('getMarketInsights', () => {
        it('should return market insights', async () => {
            // Mock Crop.find to return an object with select
            const mockSelect = jest.fn().mockResolvedValue([{
                _id: 'crop1'
            }]);
            Crop.find.mockReturnValue({
                select: mockSelect
            });

            // Mock Crop.countDocuments
            Crop.countDocuments.mockResolvedValue(25);

            // Mock Transaction.find to return object with sort
            const mockSort = jest.fn().mockResolvedValue([{
                    amount: 100,
                    created_at: new Date()
                },
                {
                    amount: 90,
                    created_at: new Date()
                },
            ]);
            Transaction.find.mockReturnValue({
                sort: mockSort
            });

            const params = {
                crop: 'Cotton',
                location: 'Gujarat'
            };
            const result = await mlService.getMarketInsights(params);

            expect(result).toHaveProperty('demand_trend');
            expect(result).toHaveProperty('price_trend');
            expect(result.supply_level).toBe('high');
        });

        it('should return default insights on error', async () => {
            // Make sure to reset or override the mock to throw error
            Crop.find.mockImplementation(() => {
                throw new Error('DB Error');
            });

            const params = {
                crop: 'Cotton',
                location: 'Gujarat'
            };
            const result = await mlService.getMarketInsights(params);

            expect(result.market_sentiment).toBe('neutral');
        });
    });
});