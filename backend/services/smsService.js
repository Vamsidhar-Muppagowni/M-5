const twilio = require('twilio');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

class SMSService {
    constructor() {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
            this.twilioClient = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
        } else {
            console.warn('Twilio credentials missing or invalid. Mocking SMS.');
            this.twilioClient = null;
        }
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

            // For international numbers, use Twilio
            return await this.sendViaTwilio(formattedPhone, message);
        } catch (error) {
            console.error('SMS sending failed:', error);
            // In development, just log the message if SMS fails
            // In development (or if undefined), just log the message if SMS fails
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

    async sendViaTwilio(to, message) {
        if (!this.twilioClient) {
            console.log(`[MOCK TWILIO SMS] To: ${to}, Message: ${message}`);
            return {
                success: true,
                mock: true
            };
        }
        return await this.twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
    }

    async sendViaIndianGateway(phone, message, language) {
        // Mock implementation if no API key is present
        if (!this.smsGatewayAuth || this.smsGatewayAuth === 'your_msg91_auth_key') {
            console.log(`[MOCK INDIAN SMS] To: ${phone}, Message: ${message}`);
            return {
                success: true
            };
        }

        const response = await axios.post(this.smsGatewayApi, {
            sender: 'FARMKT',
            route: language === 'en' ? '4' : '1', // Transactional for English, Promotional for regional
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
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // If starts with 0, remove it
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        // Add country code if not present
        if (!cleaned.startsWith('+')) {
            if (cleaned.length === 10) {
                // Indian number
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
                results.push({
                    recipient,
                    success: true,
                    result
                });
            } catch (error) {
                results.push({
                    recipient,
                    success: false,
                    error: error.message
                });
            }
        }
        return results;
    }

    // SMS Command Parser for farmers to interact via SMS
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
                return {
                    command: command.toLowerCase(),
                    params: match.slice(1)
                };
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
                // Get crop price
                const cropName = parsed.params[0];
                // Implement price lookup
                return `Current price for ${cropName}: ₹XX per kg`;

            case 'list':
                // List crop for sale
                const [crop, quantity, price] = parsed.params;
                // Implement crop listing
                return `Crop ${crop} listed successfully. Quantity: ${quantity}kg, Price: ₹${price}/kg`;

            case 'status':
                // Get transaction status
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