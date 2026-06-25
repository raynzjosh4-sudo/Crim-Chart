import { CrimChatUser } from '@/app/user/_usertypemodel';
import AppAvatar from '@/components/avatar/AppAvatar';
import { MessageSquare } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/activeUserBar.styles';

// Sub-component to manage individual user animations cleanly
export const UserAvatar: React.FC<{ user: CrimChatUser; onPress?: (u: CrimChatUser) => void }> = ({ user, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(user.isTyping ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: user.isTyping ? 1 : 0,
            duration: 250,
            easing: Easing.out(Easing.back(1.5)), // Nice popping effect when appearing
            useNativeDriver: true,
        }).start();
    }, [user.isTyping]);

    return (
        <TouchableOpacity activeOpacity={0.8} style={styles.userItem} onPress={() => onPress?.(user)}>
            <View style={styles.avatarContainer}>
                <AppAvatar
                    imageUrl={user.profileImageUrl}
                    size={46} // Matches previous size roughly, or can be dynamic
                    hasStatus={user.hasStatus}
                    statusSegmentCount={user.statusCount || 1}
                    isOnline={false} // We handle the online dot locally below to coordinate with typing
                    onTap={() => onPress?.(user)}
                />

                {/* Animated Typing Badge on the Top Right */}
                <Animated.View style={[styles.typingBadge, { transform: [{ scale: scaleAnim }] }]}>
                    <MessageSquare size={10} color="#000" fill="#000" />
                </Animated.View>

                {/* Online Dot (Only shown if NOT typing to avoid overlap, placed bottom right) */}
                {user.isOnline && !user.isTyping && (
                    <View style={styles.onlineDot} />
                )}
            </View>
            <Text style={styles.userName} numberOfLines={1}>
                {user.username}
            </Text>
        </TouchableOpacity>
    );
};
