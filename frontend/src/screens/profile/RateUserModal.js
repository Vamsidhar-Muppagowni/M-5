import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { trustAPI } from '../../services/api';
import { theme } from '../../styles/theme';

const RateUserModal = ({ visible, onClose, transactionId, targetUserId, onSuccess }) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Error', t('please_select_rating') || 'Please select a rating from 1 to 5.');
            return;
        }

        setSubmitting(true);
        try {
            await trustAPI.submitReview({
                reviewee: targetUserId,
                transaction: transactionId,
                rating,
                comment
            });
            Alert.alert('Success', t('review_submitted_success') || 'Your review has been submitted successfully.');
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Submit review error:', error);
            const msg = error.response?.data?.error || t('review_submit_failed') || 'Failed to submit review.';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>{t('rate_user') || 'Rate User'}</Text>
                        <TouchableOpacity onPress={onClose} disabled={submitting}>
                            <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>{t('how_was_experience') || 'How was your experience with this transaction?'}</Text>

                    <View style={styles.starContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={40}
                                    color={star <= rating ? "#FFD700" : theme.colors.text.disabled}
                                    style={styles.star}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        style={styles.commentInput}
                        placeholder={t('write_review_optional') || 'Write a review (optional)...'}
                        placeholderTextColor={theme.colors.text.disabled}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        maxLength={500}
                    />

                    <TouchableOpacity
                        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>{t('submit_review') || 'Submit Review'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        ...theme.shadows.large
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginBottom: 20,
        textAlign: 'center'
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 25
    },
    star: {
        marginHorizontal: 5
    },
    commentInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        padding: 15,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
        color: theme.colors.text.primary,
        fontSize: 16
    },
    submitBtn: {
        backgroundColor: theme.colors.primary,
        padding: 15,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center'
    },
    submitBtnDisabled: {
        opacity: 0.7
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default RateUserModal;
