import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert } from 'lucide-react-native';
import { JoinButton } from '@/channel/components/JoinButton';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
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
    const theme = useCurrentTheme();
    const styles = useStyles(colors => ({
      container: {
        ...require('react-native').StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        zIndex: 9999,
        justifyContent: 'space-between' as const,
      },
      content: {
        flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, paddingHorizontal: 24,
      },
      avatarContainer: { position: 'relative' as const, marginBottom: 24 },
      avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surfaceVariant },
      badgeContainer: {
        position: 'absolute' as const, bottom: 0, right: 0,
        backgroundColor: colors.primary,
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center' as const, alignItems: 'center' as const,
        borderWidth: 4, borderColor: colors.background,
      },
      channelName: { color: colors.text, fontSize: 22, fontWeight: 'bold' as const, marginBottom: 32, textAlign: 'center' as const },
      title: { color: colors.primary, fontSize: 24, fontWeight: '900' as const, marginBottom: 16, textAlign: 'center' as const },
      message: { color: colors.textSecondary, fontSize: 16, textAlign: 'center' as const, lineHeight: 24 },
      footer: { paddingBottom: 24, width: '100%' as any, paddingHorizontal: 24 },
    }));

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
                        <ShieldAlert color={theme.colors.onPrimary} size={20} />
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
