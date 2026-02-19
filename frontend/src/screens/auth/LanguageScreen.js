import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { changeLanguage } from '../../services/language';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' }
];

const LanguageScreen = ({ navigation }) => {
    const handleLanguageSelect = async (langCode) => {
        await changeLanguage(langCode);
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Language / भाषा चुनें</Text>
            <FlatList
                data={languages}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.langButton}
                        onPress={() => handleLanguageSelect(item.code)}
                    >
                        <Text style={styles.langText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center'
    },
    langButton: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        marginBottom: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    langText: {
        fontSize: 18,
        color: '#333'
    }
});

export default LanguageScreen;
