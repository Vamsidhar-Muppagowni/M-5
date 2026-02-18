import React from 'react';
import Button from './ui/Button';
import Rating from './ui/Rating';
import { X, User, MapPin, Briefcase } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, user, onReport }) => {
    if (!isOpen || !user) return null;

    // Mock Profile Data
    const profile = {
        name: user.name,
        location: 'Guntur, AP',
        transactions: 124,
        rating: 4.5,
        joined: 'Jan 2024'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
                <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-teal-600">
                    <button onClick={onClose} className="absolute top-2 right-2 text-white/80 hover:text-white p-1">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 pb-6 px-6 text-center">
                    <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {profile.location}
                    </p>

                    <div className="mt-4 flex justify-center">
                        <Rating value={profile.rating} readonly size="md" />
                        <span className="ml-2 text-sm font-bold text-gray-700">({profile.rating})</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 border-t border-b border-gray-100 py-4">
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{profile.transactions}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Trades Done</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{profile.joined}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Joined</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <Button variant="outline" className="w-full">
                            Send Message
                        </Button>
                        <button
                            onClick={onReport}
                            className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                        >
                            Report this User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
