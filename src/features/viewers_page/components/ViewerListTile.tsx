import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import UserAvatar from '@/components/avatar/UserAvatar';
import { ViewProfileButton } from '@/components/buttons/ViewProfileButton';

export interface ViewerListTileProps {
  userId: string;
  name: string;
  avatarUrl: string | null;
  viewedAtText: string;
  isOnline?: boolean;
  hasStatus?: boolean;
  statusSegmentCount?: number;
  viewedStatuses?: any[];
  onPress?: () => void;
}

export const ViewerListTile: React.FC<ViewerListTileProps> = ({
  userId,
  name,
  avatarUrl,
  viewedAtText,
  isOnline,
  hasStatus,
  statusSegmentCount,
  viewedStatuses,
  onPress,
}) => {
  const { colors } = useTheme();

  // Helper to extract a single visual thumbnail URL from the status
  const getThumbnailUrl = (status: any) => {
    if (status.thumbnail_url) return status.thumbnail_url;
    if (status.video_url) return null; // Wait for thumbnail_url ideally
    
    const imgUrls = status.image_urls;
    if (imgUrls) {
      if (Array.isArray(imgUrls) && imgUrls.length > 0) return imgUrls[0];
      if (typeof imgUrls === 'string') {
        try {
          const parsed = JSON.parse(imgUrls);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } catch {
          return imgUrls;
        }
      }
    }
    return null;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, { borderBottomColor: colors.border }]}
    >
      <View style={styles.avatarContainer}>
        <UserAvatar
          userId={userId}
          name={name}
          fallbackUrl={avatarUrl}
          size={50}
          forceOnline={isOnline}
          forceHasStatus={hasStatus}
          forceStatusCount={statusSegmentCount}
        />
      </View>

      {/* User Info & Viewed Statuses */}
      <View style={styles.infoContainer}>
        <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        
        {viewedStatuses && viewedStatuses.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
            {viewedStatuses.map((status: any, idx: number) => {
              const thumbUrl = getThumbnailUrl(status);
              const isText = status.type === 'text' || (!thumbUrl && !status.video_url);

              return (
                <View key={status.id || idx} style={styles.statusThumbContainer}>
                  {thumbUrl ? (
                    <Image source={{ uri: thumbUrl }} style={styles.statusThumb} />
                  ) : (
                    <View style={[styles.statusThumb, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>
                        {isText ? 'Aa' : '🎥'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={[styles.viewedAtText, { color: colors.text }]} numberOfLines={1}>
            Viewed {viewedAtText}
          </Text>
        )}
      </View>

      {/* Trailing Button */}
      <View style={styles.trailingContainer}>
        <ViewProfileButton 
          onPress={() => {
            if (onPress) onPress();
          }} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarContainer: {
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  viewedAtText: {
    fontSize: 13,
    opacity: 0.6,
  },
  trailingContainer: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
  statusThumbContainer: {
    marginRight: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  statusThumb: {
    width: 24,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#333',
  },
});
