import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { changeLanguage } from '../../services/language';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
    const { user } = useSelector(state => state.auth);
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeListings: 0,
        pendingApprovals: 0
    });
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        // Mock stats for now
        setStats({
            totalUsers: 1250,
            activeListings: 340,
            pendingApprovals: 5
        });
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchStats();
    }, []);

    const QuickAction = ({ icon, title, color, onPress }) => (
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: color }]} onPress={onPress}>
            <Ionicons name={icon} size={28} color="#fff" />
            <Text style={styles.actionText}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Admin'} 👋</Text>
                    <Text style={styles.subtitle}>System Overview & Management</Text>
                </View>
                <View style={styles.languageContainer}>
                    <Ionicons name="language" size={20} color="#2e7d32" style={{ marginRight: 5 }} />
                    <Picker
                        selectedValue={i18n.language}
                        style={styles.picker}
                        onValueChange={changeLanguage}
                        mode="dropdown"
                    >
                        <Picker.Item label="EN" value="en" />
                        <Picker.Item label="HI" value="hi" />
                        <Picker.Item label="TE" value="te" />
                    </Picker>
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={[styles.iconBg, { backgroundColor: '#e3f2fd' }]}>
                        <Ionicons name="people" size={24} color="#1565c0" />
                    </View>
                    <Text style={styles.statValue}>{stats.totalUsers}</Text>
                    <Text style={styles.statLabel}>Total Users</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={[styles.iconBg, { backgroundColor: '#e8f5e9' }]}>
                        <Ionicons name="list" size={24} color="#2e7d32" />
                    </View>
                    <Text style={styles.statValue}>{stats.activeListings}</Text>
                    <Text style={styles.statLabel}>Active Listings</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={[styles.iconBg, { backgroundColor: '#fff3e0' }]}>
                        <Ionicons name="alert-circle" size={24} color="#ef6c00" />
                    </View>
                    <Text style={styles.statValue}>{stats.pendingApprovals}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Management</Text>
            <View style={styles.actionsGrid}>
                {/* 
                  TODO: Implement these screens:
                  - ManageUsers
                  - ManageListings
                  - SystemLogs
                */}
                <QuickAction
                    icon="people-circle"
                    title="Manage Users"
                    color="#0288d1"
                    onPress={() => console.log('Navigate to Manage Users')}
                />
                <QuickAction
                    icon="list-circle"
                    title="All Listings"
                    color="#2e7d32"
                    onPress={() => navigation.navigate('Browse')} // Reusing Browse for now
                />
                <QuickAction
                    icon="settings"
                    title="Settings"
                    color="#455a64"
                    onPress={() => navigation.navigate('Profile')}
                />
            </View>

            {/* Recent Activity Mock */}
            <Text style={styles.sectionTitle}>Recent System Activity</Text>
            <View style={styles.activityCard}>
                <View style={styles.activityItem}>
                    <Ionicons name="person-add" size={20} color="#2e7d32" />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>New farmer registration: Ramesh Kumar</Text>
                        <Text style={styles.activityTime}>2 mins ago</Text>
                    </View>
                </View>
                <View style={styles.borderBottom} />
                <View style={styles.activityItem}>
                    <Ionicons name="cart" size={20} color="#1565c0" />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>New bid placed on Cotton #1234</Text>
                        <Text style={styles.activityTime}>15 mins ago</Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a'
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5
    },
    languageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingLeft: 10,
        height: 35,
        width: 110
    },
    picker: {
        width: 100,
        height: 35,
        color: '#333'
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between'
    },
    statCard: {
        backgroundColor: '#fff',
        width: (width - 50) / 3,
        padding: 10,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 2
    },
    iconBg: {
        padding: 8,
        borderRadius: 50,
        marginBottom: 8
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 20,
        marginBottom: 15,
        marginTop: 10
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        justifyContent: 'space-between'
    },
    actionCard: {
        width: (width - 45) / 2, // 2 columns
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 14
    },
    activityCard: {
        marginHorizontal: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        elevation: 2,
        marginBottom: 20
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },
    activityContent: {
        marginLeft: 15,
        flex: 1
    },
    activityText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4
    },
    activityTime: {
        fontSize: 12,
        color: '#999'
    },
    borderBottom: {
        height: 1,
        backgroundColor: '#f0f0f0',
        width: '100%'
    }
});

export default AdminDashboard;
