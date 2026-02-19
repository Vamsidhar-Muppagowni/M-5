const marketController = require('../controllers/marketController');
const { User, Crop, Bid } = require('../models');
const mongoose = require('mongoose');

// Mock Models
jest.mock('../models', () => ({
    User: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findOne: jest.fn(),
    },
    Crop: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
    },
    Bid: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
    },
    PriceHistory: {
        find: jest.fn(),
        findOne: jest.fn(),
    },
    FarmerProfile: {
        create: jest.fn(),
    }
}));

// Mock ML Service
jest.mock('../services/mlService', () => ({
    getRecommendedPrice: jest.fn().mockResolvedValue(25),
    predictPrice: jest.fn().mockResolvedValue([{ date: new Date(), predicted_price: 25 }]),
    getMarketInsights: jest.fn().mockResolvedValue({ trend: 'up' })
}));

// Mock Mongoose Session
jest.mock('mongoose', () => ({
    startSession: jest.fn().mockReturnValue({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
        inTransaction: jest.fn().mockReturnValue(true)
    }),
    Types: {
        ObjectId: {
            isValid: jest.fn().mockReturnValue(true)
        }
    },
    connect: jest.fn(),
    disconnect: jest.fn()
}));

// Mock Response
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Market Controller Unit Tests (Mocked)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('listCrop - should successfully create a crop listing', async () => {
        const req = {
            user: { id: 'farmer_123' },
            body: {
                name: 'Tomato',
                quantity: 100,
                unit: 'kg',
                quality_grade: 'A',
                min_price: 20,
                current_price: 25,
                status: 'listed'
            }
        };
        const res = mockResponse();

        // Mock Crop.create to return the created crop
        Crop.create.mockResolvedValue([{
            _id: 'crop_123',
            name: 'Tomato',
            farmer: 'farmer_123',
            ...req.body
        }]);

        await marketController.listCrop(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Crop listed successfully',
            crop: expect.objectContaining({ name: 'Tomato' })
        }));
    });

    test('placeBid - should allow buyer to place a valid bid', async () => {
        const req = {
            user: { id: 'buyer_123' },
            body: {
                crop_id: 'crop_123',
                amount: 30,
                message: 'I want to buy'
            }
        };
        const res = mockResponse();

        // Mock Crop.findById
        const mockCrop = {
            _id: 'crop_123',
            farmer: 'farmer_123', // Different from buyer
            status: 'listed',
            min_price: 20,
            current_price: 25,
            bid_count: 0,
            save: jest.fn(),
            session: jest.fn().mockReturnThis() // Chainable
        };

        // Setup chainable session mock correctly
        const sessionMock = jest.fn().mockResolvedValue(mockCrop);
        Crop.findById.mockReturnValue({
            session: sessionMock
        });

        // Mock Bid.create
        Bid.create.mockResolvedValue([{
            _id: 'bid_123',
            amount: 30,
            status: 'pending'
        }]);

        await marketController.placeBid(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Bid placed successfully'
        }));
    });

    test('respondToBid - farmer should be able to accept a bid', async () => {
        const req = {
            user: { id: 'farmer_123' },
            body: {
                bid_id: 'bid_123',
                action: 'accept'
            }
        };
        const res = mockResponse();

        // Mock Bid.findById
        const mockBid = {
            _id: 'bid_123',
            farmer: 'farmer_123',
            crop: { _id: 'crop_123' },
            status: 'pending',
            save: jest.fn()
        };

        // Mock chain: Bid.findById().populate().session()
        const populateMock = jest.fn().mockReturnValue({
            session: jest.fn().mockResolvedValue(mockBid)
        });
        Bid.findById.mockReturnValue({
            populate: populateMock
        });

        // Mock Crop.findByIdAndUpdate
        Crop.findByIdAndUpdate = jest.fn();

        await marketController.respondToBid(req, res);

        expect(mockBid.status).toBe('accepted');
        expect(mockBid.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Bid accepted'
        }));
    });
});
