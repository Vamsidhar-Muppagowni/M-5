import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCrops } from '../../store/slices/marketSlice';
import { Ionicons } from '@expo/vector-icons';

const MarketScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { crops, isLoading } = useSelector(state => state.market);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadCrops();
    }, [page]);

    const loadCrops = () => {
        dispatch(fetchCrops({ page, search }));
    };

    const onRefresh = () => {
        setPage(1);
        loadCrops();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CropDetails', { id: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cropName}>{item.name}</Text>
                <Text style={styles.price}>₹{item.current_price}/{item.unit}</Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.detailText}>Quantity: {item.quantity}{item.unit}</Text>
                <Text style={styles.detailText}>Quality: Grade {item.quality_grade}</Text>
                <Text style={styles.detailText}>Location: {item.location?.district || 'N/A'}</Text>
                <Text style={styles.detailText}>By: {item.farmer?.name}</Text>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
                <Text style={styles.timeText}>Just now</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search crops..."
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={() => { setPage(1); loadCrops(); }}
                />
                <TouchableOpacity onPress={() => { setPage(1); loadCrops(); }}>
                    <Ionicons name="search" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {isLoading && page === 1 ? (
                <ActivityIndicator size="large" color="#2e7d32" style={styles.loader} />
            ) : (
                <FlatList
                    data={crops}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshing={isLoading}
                    onRefresh={onRefresh}
                    onEndReached={() => setPage(p => p + 1)}
                    onEndReachedThreshold={0.5}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    header: {
        padding: 15,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginRight: 10,
        fontSize: 16
    },
    list: {
        padding: 10
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        padding: 15,
        elevation: 2
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32'
    },
    cardBody: {
        marginBottom: 10
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10
    },
    statusBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
    },
    statusText: {
        color: '#2e7d32',
        fontSize: 12,
        fontWeight: 'bold'
    },
    timeText: {
        color: '#999',
        fontSize: 12
    },
    loader: {
        marginTop: 50
    }
});

export default MarketScreen;
