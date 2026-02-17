import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Phone, MapPin, Save, CheckCircle, X } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        photo: user?.photo || null
    });

    const [viewPhoto, setViewPhoto] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (limit to 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large. Please select an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            updateProfile({
                phone: formData.phone,
                address: formData.address,
                photo: formData.photo
            });
            setSuccess(true);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in p-4">
            {viewPhoto && formData.photo && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setViewPhoto(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={formData.photo}
                            alt="Full Profile"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition"
                            onClick={() => setViewPhoto(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}

            <Card className="p-8">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                    <div className="relative group">
                        <div
                            className={`w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 overflow-hidden border-2 border-emerald-50 ${formData.photo ? 'cursor-zoom-in' : ''}`}
                            onClick={() => formData.photo && setViewPhoto(true)}
                        >
                            {formData.photo ? (
                                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover transition transform group-hover:scale-105" />
                            ) : (
                                <User size={32} />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-emerald-700 transition shadow-sm z-10" title="Upload Photo">
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            <User size={14} className="stroke-2" />
                        </label>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                        <p className="text-gray-500">Manage your personal information</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                        <CheckCircle size={20} />
                        Profile updated successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                disabled
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">District / City</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g. Guntur, Andhra Pradesh"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" variant="primary" className="w-full md:w-auto" isLoading={loading}>
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>

            {!user?.phone && (
                <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">
                    ⚠️ Your profile is incomplete. Please add your phone number and location to get personalized features.
                </div>
            )}
        </div>
    );
};

export default Profile;
