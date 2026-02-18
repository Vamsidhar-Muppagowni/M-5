import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send OTP');

            setSuccess('OTP sent to your email!');
            setTimeout(() => {
                setSuccess(null);
                setStep(2);
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault(); // Added this line for consistency, assuming it was omitted for brevity in the original snippet
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Verification failed');

            setSuccess('OTP Verified!');
            setTimeout(() => {
                setSuccess(null);
                setStep(3); // Move to password step
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        // ...
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Reset failed');

            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50 relative overflow-hidden flex items-center justify-center p-4">
            {/* Background blobs similar to Login */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-amber-200/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
            </div>

            <Card className="w-full max-w-md p-8 relative z-10 glass-card animate-fade-in shadow-2xl shadow-emerald-900/10">
                <div className="text-center mb-8">
                    <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
                        <Key size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {step === 1 ? 'Forgot Password?' : step === 2 ? 'Enter OTP' : 'Reset Password'}
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        {step === 1 ? 'Enter your email to receive a secure OTP.' :
                            step === 2 ? `We sent a code to ${email}` :
                                'Create a strong new password.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 rounded-lg flex items-center gap-2 text-sm">
                        <CheckCircle size={16} />
                        {success}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm"
                                    placeholder="farmer@example.com"
                                />
                            </div>
                        </div>
                        <Button type="submit" isLoading={loading} className="w-full py-3 text-lg shadow-lg shadow-emerald-500/20">
                            Send OTP
                        </Button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">OTP Code</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm tracking-widest font-mono text-center text-lg"
                                    placeholder="123456"
                                />
                            </div>
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full py-3 text-lg shadow-lg shadow-emerald-500/20">
                            Verify OTP
                        </Button>

                        <button
                            type="button"
                            onClick={() => { setStep(1); setError(null); }}
                            className="w-full text-center text-sm text-gray-500 hover:text-emerald-600 mt-2"
                        >
                            Change Email / Resend
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full py-3 text-lg shadow-lg shadow-emerald-500/20">
                            Reset Password
                        </Button>
                    </form>
                )}

                <div className="mt-8 text-center pt-6 border-t border-gray-100">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors gap-1">
                        Back to Login
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPassword;
