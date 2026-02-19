import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Animated, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mlAPI } from '../../services/api';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const VoiceAssistant = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! I am your farming assistant. How can I help you today?', sender: 'system' }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [inputText, setInputText] = useState('');
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isListening) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isListening]);

    const startListening = () => {
        setIsListening(true);
        // Simulate voice input delay
        setTimeout(() => {
            stopListening("What is the market price of cotton?");
        }, 3000);
    };

    const stopListening = (recognizedText) => {
        setIsListening(false);
        if (recognizedText) {
            handleSend(recognizedText);
        }
    };

    const handleSend = (text) => {
        if (!text) return;

        const newUserMsg = { id: Date.now().toString(), text, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');

        // Simulate AI response
        setTimeout(() => {
            const responseText = "The current market price for Cotton is ₹6500 per quintal. Prices are expected to rise next week.";
            const newSystemMsg = { id: (Date.now() + 1).toString(), text: responseText, sender: 'system' };
            setMessages(prev => [...prev, newSystemMsg]);
        }, 1500);
    };

    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.systemBubble
        ]}>
            <Text style={[
                styles.messageText,
                item.sender === 'user' ? styles.userText : styles.systemText
            ]}>{item.text}</Text>
            <Text style={[
                styles.timeText,
                item.sender === 'user' ? styles.userTimeText : styles.systemTimeText
            ]}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Voice Assistant</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatContainer}
                showsVerticalScrollIndicator={false}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        onPress={isListening ? () => stopListening(null) : startListening}
                        style={styles.micButtonWrapper}
                    >
                        {isListening && (
                            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                        )}
                        <LinearGradient
                            colors={isListening ? [theme.colors.error, '#ff5252'] : [theme.colors.primary, theme.colors.secondary]}
                            style={styles.micButton}
                        >
                            <Ionicons name={isListening ? "mic-off" : "mic"} size={24} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type or speak..."
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={() => handleSend(inputText)}
                            placeholderTextColor={theme.colors.text.disabled}
                        />
                        <TouchableOpacity onPress={() => handleSend(inputText)} disabled={!inputText.trim()}>
                            <Ionicons
                                name="send"
                                size={24}
                                color={inputText.trim() ? theme.colors.primary : theme.colors.text.disabled}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {isListening && (
                <View style={styles.listeningOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.listeningText}>Listening...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadows.small,
        zIndex: 10
    },
    backButton: {
        padding: 5
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    chatContainer: {
        padding: 20,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        ...theme.shadows.small,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    systemBubble: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    messageText: {
        fontSize: 16,
        marginBottom: 4,
        lineHeight: 22
    },
    userText: {
        color: '#fff',
    },
    systemText: {
        color: theme.colors.text.primary,
    },
    timeText: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 2
    },
    userTimeText: {
        color: 'rgba(255,255,255,0.7)'
    },
    systemTimeText: {
        color: theme.colors.text.disabled
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    micButtonWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        width: 50,
        height: 50
    },
    pulseRing: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
    },
    micButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.medium
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text.primary,
        marginRight: 10,
        maxHeight: 100
    },
    listeningOverlay: {
        position: 'absolute',
        top: '40%',
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    listeningText: {
        color: '#fff',
        marginTop: 15,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default VoiceAssistant;
