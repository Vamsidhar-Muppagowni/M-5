import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Tag, TrendingUp, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CropCard = ({ product, onBid, onProfileClick }) => {
    const { t } = useLanguage();

    return (
        <Card hoverEffect className="overflow-hidden flex flex-col h-full">
            <div className={`h-40 w-full ${product.color || 'bg-gray-100'} relative flex items-center justify-center`}>
                <Tag className="text-black/10 w-24 h-24 absolute" />
                <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm z-10 absolute top-3 left-3">
                    {product.category}
                </span>
                {product.quality && (
                    <span className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm z-10 ${product.quality === 'A' ? 'bg-emerald-500' :
                            product.quality === 'B' ? 'bg-amber-500' : 'bg-orange-500'
                        }`}>
                        Grade {product.quality}
                    </span>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={product.name}>{product.name}</h3>
                </div>
                <button
                    onClick={onProfileClick}
                    className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md mb-4 inline-block w-fit hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                    by {product.seller}
                </button>

                <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end border-b pb-3 border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                            <p className="text-xl font-bold text-emerald-600">₹{product.price}<span className="text-sm text-gray-400 font-normal">/{product.unit}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Qty</p>
                            <p className="font-semibold text-gray-700">{product.quantity} {product.unit}</p>
                        </div>
                    </div>

                    {product.highestBid && (
                        <div className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-semibold">Best Offer: ₹{product.highestBid}</span>
                        </div>
                    )}

                    <Button onClick={() => onBid(product)} variant="primary" className="w-full">
                        {t('place_bid') || 'Place Bid'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default CropCard;
