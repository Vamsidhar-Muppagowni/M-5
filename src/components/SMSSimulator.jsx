import React, { useState, useEffect, useRef } from 'react';
import { smsService } from '../services/SMSService';
import Button from './ui/Button';
import { Send, MessageSquare } from 'lucide-react';

const SMSSimulator = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = smsService.subscribe((msgs) => {
            setMessages([...msgs]);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        smsService.sendSMS('System', input);
        setInput('');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 transition-all z-50 animate-bounce-slow"
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col h-[500px] animate-slide-up">
            {/* Header */}
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> SMS Simulator
                </h3>
                <button onClick={() => setIsOpen(false)} className="hover:bg-emerald-700 p-1 rounded">
                    ✕
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        Try sending "PRICE RICE"
                    </div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'Me' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'Me'
                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                }`}
                        >
                            <p>{msg.text}</p>
                            <span className={`text-xs block mt-1 ${msg.sender === 'Me' ? 'text-emerald-100' : 'text-gray-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type SMS..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <Button type="submit" size="sm" className="px-3" disabled={!input.trim()}>
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
};

export default SMSSimulator;
