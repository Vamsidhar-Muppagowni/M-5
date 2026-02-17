import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, Sprout, LogOut, User } from 'lucide-react';

const Navbar = () => {
    // Force English via the context so the base app renders in English for GT
    const { t } = useLanguage();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const location = useLocation();

    // Read Google Translate cookie on mount to update the dropdown label
    const langMenuRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    React.useEffect(() => {
        const getCookie = (name) => {
            const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
            return v ? v[2] : null;
        };
        const googtrans = getCookie('googtrans');
        if (googtrans) {
            // Cookie format is like /en/hi
            const langCode = googtrans.split('/').pop();
            if (langCode) setCurrentLang(langCode);
        }
    }, []);

    const handleLanguageChange = (code) => {
        // 1. Force base application language to English in localStorage to avoid conflict
        localStorage.setItem('appLanguage', 'en');

        // 2. Set the 'googtrans' cookie for Google Translate
        // /en/code tells GT to translate FROM English TO target code
        document.cookie = `googtrans=/en/${code}; path=/`;
        document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;

        // 3. Update local state and reload
        setCurrentLang(code);
        setIsLangOpen(false);
        window.location.reload();
    };

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, label }) => (
        <Link
            to={to}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive(to)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                }`}
        >
            {label}
        </Link>
    );

    const getNavLinks = () => {
        if (!user) return [];
        // We use English labels explicitly here so GT can translate them
        const baseLinks = [
            { to: '/', label: 'Dashboard', roles: ['farmer', 'buyer', 'admin'] },
            { to: '/marketplace', label: 'Marketplace', roles: ['farmer', 'buyer', 'admin'] },
            { to: '/schemes', label: 'Schemes', roles: ['farmer', 'admin'] },
            { to: '/farming-help', label: 'Farming Help', roles: ['farmer', 'admin'] },
        ];

        return baseLinks.filter(link => link.roles.includes(user.role));
    };

    const navLinks = getNavLinks();

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'Hindi (हिंदी)' },
        { code: 'bn', label: 'Bengali (বাংলা)' },
        { code: 'te', label: 'Telugu (తెలుగు)' },
        { code: 'mr', label: 'Marathi (मराठी)' },
        { code: 'ta', label: 'Tamil (தமிழ்)' },
        { code: 'ur', label: 'Urdu (اردو)' },
        { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
        { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
        { code: 'ml', label: 'Malayalam (മലയാളം)' },
        { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
        { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
        { code: 'as', label: 'Assamese (অসমীয়া)' }
    ];

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="bg-emerald-600 p-2 rounded-lg text-white">
                                <Sprout size={24} />
                            </div>
                            <span className="font-bold text-xl text-gray-800">M-5 Farming</span>
                        </Link>
                        <div className="hidden md:ml-8 md:flex md:space-x-4">
                            {navLinks.map(link => (
                                <NavLink key={link.to} to={link.to} label={link.label} />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">

                        <div className="relative notranslate" ref={langMenuRef}>
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md hover:bg-gray-50 outline-none"
                            >
                                <Globe size={18} />
                                <span className="uppercase font-semibold text-sm">{currentLang}</span>
                            </button>

                            {isLangOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-fade-in max-h-96 overflow-y-auto">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-600 transition-colors
                                                ${currentLang === lang.code ? 'font-bold text-emerald-600 bg-emerald-50' : 'text-gray-700'}
                                            `}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-600 capitalize hidden md:block">
                                    {user.role}
                                </span>
                                <Link
                                    to="/profile"
                                    className="text-gray-600 hover:text-emerald-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    title="Profile"
                                >
                                    {user.photo ? (
                                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                                            <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="p-1">
                                            <User size={20} />
                                        </div>
                                    )}
                                </Link>
                                <button
                                    onClick={logout}
                                    className="hidden md:flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium"
                                >
                                    <LogOut size={18} />
                                    {t('logout') || 'Logout'}
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden md:block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium shadow-md shadow-emerald-600/20"
                            >
                                {t('login')}
                            </Link>
                        )}

                        <div className="-mr-2 flex items-center md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{link.label}</Link>
                        ))}

                        {user ? (
                            <button onClick={logout} className="block w-full text-center mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium">{t('logout') || 'Logout'}</button>
                        ) : (
                            <Link to="/login" className="block w-full text-center mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg">{t('login')}</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
