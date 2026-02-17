import React, { useState } from 'react';
import { Star } from 'lucide-react';

const Rating = ({ value = 0, readonly = false, onChange, size = "md" }) => {
    const [hoverValue, setHoverValue] = useState(0);

    const sizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-10 h-10"
    };

    const handleClick = (index) => {
        if (!readonly && onChange) {
            onChange(index);
        }
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => !readonly && setHoverValue(star)}
                    onMouseLeave={() => !readonly && setHoverValue(0)}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer'} outline-none focus:scale-110 transition-transform`}
                    disabled={readonly}
                >
                    <Star
                        className={`${sizes[size]} transition-colors duration-200 ${star <= (hoverValue || value)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-100 text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

export default Rating;
