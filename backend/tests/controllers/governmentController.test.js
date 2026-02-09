const governmentController = require('../../controllers/governmentController');
const {
    GovernmentScheme
} = require('../../models');

jest.mock('../../models', () => ({
    GovernmentScheme: {
        findAll: jest.fn(),
    },
}));

describe('Government Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getSchemes', () => {
        it('should return schemes from database', async () => {
            const mockSchemes = [{
                id: 1,
                name: 'Scheme A'
            }];
            GovernmentScheme.findAll.mockResolvedValue(mockSchemes);

            await governmentController.getSchemes(req, res);

            expect(res.json).toHaveBeenCalledWith(mockSchemes);
        });

        it('should return dummy data if no schemes found', async () => {
            GovernmentScheme.findAll.mockResolvedValue([]);

            await governmentController.getSchemes(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({
                    name: 'PM-KISAN'
                })
            ]));
        });

        it('should handle errors', async () => {
            GovernmentScheme.findAll.mockRejectedValue(new Error('DB Error'));

            await governmentController.getSchemes(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'DB Error'
            });
        });
    });
});