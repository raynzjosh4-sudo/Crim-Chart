import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, MoreVertical, Play, Music, Tag } from 'lucide-react-native';
import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';

export const EliteCardWidget = ({ data }: { data: any }) => {
  const themeColor = '#FACD11';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: data.winner?.profileImageUrl || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.winnerName}>{data.winner?.displayName?.toUpperCase()}</Text>
            <Star size={16} color={themeColor} fill={themeColor} />
          </View>
          <Text style={[styles.subtitle, { color: themeColor }]}>{data.title?.toUpperCase()}</Text>
        </View>
        <TouchableOpacity>
          <MoreVertical size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Media */}
      {data.mediaType === 'audio' ? (
        <View style={styles.audioContainer}>
          <Music size={80} color={themeColor} />
          <Text style={styles.audioText}>PREMIUM AUDIO CONTENT</Text>
        </View>
      ) : data.mediaType === 'video' ? (
        <View style={styles.videoContainer}>
          <Play size={80} color="#FFF" fill="#FFF" />
        </View>
      ) : (
        <Image source={{ uri: data.mediaUrl || 'https://via.placeholder.com/400x300' }} style={styles.image} resizeMode="cover" />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.actionsRow}>
          <LikeAction initialLikesCount={data.likes || 0} initialIsLiked={data.isLiked || false} />
          <CommentActionWidget commentsCount={data.comments || 0} />
          <TouchableOpacity style={{ marginLeft: 24 }}>
            <Tag size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.creatorRow}>
          <Image
            source={{ uri: data.channelCreator?.profileImageUrl || 'https://via.placeholder.com/150' }}
            style={styles.creatorAvatar}
          />
          <Text style={styles.creatorText} numberOfLines={1}>
            Created by {data.channel?.creatorId} in {data.channel?.title}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderBottomWidth: 8,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FACD11',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  winnerName: {
    fontWeight: '900',
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  audioContainer: {
    height: 300,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFF',
    marginTop: 16,
  },
  videoContainer: {
    height: 300,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 300,
  },
  footer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  creatorText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 8,
    flex: 1,
  },
});
