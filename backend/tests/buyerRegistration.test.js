const authController = require('../controllers/authController');
const {
    User,
    BuyerProfile,
    FarmerProfile
} = require('../models');
const redisClient = require('../config/redis');
const smsService = require('../services/smsService');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models', () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn(),
        updateOne: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findById: jest.fn(),
    },
    BuyerProfile: {
        create: jest.fn(),
    },
    FarmerProfile: {
        create: jest.fn(),
    }
}));
jest.mock('../config/redis', () => ({
    setEx: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
}));
jest.mock('../services/smsService');
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({
        isEmpty: jest.fn(() => true),
        array: jest.fn(() => [])
    }))
}));
jest.mock('jsonwebtoken');

describe('Auth Controller - Register', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                phone: '1234567890',
                name: 'Test Buyer',
                password: 'password123',
                user_type: 'buyer',
                language: 'en'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should register a buyer successfully', async () => {
        // Mock User.findOne (user does not exist)
        User.findOne.mockResolvedValue(null);

        // Mock User.create
        const mockUser = {
            _id: 'mockUserId',
            phone: '1234567890',
            name: 'Test Buyer',
            user_type: 'buyer',
            language: 'en'
        };
        User.create.mockResolvedValue(mockUser);

        // Mock BuyerProfile.create
        BuyerProfile.create.mockResolvedValue({});

        // Mock JWT
        jwt.sign.mockReturnValue('mockToken');

        // Execute
        await authController.register(req, res);

        // Assert
        expect(User.findOne).toHaveBeenCalledWith({
            phone: '1234567890'
        });
        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            phone: '1234567890',
            user_type: 'buyer'
        }));
        expect(BuyerProfile.create).toHaveBeenCalledWith({
            user: 'mockUserId'
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('User registered successfully'),
            user: expect.objectContaining({
                user_type: 'buyer'
            })
        }));
    });

    it('should handle existing user error', async () => {
        User.findOne.mockResolvedValue({
            _id: 'existingId'
        });

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User already exists with this phone number'
        });
    });
});