import { Image, Text, View } from "react-native";
import { useChannelStyles } from "../styles/_channelStyyles.styles";
import { JoinButton } from '@/channel/components/JoinButton';
import { useCurrentTheme } from '@/core/store/useThemeStore';

export interface InviteCardWidgetProps {
    channelName?: string;
    channelDescription?: string;
    channelImageUrl?: string;
    creatorImageUrl?: string;
}

// Invite Card Widget
export const InviteCardWidget = ({ channelName, channelDescription, channelImageUrl, creatorImageUrl }: InviteCardWidgetProps) => {
    const styles = useChannelStyles();
    const theme = useCurrentTheme();
    
    return (
        <View style={[styles.feedPostContainer, { padding: 0 }]}>
            <View style={[styles.inviteCard, { flexDirection: 'column', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 0 }]}>
                <Text style={{ position: 'absolute', top: 16, left: 16, color: theme.colors.textSecondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Invite</Text>
                <View style={{ position: 'relative', marginBottom: 16 }}>
                    <Image 
                        source={{ uri: channelImageUrl || 'https://picsum.photos/400/400?random=11' }} 
                        style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.surfaceVariant }} 
                    />
                    <Image 
                        source={{ uri: creatorImageUrl || 'https://i.pravatar.cc/150?img=33' }} 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0, 
                            width: 40, 
                            height: 40, 
                            borderRadius: 20, 
                            backgroundColor: theme.colors.surfaceVariant,
                            borderWidth: 4,
                            borderColor: theme.colors.surface
                        }} 
                    />
                </View>
                <Text style={[styles.inviteChannelTitle, { textAlign: 'center', fontSize: 18, marginBottom: 4 }]} numberOfLines={1}>{channelName || 'Unknown Channel'}</Text>
                <Text style={[styles.inviteChannelSub, { textAlign: 'center', marginBottom: 24 }]} numberOfLines={2}>{channelDescription || 'No description available.'}</Text>
                
                <JoinButton fullWidth />
            </View>
        </View>
    );
};

export default function IgnoredRoute() { return null; }
