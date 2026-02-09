const authController = require('../../controllers/authController');
const {
    User,
    FarmerProfile,
    BuyerProfile
} = require('../../models');
const redisClient = require('../../config/redis');
const smsService = require('../../services/smsService');
const {
    validationResult
} = require('express-validator');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../models', () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findByPk: jest.fn(),
    },
    FarmerProfile: {
        create: jest.fn(),
    },
    BuyerProfile: {
        create: jest.fn(),
    },
}));

jest.mock('../../config/redis', () => ({
    setEx: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    connect: jest.fn(),
}));

jest.mock('../../services/smsService', () => ({
    sendSMS: jest.fn(),
}));

jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        // Suppress console.error and console.log
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('register', () => {
        it('should return 400 if validation fails', async () => {
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{
                    msg: 'Error'
                }]
            });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                errors: [{
                    msg: 'Error'
                }]
            });
        });

        it('should return 400 if user already exists', async () => {
            validationResult.mockReturnValue({
                isEmpty: () => true
            });
            req.body = {
                phone: '1234567890'
            };
            User.findOne.mockResolvedValue({
                id: 1
            });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User already exists with this phone number'
            });
        });

        it('should register a new user successfully', async () => {
            validationResult.mockReturnValue({
                isEmpty: () => true
            });
            req.body = {
                phone: '1234567890',
                name: 'Test User',
                password: 'password',
                user_type: 'farmer',
                language: 'en'
            };

            User.findOne.mockResolvedValue(null);
            const mockUser = {
                id: 1,
                ...req.body
            };
            User.create.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('token');

            await authController.register(req, res);

            expect(User.create).toHaveBeenCalled();
            expect(FarmerProfile.create).toHaveBeenCalledWith({
                user_id: 1
            });
            expect(redisClient.setEx).toHaveBeenCalled();
            expect(smsService.sendSMS).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('User registered successfully'),
                token: 'token'
            }));
        });
    });

    describe('verifyOTP', () => {
        it('should return 400 if OTP is expired or not found', async () => {
            req.body = {
                phone: '1234567890',
                otp: '123456'
            };
            redisClient.get.mockResolvedValue(null);

            await authController.verifyOTP(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'OTP expired or not found'
            });
        });

        it('should return 400 if OTP is invalid', async () => {
            req.body = {
                phone: '1234567890',
                otp: '123456'
            };
            redisClient.get.mockResolvedValue('654321');

            await authController.verifyOTP(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid OTP'
            });
        });

        it('should verify OTP successfully', async () => {
            req.body = {
                phone: '1234567890',
                otp: '123456'
            };
            redisClient.get.mockResolvedValue('123456');

            await authController.verifyOTP(req, res);

            expect(User.update).toHaveBeenCalledWith({
                is_verified: true
            }, {
                where: {
                    phone: '1234567890'
                }
            });
            expect(redisClient.del).toHaveBeenCalledWith('otp:1234567890');
            expect(res.json).toHaveBeenCalledWith({
                message: 'Phone number verified successfully'
            });
        });
    });

    describe('login', () => {
        it('should return 401 if user not found', async () => {
            req.body = {
                phone: '1234567890',
                password: 'password'
            };
            User.findOne.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid credentials'
            });
        });

        it('should return 401 if password is invalid', async () => {
            req.body = {
                phone: '1234567890',
                password: 'password'
            };
            const mockUser = {
                comparePassword: jest.fn().mockResolvedValue(false)
            };
            User.findOne.mockResolvedValue(mockUser);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid credentials'
            });
        });

        it('should login successfully', async () => {
            req.body = {
                phone: '1234567890',
                password: 'password'
            };
            const mockUser = {
                id: 1,
                phone: '1234567890',
                comparePassword: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('token');

            await authController.login(req, res);

            expect(User.update).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Login successful',
                token: 'token'
            }));
        });
    });

    describe('resendOTP', () => {
        it('should return 404 if user not found', async () => {
            req.body = {
                phone: '1234567890'
            };
            User.findOne.mockResolvedValue(null);

            await authController.resendOTP(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User not found'
            });
        });
        it('should return 400 if user already verified', async () => {
            req.body = {
                phone: '1234567890'
            };
            User.findOne.mockResolvedValue({
                is_verified: true
            });

            await authController.resendOTP(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User already verified'
            });
        });

        it('should resend OTP successfully', async () => {
            req.body = {
                phone: '1234567890'
            };
            User.findOne.mockResolvedValue({
                is_verified: false,
                phone: '1234567890'
            });

            await authController.resendOTP(req, res);

            expect(redisClient.setEx).toHaveBeenCalled();
            expect(smsService.sendSMS).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'OTP resent successfully'
            }));
        });
    });

    describe('updateProfile', () => {
        it('should update profile successfully', async () => {
            req.user = {
                id: 1
            };
            req.body = {
                name: 'New Name'
            };
            User.update.mockResolvedValue([1]);
            User.findByPk.mockResolvedValue({
                id: 1,
                name: 'New Name'
            });

            await authController.updateProfile(req, res);

            expect(User.update).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Profile updated successfully',
                user: {
                    id: 1,
                    name: 'New Name'
                }
            }));
        });

        it('should handle errors in updateProfile', async () => {
            req.user = {
                id: 1
            };
            User.update.mockRejectedValue(new Error('DB Error'));
            await authController.updateProfile(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('changeLanguage', () => {
        it('should return 400 if language is not provided', async () => {
            req.user = {
                id: 1
            };
            req.body = {};

            await authController.changeLanguage(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Language is required'
            });
        });

        it('should update language successfully', async () => {
            req.user = {
                id: 1
            };
            req.body = {
                language: 'te'
            };
            User.update.mockResolvedValue([1]);

            await authController.changeLanguage(req, res);

            expect(User.update).toHaveBeenCalledWith({
                language: 'te'
            }, {
                where: {
                    id: 1
                }
            });
            expect(res.json).toHaveBeenCalledWith({
                message: 'Language updated successfully',
                language: 'te'
            });
        });

        it('should handle errors in changeLanguage', async () => {
            req.user = {
                id: 1
            };
            req.body = {
                language: 'te'
            };
            User.update.mockRejectedValue(new Error('DB Error'));
            await authController.changeLanguage(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getProfile', () => {
        it('should return 404 if user not found', async () => {
            req.user = {
                id: 1,
                user_type: 'farmer'
            };
            User.findByPk.mockResolvedValue(null);

            await authController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404); // Expect 404 based on controller logic
        });

        it('should return user profile successfully', async () => {
            req.user = {
                id: 1,
                user_type: 'farmer'
            };
            const mockUser = {
                id: 1,
                name: 'Test'
            };
            User.findByPk.mockResolvedValue(mockUser);

            await authController.getProfile(req, res);

            expect(res.json).toHaveBeenCalledWith({
                user: mockUser
            });
        });

        it('should handle errors in getProfile', async () => {
            req.user = {
                id: 1
            };
            User.findByPk.mockRejectedValue(new Error('DB Error'));
            await authController.getProfile(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

});