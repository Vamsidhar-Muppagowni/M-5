import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const CommunityScreen = ({ navigation }) => {
    const [posts, setPosts] = useState([
        {
            id: '1',
            user: 'Ramesh Kumar',
            location: 'Warangal, Telangana',
            content: 'Has anyone started sowing Cotton for this Kharif season? Need advice on seed selection.',
            likes: 12,
            comments: 4,
            time: '2 hours ago',
            tags: ['Cotton', 'Kharif', 'Seeds']
        },
        {
            id: '2',
            user: 'Surendra Reddy',
            location: 'Guntur, AP',
            content: 'Mirchi prices are looking good this week at the Guntur market yard. Getting around ₹22,000/quintal for Teja variety.',
            likes: 28,
            comments: 8,
            time: '5 hours ago',
            tags: ['Chilli', 'Market Price', 'Guntur']
        }
    ]);
    const [newPost, setNewPost] = useState('');

    const handlePost = () => {
        if (!newPost.trim()) return;

        const post = {
            id: Date.now().toString(),
            user: 'You',
            location: 'Your Location',
            content: newPost,
            likes: 0,
            comments: 0,
            time: 'Just now',
            tags: []
        };

        setPosts([post, ...posts]);
        setNewPost('');
    };

    const renderPost = ({ item }) => (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{item.user.charAt(0)}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user}</Text>
                    <Text style={styles.userLocation}>{item.location} • {item.time}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
            </View>

            <Text style={styles.postContent}>{item.content}</Text>

            {item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {item.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.divider} />

            <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={20} color={theme.colors.text.secondary} />
                    <Text style={styles.actionText}>{item.likes} Likes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text.secondary} />
                    <Text style={styles.actionText}>{item.comments} Comments</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={20} color={theme.colors.text.secondary} />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Farmer's Choupal</Text>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.createPostContainer}>
                        <View style={styles.inputRow}>
                            <View style={[styles.avatarContainer, { width: 40, height: 40, marginRight: 12 }]}>
                                <Text style={styles.avatarText}>Y</Text>
                            </View>
                            <TextInput
                                style={styles.postInput}
                                placeholder="Share your thoughts or ask a question..."
                                value={newPost}
                                onChangeText={setNewPost}
                                multiline
                            />
                        </View>
                        <View style={styles.postToolbar}>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Ionicons name="image-outline" size={20} color={theme.colors.primary} />
                                <Text style={styles.toolbarText}>Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.postButton, !newPost.trim() && styles.postButtonDisabled]}
                                onPress={handlePost}
                                disabled={!newPost.trim()}
                            >
                                <Text style={styles.postButtonText}>Post</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: theme.borderRadius.l,
        borderBottomRightRadius: theme.borderRadius.l,
        ...theme.shadows.medium
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff'
    },
    backButton: {
        padding: 5
    },
    list: {
        padding: 16
    },
    createPostContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 16,
        marginBottom: 16,
        ...theme.shadows.small
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 12
    },
    postInput: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text.primary,
        paddingTop: 8,
        minHeight: 60
    },
    postToolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: 12
    },
    toolbarButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    toolbarText: {
        marginLeft: 6,
        color: theme.colors.primary,
        fontWeight: '600'
    },
    postButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20
    },
    postButtonDisabled: {
        backgroundColor: theme.colors.disabled
    },
    postButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    postCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: 16,
        marginBottom: 16,
        ...theme.shadows.small
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.p20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    userInfo: {
        flex: 1
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary
    },
    userLocation: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2
    },
    postContent: {
        fontSize: 15,
        color: theme.colors.text.primary,
        marginBottom: 12,
        lineHeight: 22
    },
    tagsContainer: {
        flexDirection: 'row',
        marginBottom: 12
    },
    tag: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8
    },
    tagText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '600'
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: 12
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    actionText: {
        marginLeft: 6,
        color: theme.colors.text.secondary,
        fontSize: 14
    }
});

export default CommunityScreen;
