import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { governmentAPI } from '../../services/api';

const GovernmentSchemes = () => {
    const [schemes, setSchemes] = useState([]);

    useEffect(() => {
        governmentAPI.getSchemes().then(res => setSchemes(res.data)).catch(console.error);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Government Schemes</Text>
            <FlatList
                data={schemes}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.schemeName}>{item.name}</Text>
                        <Text>{item.description}</Text>
                        <Text style={styles.benefit}>Benefits: {item.benefits}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 10 },
    schemeName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    benefit: { color: 'green', marginTop: 5, fontWeight: 'bold' }
});

export default GovernmentSchemes;
