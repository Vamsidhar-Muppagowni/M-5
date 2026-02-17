import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

const HelpTip = ({ content }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block ml-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-emerald-500 hover:text-emerald-600 transition-colors focus:outline-none"
                aria-label="Help"
            >
                <HelpCircle className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 p-4 mt-2 -left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl border border-emerald-100 animate-fade-in">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-gray-600 leading-relaxed pr-2">
                        {content}
                    </p>
                    <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 bg-white border-t border-l border-emerald-100 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
};

export default HelpTip;
