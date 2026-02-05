import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mlAPI } from '../../services/api';

const VoiceAssistant = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! I am your farming assistant. How can I help you today?', sender: 'system' }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [inputText, setInputText] = useState('');
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const startListening = () => {
        setIsListening(true);
        // Animate button
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true })
            ])
        ).start();

        // Simulate voice input delay
        setTimeout(() => {
            stopListening("What is the market price of cotton?");
        }, 3000);
    };

    const stopListening = (recognizedText) => {
        setIsListening(false);
        scaleAnim.stopAnimation();
        scaleAnim.setValue(1);
        handleSend(recognizedText);
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
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Voice Assistant</Text>
            </View>

            <FlatList
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatContainer}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type or speak..."
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={() => handleSend(inputText)}
                />
                <TouchableOpacity onPress={isListening ? () => stopListening(null) : startListening}>
                    <Animated.View style={[styles.micButton, { transform: [{ scale: scaleAnim }] }]}>
                        <Text style={styles.micText}>{isListening ? '🛑' : '🎤'}</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {isListening && (
                <View style={styles.listeningOverlay}>
                    <Text style={styles.listeningText}>Listening...</Text>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        elevation: 2,
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    chatContainer: {
        padding: 15,
        paddingBottom: 80,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 15,
        marginBottom: 10,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#2e7d32',
        borderBottomRightRadius: 2,
    },
    systemBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
        elevation: 1,
    },
    messageText: {
        fontSize: 16,
    },
    userText: {
        color: '#fff',
    },
    systemText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
    },
    micButton: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
    },
    micText: {
        fontSize: 20,
        color: '#fff',
    },
    listeningOverlay: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 15,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    listeningText: {
        color: '#fff',
        marginRight: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default VoiceAssistant;
