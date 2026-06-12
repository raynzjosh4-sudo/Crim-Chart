import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Users } from 'lucide-react-native';

interface ChannelEndSummaryProps {
  title: string;
  imageUrl?: string;
  postCount?: number;
  followerCount?: number;
  tagsCount?: number;
  likesCount?: number;
  handle?: string;
}

export const ChannelEndSummary: React.FC<ChannelEndSummaryProps> = ({
  title,
  imageUrl,
  postCount = 0,
  followerCount = 0,
  tagsCount = 0,
  likesCount = 0,
  handle,
}) => {
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const defaultHandle = `@${title.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <View style={styles.container}>
      {/* Profile Header with overlapping avatar */}
      <View style={styles.headerStack}>
        {/* Header Background (Channel Image) */}
        <View style={styles.headerBackground}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.backgroundImage}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
              style={styles.backgroundImage}
            />
          )}
          {imageUrl && <View style={styles.darkOverlay} />}
        </View>

        {/* Profile Image */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                <Users size={40} color="#FFF" />
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.spacer} />

      {/* Title & Handle */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.handle}>{handle ?? defaultHandle}</Text>

      <View style={styles.statsSpacer} />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatItem label="Posts" value={formatCount(postCount)} />
        <View style={styles.divider} />
        <StatItem label="Followers" value={formatCount(followerCount)} />
        <View style={styles.divider} />
        <StatItem label="Tags" value={formatCount(tagsCount)} />
        <View style={styles.divider} />
        <StatItem label="Likes" value={formatCount(likesCount)} />
      </View>

      <View style={styles.endTextSpacer} />

      {/* End of feed text */}
      <Text style={styles.endText}>You've caught up with everything!</Text>
    </View>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 40,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  headerStack: {
    width: '100%',
    height: 120,
    position: 'relative',
    alignItems: 'center',
  },
  headerBackground: {
    width: '100%',
    height: 120,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  avatarContainer: {
    position: 'absolute',
    top: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    padding: 4,
    backgroundColor: '#000',
    borderRadius: 54,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  handle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  statsSpacer: {
    height: 50,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 24,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  divider: {
    height: 30,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  endTextSpacer: {
    height: 40,
  },
  endText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
  },
});
