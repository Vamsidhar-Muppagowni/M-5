import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const MyBidsScreen = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const [bids, setBids] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBids = async () => {
        try {
            const response = await api.get('/market/my-bids');
            setBids(response.data.bids);
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchBids();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchBids();
    }, []);

    const renderBid = ({ item }) => (
        <View style={styles.bidCard}>
            <View style={styles.bidHeader}>
                <Text style={styles.cropName}>{item.crop?.name}</Text>
                <Text style={[
                    styles.status,
                    { color: item.status === 'accepted' ? 'green' : item.status === 'rejected' ? 'red' : 'orange' }
                ]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <Text style={styles.detail}>My Bid: ₹{item.amount}</Text>
            <Text style={styles.detail}>Farmer: {item.crop?.farmer?.name}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Bids</Text>
            </View>

            <FlatList
                data={bids}
                renderItem={renderBid}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No bids placed yet.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    list: {
        padding: 15
    },
    bidCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2
    },
    bidHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    status: {
        fontWeight: 'bold'
    },
    detail: {
        color: '#666',
        marginBottom: 3
    },
    date: {
        color: '#999',
        fontSize: 12,
        marginTop: 5
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666'
    }
});

export default MyBidsScreen;
