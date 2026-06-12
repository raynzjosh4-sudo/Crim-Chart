import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/core/theme/colors';
import { useExploreChannels } from '@/channel/hooks/useExploreChannels';
import { useRouter } from 'expo-router';
import { X, CheckCircle2 } from 'lucide-react-native';
import { ChannelEngagementWrapper } from '@/components/wrappers/ChannelEngagementWrapper';
import { useEffect } from 'react';

interface DiscoverChannelWidgetProps {
  userId?: string;
  channelCount?: number;
}

export const DiscoverChannelWidget: React.FC<DiscoverChannelWidgetProps> = ({ userId, channelCount = 0 }) => {
  const { channels, isLoading: loading, loadMore } = useExploreChannels(userId);
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      loadMore(true);
    }
  }, [userId]);

  if (loading && channels.length === 0) {
    return (
      <View style={[styles.container, { paddingVertical: 20 }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (channels.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Channels</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{channelCount > 0 ? channelCount : channels.length}</Text>
        </View>
      </View>

      <FlatList
        data={channels}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton}>
              <X size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cardContent}
              onPress={() => router.push(`/channel/${item.id}` as any)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.channelIcon} />
              <View style={styles.nameRow}>
                <Text style={styles.channelName} numberOfLines={1}>{item.title}</Text>
              </View>
              <Text style={styles.suggestedText} numberOfLines={1}>
                {item.description || 'No description available'}
              </Text>
            </TouchableOpacity>
            
            <View style={{ width: '100%', alignItems: 'center', marginTop: 12 }}>
              <ChannelEngagementWrapper 
                channelId={item.id} 
                joinMethod={item.joinMethod || 'public'} 
                creatorId={item.creatorId || ''} 
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  countText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  listPadding: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 220,
    minHeight: 260,
    backgroundColor: '#0D0D0D', // Scaffold bg color
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 12,
    zIndex: 10,
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  channelIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 14,
    backgroundColor: '#1A1A1A',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
    maxWidth: 150,
  },
  suggestedText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400',
    textAlign: 'center',
  },
  joinButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});
