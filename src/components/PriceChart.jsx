import React from 'react';

const PriceChart = ({ data }) => {
    // data: [{ label, value, color }]
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="w-full h-64 flex items-end justify-between gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-fade-in">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div
                        className="text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1"
                    >
                        ₹{item.value}
                    </div>
                    <div
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 hover:opacity-80 ${item.color || 'bg-emerald-500'}`}
                    ></div>
                    <div className="text-xs font-medium text-gray-400 rotate-0 sm:rotate-0 truncate w-full text-center">
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PriceChart;
