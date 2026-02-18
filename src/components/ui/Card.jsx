import React from 'react';

const Card = ({ children, className = '', hoverEffect = false, ...props }) => {
    return (
        <div
            className={`
        bg-white/80 backdrop-blur-sm border border-white/20 
        rounded-xl shadow-lg 
        ${hoverEffect ? 'hover:-translate-y-1 hover:shadow-xl transition-all duration-300' : ''} 
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
