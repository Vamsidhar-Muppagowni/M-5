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
            question: t('faq_q1'),
            answer: t('faq_a1')
        },
        {
            question: t('faq_q2'),
            answer: t('faq_a2')
        },
        {
            question: t('faq_q3'),
            answer: t('faq_a3')
        },
        {
            question: t('faq_q4'),
            answer: t('faq_a4')
        },
        {
            question: t('faq_q5'),
            answer: t('faq_a5')
        },
        {
            question: t('faq_q6'),
            answer: t('faq_a6')
        },
        {
            question: t('faq_q7'),
            answer: t('faq_a7')
        },
        {
            question: t('faq_q8'),
            answer: t('faq_a8')
        },
        {
            question: t('faq_q9'),
            answer: t('faq_a9')
        },
        {
            question: t('faq_q10'),
            answer: t('faq_a10')
        },
        {
            question: t('faq_q11'),
            answer: t('faq_a11')
        },
        {
            question: t('faq_q12'),
            answer: t('faq_a12')
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
