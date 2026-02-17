class SMSService {
    constructor() {
        this.messages = [];
        this.listeners = [];
    }

    sendSMS(param, message) {
        // Simulate sending an SMS
        console.log(`Sending SMS to ${param}: ${message}`);
        const newMessage = {
            id: Date.now(),
            sender: 'Me',
            recipient: 'System',
            text: message,
            timestamp: new Date()
        };
        this.messages.push(newMessage);
        this.notifyListeners();

        // Simulate auto-reply based on keywords
        this.handleAutoReply(message);
    }

    receiveSMS(text) {
        const newMessage = {
            id: Date.now() + 1,
            sender: 'System',
            recipient: 'Me',
            text: text,
            timestamp: new Date()
        };
        this.messages.push(newMessage);
        this.notifyListeners();
        return newMessage;
    }

    handleAutoReply(message) {
        const lowerMsg = message.toLowerCase();
        let reply = '';

        if (lowerMsg.includes('price')) {
            reply = 'M-5 Update: Rice - ₹2500/Q, Wheat - ₹2100/Q. Prices are stable.';
        } else if (lowerMsg.includes('help')) {
            reply = 'M-5 Help: Reply PRICE <CROP> for prices, SELL <CROP> to start listing.';
        } else {
            // No auto-reply for unknown commands in this basic mock
            return;
        }

        setTimeout(() => {
            this.receiveSMS(reply);
        }, 2000);
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.messages));
    }

    getMessages() {
        return this.messages;
    }
}

export const smsService = new SMSService();
