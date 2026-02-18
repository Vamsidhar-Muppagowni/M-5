const mlService = require('../services/mlService');
const {
    spawn
} = require('child_process');
const redisClient = require('../config/redis');
const {
    PriceHistory,
    Crop,
    Transaction
} = require('../models');

// Mock dependencies
jest.mock('child_process');
jest.mock('../config/redis', () => ({
    get: jest.fn(),
    setEx: jest.fn(),
    on: jest.fn(),
    connect: jest.fn(),
}));
jest.mock('../models', () => ({
    PriceHistory: {
        find: jest.fn().mockReturnThis(),
        findOne: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
    },
    Crop: {
        find: jest.fn().mockReturnThis(),
        countDocuments: jest.fn(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
    },
    Transaction: {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
    },
}));

describe('ML Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getRecommendedPrice', () => {
        it('should return price from python script if successful', async () => {
            const mockRecommendedPrice = 120.50;
            const mockSpawn = {
                stdout: {
                    on: jest.fn((event, callback) => {
                        if (event === 'data') {
                            // Simulate data chunk
                            callback(Buffer.from(JSON.stringify({
                                predicted_price: mockRecommendedPrice
                            })));
                        }
                    }),
                },
                stderr: {
                    on: jest.fn(),
                },
                on: jest.fn((event, callback) => {
                    if (event === 'close') {
                        // Simulate process exit
                        callback(0);
                    }
                }),
                stdin: {
                    write: jest.fn(),
                    end: jest.fn(),
                },
                kill: jest.fn(),
            };

            spawn.mockReturnValue(mockSpawn);

            const params = {
                crop: 'Rice',
                quality: 'A',
                location: 'North',
                quantity: 100
            };

            const result = await mlService.getRecommendedPrice(params);

            expect(result).toBe(mockRecommendedPrice);
            expect(spawn).toHaveBeenCalledWith(
                expect.stringMatching(/python|py/),
                expect.arrayContaining([expect.stringContaining('price_prediction.py')])
            );
        });

        it('should fallback to historical data if python script fails', async () => {
            // Mock python failure
            const mockSpawn = {
                stdout: {
                    on: jest.fn()
                },
                stderr: {
                    on: jest.fn((event, callback) => callback('Error'))
                }, // Simulate error
                on: jest.fn((event, callback) => {
                    if (event === 'close') callback(1); // Non-zero exit code
                }),
                stdin: {
                    write: jest.fn(),
                    end: jest.fn()
                },
            };
            spawn.mockReturnValue(mockSpawn);

            // Mock DB fallback
            const mockHistoricalPrice = {
                price: 100
            };
            PriceHistory.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockHistoricalPrice) // Resolve with price
            });
            // Also need Crop.find to return empty array to trigger historical fallback
            Crop.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            });


            const params = {
                crop: 'Rice',
                quality: 'A',
                location: 'North',
                quantity: 100
            };
            const result = await mlService.getRecommendedPrice(params);

            // Logic: historical.price * 1.1 => 100 * 1.1 = 110
            expect(result).toBeCloseTo(110);
        });
    });
});