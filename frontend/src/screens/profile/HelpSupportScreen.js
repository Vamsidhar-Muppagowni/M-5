import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const HelpSupportScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const handleCallSupport = () => {
        Linking.openURL('tel:18001234567');
    };

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@farmermarket.com');
    };

    const FAQItem = ({ question, answer }) => (
        <View style={styles.faqItem}>
            <Text style={styles.question}>{question}</Text>
            <Text style={styles.answer}>{answer}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('help_support') || 'Help & Support'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.contactCard}>
                    <Text style={styles.contactTitle}>Need immediate help?</Text>
                    <Text style={styles.contactSubtitle}>Our support team is available 24/7</Text>

                    <TouchableOpacity style={styles.contactButton} onPress={handleCallSupport}>
                        <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
                            <Ionicons name="call" size={24} color="#1565c0" />
                        </View>
                        <View>
                            <Text style={styles.contactMethod}>Call Helpline</Text>
                            <Text style={styles.contactValue}>1800-123-4567</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
                        <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                            <Ionicons name="mail" size={24} color="#2e7d32" />
                        </View>
                        <View>
                            <Text style={styles.contactMethod}>Email Support</Text>
                            <Text style={styles.contactValue}>support@farmermarket.com</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                <FAQItem
                    question="How do I list my crops?"
                    answer="Go to the dashboard and click on 'List New Crop'. Fill in the details like crop name, quantity, and price, then upload a photo."
                />

                <FAQItem
                    question="How do I accept a bid?"
                    answer="Check your 'Pending Bids' section. You can view details of each bid and click 'Accept' or 'Reject'."
                />

                <FAQItem
                    question="Is my payment secure?"
                    answer="Yes, all transactions are secured and monitored. Payments are processed only after successful delivery confirmation."
                />

                <FAQItem
                    question="How can I change my language?"
                    answer="Go to Profile -> Change Language and select your preferred language from the list."
                />
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
        padding: 20,
        marginBottom: 15,
        ...theme.shadows.small
    },
    question: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 8
    },
    answer: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20
    }
});

export default HelpSupportScreen;
