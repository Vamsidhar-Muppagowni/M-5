import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Lock, ArrowRight, Sprout } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { login } = useAuth(); // Use AuthContext
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('farmer'); // Default role
    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(role, email, password);

        if (result.success) {
            setLoading(false);
            navigate('/');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-[80vh] gap-8 animate-fade-in relative">
            {/* Left Side - Brand/Welcome */}
            <div className="flex-1 max-w-md text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                    <div className="bg-emerald-100 p-3 rounded-2xl">
                        <Sprout className="text-emerald-600 w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800">{t('project_title')}</h1>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('welcome_back')}</h2>
                <p className="text-lg text-gray-600 mb-8">
                    {t('login_subtitle')}
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {[t('feature_prices'), t('feature_schemes'), t('feature_payments')].map((item) => (
                        <span key={item} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 w-full max-w-md">
                <Card className="p-8 border-t-4 border-t-emerald-500 shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{t('login')}</h3>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                                {['farmer', 'buyer', 'admin'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${role === r
                                            ? 'bg-white text-emerald-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('email_label')}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="name@farm.com"
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">{t('password_label')}</label>
                                <Link to="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">{t('forgot_password')}</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3 flex items-center justify-center gap-2 text-lg"
                            disabled={loading}
                        >
                            {loading ? t('signing_in') : (
                                <>
                                    {t('sign_in')} <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-600">
                        {t('no_account')} <Link to="/register" className="text-emerald-600 font-semibold cursor-pointer hover:underline">{t('register_new')}</Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
