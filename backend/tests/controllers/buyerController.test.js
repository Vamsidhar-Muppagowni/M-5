const buyerController = require('../../controllers/buyerController');
const {
    Bid,
    Transaction
} = require('../../models');

jest.mock('../../models', () => ({
    Bid: {
        count: jest.fn(),
    },
    Transaction: {
        count: jest.fn(),
    },
}));

describe('Buyer Controller', () => {
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
        it('should return buyer stats successfully', async () => {
            Bid.count.mockResolvedValue(5);
            Transaction.count.mockResolvedValue(10);

            await buyerController.getStats(req, res);

            expect(Bid.count).toHaveBeenCalledWith({
                where: {
                    buyer_id: 1,
                    status: 'pending'
                }
            });
            expect(Transaction.count).toHaveBeenCalledWith({
                where: {
                    buyer_id: 1
                }
            });
            expect(res.json).toHaveBeenCalledWith({
                activeBids: 5,
                completedPurchases: 10
            });
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            Bid.count.mockRejectedValue(error);

            await buyerController.getStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Internal server error'
            });
        });
    });
});