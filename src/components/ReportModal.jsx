import React, { useState } from 'react';
import Button from './ui/Button';
import { X, AlertTriangle } from 'lucide-react';

const ReportModal = ({ isOpen, onClose, entityName }) => {
    const [reason, setReason] = useState('Fraud');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Report submitted for ${entityName || 'Item'}. Reason: ${reason}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Report Issue
                    </h3>
                    <button onClick={onClose} className="text-red-700 hover:bg-red-100 p-1 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option>Fraud/Scam</option>
                                <option>Inappropriate Content</option>
                                <option>Fake Profile</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                placeholder="Please describe the issue..."
                            ></textarea>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" variant="danger" className="flex-1">
                                Submit Report
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
