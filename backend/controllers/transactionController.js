const Transaction = require('../models/transaction');
const Bid = require('../models/bid');
const Crop = require('../models/crop');
const mongoose = require('mongoose');

// Create a new transaction from an accepted bid
exports.createTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bid_id, payment_method } = req.body;
        const buyerId = req.user.id;

        // 1. Verify Bid
        const bid = await Bid.findById(bid_id).populate('crop');
        if (!bid) {
            throw new Error('Bid not found');
        }

        if (bid.buyer.toString() !== buyerId) {
             throw new Error('Unauthorized: You are not the buyer of this bid');
        }

        if (bid.status !== 'accepted') {
            throw new Error('Bid is not in accepted status');
        }

        // 2. Check if transaction already exists
        const existingTx = await Transaction.findOne({ bid: bid_id });
        if (existingTx) {
            await session.abortTransaction();
            return res.status(200).json({ message: 'Transaction already exists', transaction: existingTx });
        }

        // 3. Create Transaction
        const transaction = await Transaction.create([{
            bid: bid_id,
            crop: bid.crop._id,
            buyer: buyerId,
            farmer: bid.farmer,
            amount: bid.amount, // Or counter_amount if exists? Schema says amount.
            payment_status: 'pending',
            payment_method: payment_method || 'cash',
            delivery_status: 'pending'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Transaction created successfully',
            transaction: transaction[0]
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Create transaction error:', error);
        res.status(400).json({ error: error.message || 'Error creating transaction' });
    }
};

// Get current user's transactions (as buyer or farmer)
exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { role, status } = req.query; // role: 'buyer' | 'farmer'

        let query = {};
        if (role === 'farmer') {
            query.farmer = userId;
        } else {
            query.buyer = userId; // Default to buyer view if not specified
        }

        if (status) {
            query.payment_status = status;
        }

        const transactions = await Transaction.find(query)
            .populate({
                path: 'crop',
                select: 'name images location'
            })
            .populate('buyer', 'name phone')
            .populate('farmer', 'name phone')
            .sort({ created_at: -1 });

        res.json(transactions);

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single transaction details
exports.getTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id)
            .populate('crop')
            .populate('buyer', 'name phone location')
            .populate('farmer', 'name phone location')
            .populate('bid');

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Authorization check
        if (transaction.buyer._id.toString() !== req.user.id && 
            transaction.farmer._id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(transaction);

    } catch (error) {
        console.error('Get transaction details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Simulate Payment Process
exports.processPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_method } = req.body;

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.buyer.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized: Only buyer can pay' });
        }

        if (transaction.payment_status === 'completed') {
            return res.status(400).json({ error: 'Payment already completed' });
        }

        // Simulate processing delay
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // Update transaction
        transaction.payment_status = 'completed';
        transaction.payment_method = payment_method || transaction.payment_method;
        transaction.transaction_id = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        await transaction.save();

        // Also update the Bid status to 'completed' or 'paid' if needed? 
        // The Bid model might not have a 'paid' status, but keeping it 'accepted' is fine.
        // Maybe update Crop status to 'sold'?
        await Crop.findByIdAndUpdate(transaction.crop, { status: 'sold' });

        res.json({
            message: 'Payment successful',
            transaction
        });

    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update Delivery Status (for Farmer/Logistics)
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'scheduled', 'shipped', 'delivered'

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Only farmer should update delivery status (or logistics role)
        if (transaction.farmer.toString() !== req.user.id) {
             return res.status(403).json({ error: 'Unauthorized' });
        }

        transaction.delivery_status = status;
        await transaction.save();

        res.json({
            message: 'Delivery status updated',
            transaction
        });

    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
