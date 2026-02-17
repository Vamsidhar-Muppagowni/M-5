import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Lock, Mail, ArrowRight, Sprout, CheckCircle } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('farmer');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: role
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Please login.');
                navigate('/login');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to the server. Please ensure the backend is running by using "npm run dev".');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-[80vh] gap-8 animate-fade-in relative py-8">
            {/* Left Side - Brand/Info */}
            <div className="flex-1 max-w-md text-center md:text-left hidden md:block">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                    <div className="bg-emerald-100 p-3 rounded-2xl">
                        <Sprout className="text-emerald-600 w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800">Join M-5 Farming</h1>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Start your journey</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Create an account to access real-time market prices, government schemes, and manage your farming activities efficiently.
                </p>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                        <CheckCircle size={20} />
                        <span className="font-medium">Free Market Access</span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                        <CheckCircle size={20} />
                        <span className="font-medium">Expert Farming Tips</span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                        <CheckCircle size={20} />
                        <span className="font-medium">Direct Buyer Connections</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 w-full max-w-md">
                <Card className="p-8 border-t-4 border-t-emerald-500 shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h3>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                                {['farmer', 'buyer'].map((r) => (
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
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
                            {loading ? 'Creating Account...' : (
                                <>
                                    Create Account <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account? <Link to="/login" className="text-emerald-600 font-semibold cursor-pointer hover:underline">Sign in</Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Register;
