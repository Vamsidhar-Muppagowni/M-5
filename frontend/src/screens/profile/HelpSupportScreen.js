import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const HelpSupportScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [expandedFaq, setExpandedFaq] = useState(null);

    const handleCallSupport = () => {
        Linking.openURL('tel:18001234567');
    };

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@farmermarket.com');
    };

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "How do I list my crops?",
            answer: "Go to the dashboard and click on 'List New Crop'. Fill in the details like crop name, quantity, and price, then upload a photo. Your listing will be visible to buyers immediately."
        },
        {
            question: "How do I accept a bid?",
            answer: "Check your 'Pending Bids' section from the dashboard. You can view details of each bid including the buyer's offer amount and click 'Accept' or 'Reject'."
        },
        {
            question: "Is my payment secure?",
            answer: "Yes, all transactions are secured and monitored. Payments are processed only after successful delivery confirmation. We use bank-grade encryption for all financial data."
        },
        {
            question: "How can I change my language?",
            answer: "Go to Profile -> Change Language and select your preferred language from the list. The app supports English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, and Gujarati."
        },
        {
            question: "How do I browse and bid on crops as a buyer?",
            answer: "Navigate to the 'Browse' tab to see all available crop listings. Tap any listing to see details, then enter your bid amount and press 'Place Bid'. You'll be notified when the farmer responds."
        },
        {
            question: "What are Government Schemes and how do I apply?",
            answer: "The 'Schemes' tab lists all current government agricultural schemes available for farmers. Tap any scheme to see full details including eligibility, required documents, and the application process. You can apply directly through the app."
        },
        {
            question: "How do I check current market prices?",
            answer: "Go to the 'Prices' tab to see real-time market price trends for different crops. You can select specific crops and view 6-month price charts to make informed selling or buying decisions."
        },
        {
            question: "What should I do if my bid is rejected?",
            answer: "If your bid is rejected, you can place a new bid with a higher amount. Check the crop's current price and minimum price to ensure your bid is competitive. You can also browse other listings."
        },
        {
            question: "How do I edit or delete my crop listing?",
            answer: "Go to your dashboard and tap on 'Active Listings'. Find the listing you want to modify. You can view details or use the delete button to remove it from the marketplace."
        },
        {
            question: "How do I contact a farmer or buyer directly?",
            answer: "For privacy and security, direct contact details are shared only after a bid is accepted. Once a bid is accepted, both parties will receive each other's contact information to arrange delivery."
        },
        {
            question: "What crops can I list on the marketplace?",
            answer: "You can list any agricultural produce including grains (wheat, rice, maize), pulses, oilseeds, cash crops (cotton, sugarcane), fruits, vegetables, and spices. Make sure to provide accurate quality grade information."
        },
        {
            question: "How is the quality grade determined?",
            answer: "Quality grades range from A (premium) to D (basic). Grade A indicates the highest quality with minimal impurities. You should honestly assess your crop quality as buyers may verify upon delivery."
        }
    ];

    const FAQItem = ({ question, answer, index }) => {
        const isExpanded = expandedFaq === index;
        return (
            <TouchableOpacity
                style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
                onPress={() => toggleFaq(index)}
                activeOpacity={0.8}
            >
                <View style={styles.faqHeader}>
                    <Text style={styles.question}>{question}</Text>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={theme.colors.text.secondary}
                    />
                </View>
                {isExpanded && (
                    <Text style={styles.answer}>{answer}</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('help_support') || 'Help & Support'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.contactCard}>
                    <Text style={styles.contactTitle}>{t('need_help') || 'Need immediate help?'}</Text>
                    <Text style={styles.contactSubtitle}>{t('support_available') || 'Our support team is available 24/7'}</Text>

                    <TouchableOpacity style={styles.contactButton} onPress={handleCallSupport}>
                        <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
                            <Ionicons name="call" size={24} color="#1565c0" />
                        </View>
                        <View>
                            <Text style={styles.contactMethod}>{t('call_helpline') || 'Call Helpline'}</Text>
                            <Text style={styles.contactValue}>1800-123-4567</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
                        <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                            <Ionicons name="mail" size={24} color="#2e7d32" />
                        </View>
                        <View>
                            <Text style={styles.contactMethod}>{t('email_support') || 'Email Support'}</Text>
                            <Text style={styles.contactValue}>support@farmermarket.com</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>{t('faq_title') || 'Frequently Asked Questions'}</Text>

                {faqs.map((faq, index) => (
                    <FAQItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                        index={index}
                    />
                ))}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.small
    },
    backButton: {
        padding: 5
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    content: {
        padding: 20
    },
    contactCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        ...theme.shadows.medium
    },
    contactTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 5
    },
    contactSubtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 20
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        borderRadius: 12,
        backgroundColor: theme.colors.background
    },
    iconBox: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    contactMethod: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 2
    },
    contactValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 15,
        marginLeft: 5
    },
    faqItem: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...theme.shadows.small,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    faqItemExpanded: {
        borderColor: theme.colors.primary,
        borderWidth: 1
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    question: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        flex: 1,
        marginRight: 10
    },
    answer: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border
    }
});

export default HelpSupportScreen;
