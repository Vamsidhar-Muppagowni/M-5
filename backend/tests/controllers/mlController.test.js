const mlController = require('../../controllers/mlController');
const mlService = require('../../services/mlService');

jest.mock('../../services/mlService', () => ({
    predictPrice: jest.fn(),
    getMarketInsights: jest.fn(),
    getCropRecommendation: jest.fn(),
    getRecommendedPrice: jest.fn(),
}));

describe('ML Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('predictPrice', () => {
        it('should return predicted price', async () => {
            mlService.predictPrice.mockResolvedValue({
                price: 100
            });
            await mlController.predictPrice(req, res);
            expect(res.json).toHaveBeenCalledWith({
                price: 100
            });
        });

        it('should handle errors', async () => {
            mlService.predictPrice.mockRejectedValue(new Error('ML Error'));
            await mlController.predictPrice(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'ML Error'
            });
        });
    });

    describe('getMarketInsights', () => {
        it('should return market insights', async () => {
            mlService.getMarketInsights.mockResolvedValue({
                insight: 'Good'
            });
            await mlController.getMarketInsights(req, res);
            expect(res.json).toHaveBeenCalledWith({
                insight: 'Good'
            });
        });
    });

    describe('recommendCrop', () => {
        it('should return crop recommendation', async () => {
            mlService.getCropRecommendation.mockResolvedValue(['Rice']);
            await mlController.recommendCrop(req, res);
            expect(res.json).toHaveBeenCalledWith(['Rice']);
        });
    });

    describe('recommendPrice', () => {
        it('should return recommended price', async () => {
            mlService.getRecommendedPrice.mockResolvedValue(200);
            await mlController.recommendPrice(req, res);
            expect(res.json).toHaveBeenCalledWith({
                recommended_price: 200
            });
        });
    });
});