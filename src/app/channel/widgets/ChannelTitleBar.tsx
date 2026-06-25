import { ChevronLeft } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AppAvatar from '@/components/avatar/AppAvatar';

interface ChannelTitleBarProps {
  title: string;
  channelImageUrl?: string | null;
  onBackPress?: () => void;
}

export const ChannelTitleBar: React.FC<ChannelTitleBarProps> = ({
  title,
  channelImageUrl,
  onBackPress
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {onBackPress && (
          <TouchableOpacity activeOpacity={1} style={styles.backButton} onPress={onBackPress}>
            <ChevronLeft size={28} color="#FFF" />
          </TouchableOpacity>
        )}
        {channelImageUrl && (
          <AppAvatar imageUrl={channelImageUrl} size={36} style={{ marginRight: 12 }} />
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    flex: 1,
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function IgnoredRoute() { return null; }
