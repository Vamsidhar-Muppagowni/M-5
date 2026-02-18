import React, { useState } from 'react';
import Button from './ui/Button';
import { X, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BidModal = ({ isOpen, onClose, product, onSubmitBid }) => {
    const [bidAmount, setBidAmount] = useState('');
    const { t } = useLanguage();

    if (!isOpen || !product) return null;

    const minPrice = product.minPrice || 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(bidAmount);

        if (amount < minPrice) {
            alert(`Bid must be at least ₹${minPrice} (Seller's Minimum)`);
            return;
        }

        if (amount <= (product.highestBid || 0)) {
            alert(`Bid must be higher than current highest bid: ₹${product.highestBid}`);
            return;
        }

        onSubmitBid(product.id, amount);
        setBidAmount('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                    <h3 className="text-lg font-bold">Place Bid: {product.name}</h3>
                    <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-sm text-gray-500">Current Price</p>
                            <p className="text-xl font-bold text-gray-800">₹{product.price}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-amber-600 font-medium">Highest Bid</p>
                            <p className="text-xl font-bold text-amber-600">₹{product.highestBid || '0'}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Offer (₹)</label>
                            <div className="relative">
                                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    required
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg font-semibold"
                                    placeholder={`Min ₹${minPrice}`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                * Minimum acceptable bid is ₹{minPrice}
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1">
                                Confirm Bid
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BidModal;
