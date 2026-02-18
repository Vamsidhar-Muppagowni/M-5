import React from 'react';
import Navbar from './Navbar';
import SMSSimulator from './SMSSimulator';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 font-sans text-gray-900 relative">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in content-container">
                {children}
            </main>
            <SMSSimulator />
        </div>
    );
};

export default Layout;
