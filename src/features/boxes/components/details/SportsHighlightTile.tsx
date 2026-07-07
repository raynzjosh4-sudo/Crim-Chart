import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { SportsHighlight } from '../../data/dummySportsBoxData';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import { PostFooter } from '@/components/PostFooter/PostFooter';
import UserAvatar from '@/components/avatar/UserAvatar';

interface Props {
  highlight: SportsHighlight;
}

const { width } = Dimensions.get('window');

export function SportsHighlightTile({ highlight }: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UserAvatar 
          userId={highlight.addedBy.id}
          fallbackUrl={highlight.addedBy.avatarUrl}
          name={highlight.addedBy.name}
          size={36}
        />
        <View style={styles.headerText}>
          <Text style={styles.userName}>{highlight.addedBy.name}</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>{highlight.timestamp}</Text>
          </View>
        </View>
      </View>

      {/* Media */}
      <View style={styles.mediaContainer}>
        <Image source={{ uri: highlight.mediaUrl }} style={styles.media} contentFit="cover" />
        {highlight.mediaType === 'video' && (
          <View style={styles.playOverlay}>
            <Play fill="#FFF" color="#FFF" size={40} />
          </View>
        )}
      </View>

      {/* Info & Action Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{highlight.title}</Text>
        
        {/* Interaction Bar */}
        <PostFooter
          likesCount={highlight.likes}
          commentsCount={highlight.commentsCount}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  headerText: {
    marginLeft: 10,
  },
  userName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  timeBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  timeBadgeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '800',
  },
  mediaContainer: {
    width: width,
    height: width * 1.2, // Taller portrait ratio
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 16,
  },
});
