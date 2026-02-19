const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

class SMSService {
    constructor() {
        this.smsGatewayApi = process.env.SMS_GATEWAY_API;
        this.smsGatewayAuth = process.env.SMS_GATEWAY_AUTH;
    }

    async sendSMS(to, message, language = 'en') {
        try {
            // Format phone number
            const formattedPhone = this.formatPhoneNumber(to);

            // For Indian numbers, use Indian SMS gateway ONLY if configured
            if (formattedPhone.startsWith('+91') &&
                this.smsGatewayAuth &&
                this.smsGatewayAuth !== 'your_msg91_auth_key') {
                return await this.sendViaIndianGateway(formattedPhone, message, language);
            }

            // Mock SMS for development
            return await this.sendMockSMS(formattedPhone, message);
        } catch (error) {
            console.error('SMS sending failed:', error);
            // In development, just log the message if SMS fails
            if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
                console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
                return {
                    success: true,
                    mock: true
                };
            }
            throw error;
        }
    }

    async sendMockSMS(to, message) {
        console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
        return {
            success: true,
            mock: true
        };
    }

    async sendViaIndianGateway(phone, message, language) {
        // Mock implementation if no API key is present
        if (!this.smsGatewayAuth || this.smsGatewayAuth === 'your_msg91_auth_key') {
            console.log(`[MOCK INDIAN SMS] To: ${phone}, Message: ${message}`);
            return {
                success: true,
                mock: true
            };
        }

        const response = await axios.post(this.smsGatewayApi, {
            sender: 'FARMKT',
            route: language === 'en' ? '4' : '1',
            country: '91',
            sms: [{
                message,
                to: [phone.replace('+91', '')]
            }]
        }, {
            headers: {
                'Authorization': `Bearer ${this.smsGatewayAuth}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    }

    formatPhoneNumber(phone) {
        let cleaned = phone.replace(/\D/g, '');

        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        if (!cleaned.startsWith('+')) {
            if (cleaned.length === 10) {
                cleaned = '+91' + cleaned;
            } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
                cleaned = '+' + cleaned;
            }
        }

        return cleaned;
    }

    async sendBulkSMS(recipients, message, language = 'en') {
        const results = [];
        for (const recipient of recipients) {
            try {
                const result = await this.sendSMS(recipient, message, language);
                results.push({ recipient, success: true, result });
            } catch (error) {
                results.push({ recipient, success: false, error: error.message });
            }
        }
        return results;
    }

    parseSMSCommand(message) {
        const commands = {
            PRICE: /^PRICE\s+(\w+)$/i,
            LIST: /^LIST\s+(\w+)\s+(\d+)\s+(\d+)$/i,
            STATUS: /^STATUS$/i,
            HELP: /^HELP$/i
        };

        const messageUpper = message.trim().toUpperCase();

        for (const [command, regex] of Object.entries(commands)) {
            const match = messageUpper.match(regex);
            if (match) {
                return { command: command.toLowerCase(), params: match.slice(1) };
            }
        }

        return null;
    }

    async handleSMSCommand(phone, message) {
        const parsed = this.parseSMSCommand(message);

        if (!parsed) {
            return 'Invalid command. Send HELP for available commands.';
        }

        switch (parsed.command) {
            case 'price':
                const cropName = parsed.params[0];
                return `Current price for ${cropName}: ₹XX per kg`;

            case 'list':
                const [crop, quantity, price] = parsed.params;
                return `Crop ${crop} listed successfully. Quantity: ${quantity}kg, Price: ₹${price}/kg`;

            case 'status':
                return 'Your last transaction status: Completed';

            case 'help':
                return `Available commands:
PRICE [crop] - Get current price
LIST [crop] [quantity] [price] - List crop for sale
STATUS - Check transaction status
HELP - Show this message`;

            default:
                return 'Invalid command';
        }
    }
}

module.exports = new SMSService();
