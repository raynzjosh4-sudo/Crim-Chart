import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert } from 'lucide-react-native';
import { JoinButton } from '@/channel/components/JoinButton';
import { colors } from '@/core/theme/colors';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { channelRepository } from '@/channel/data/channelRepository';
import { Alert } from 'react-native';

interface ChannelRestrictionOverlayProps {
    isVisible: boolean;
    title?: string;
    reason?: string;
    channelName?: string;
    channelImage?: string;
    channelId?: string;
}

export const ChannelRestrictionOverlay: React.FC<ChannelRestrictionOverlayProps> = ({ 
    isVisible, 
    title = "Access Restricted",
    reason = "You do not have permission to view this channel.",
    channelName = "Restricted Channel",
    channelImage = "https://picsum.photos/400/400?random=11",
    channelId
}) => {
    const user = useAuthStore(s => s.user);

    const handleJoinRequest = async () => {
        if (!user || !channelId) return;
        try {
            await channelRepository.createChannelRequest(channelId, user.id, 'join_request', user.id);
            Alert.alert('Success', 'Your join request has been sent successfully.');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    if (!isVisible) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ChartAppBar 
                title="" 
                showBack={true} 
                backgroundColor="transparent" 
                showBorder={false} 
                useSafeArea={false} 
            />
            <View style={styles.content}>
                <View style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: channelImage }} 
                        style={styles.avatar} 
                    />
                    <View style={styles.badgeContainer}>
                        <ShieldAlert color="#000" size={20} />
                    </View>
                </View>
                <Text style={styles.channelName}>{channelName}</Text>
                
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{reason}</Text>
            </View>
            
            <View style={styles.footer}>
                <JoinButton title="Request Join" fullWidth onPress={handleJoinRequest} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        zIndex: 9999,
        justifyContent: 'space-between',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#222',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary || '#FFD700',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#000000',
    },
    channelName: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 32,
        textAlign: 'center',
    },
    title: {
        color: colors.primary || '#FFD700',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingBottom: 24,
        width: '100%',
        paddingHorizontal: 24,
    }
});
