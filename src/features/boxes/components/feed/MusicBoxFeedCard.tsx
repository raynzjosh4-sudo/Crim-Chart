import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Play, MoreHorizontal, Music, ThumbsUp, ThumbsDown, Plus, Tag } from 'lucide-react-native';
import { dummyMusicBoxPost } from '../../data/dummyMusicBoxData';
import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import UserAvatar from '@/components/avatar/UserAvatar';
import { MusicBoxTrackTile } from '../shared/MusicBoxTrackTile';
import { OpenBoxButton } from '../shared/OpenBoxButton';

export const MusicBoxFeedCard = () => {
  const router = useRouter();
  const post = dummyMusicBoxPost;
  const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(post.createdAt));

  return (
    <View style={styles.card}>
      {/* Header: User Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={{ marginRight: 12 }}>
            <UserAvatar 
              userId={post.creator.id}
              fallbackUrl={post.creator.avatarUrl}
              name={post.creator.name}
              size={40}
            />
          </View>
          <View>
            <Text style={styles.userName}>{post.creator.name}</Text>
            <Text style={styles.timeAgo}>Curated a new Audio Box</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <TouchableOpacity>
            <MoreHorizontal color="rgba(255,255,255,0.6)" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Box Content */}
      <View style={styles.boxContent}>
        <Image source={{ uri: post.box.coverImageUrl }} style={styles.coverImage} contentFit="cover" />
        
        {/* Overlay Details */}
        <View style={styles.overlay}>
          <View style={styles.boxDetails}>
            <Text style={styles.boxTitle}>{post.box.title}</Text>
            <Text style={styles.boxDesc} numberOfLines={2}>{post.box.description}</Text>
          </View>
        </View>
      </View>

      {/* Preview List (The Songs inside) */}
      <View style={styles.previewList}>
        <Text style={styles.previewHeader}>Tracklist Preview</Text>
        {post.previewItems.slice(0, 2).map((song, index) => (
          <MusicBoxTrackTile key={song.id} song={song} />
        ))}
        <TouchableOpacity style={styles.addTrackBtn}>
          <Plus size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.addTrackText}>Add your track to this Box</Text>
        </TouchableOpacity>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <LikeAction initialLikesCount={post.stats.likes} initialIsLiked={false} />
          <CommentActionWidget commentsCount={post.stats.comments} postId={post.id} />
          <TouchableOpacity style={[styles.actionBtn, { marginLeft: 24, marginRight: 0 }]}>
            <Tag color="#FFF" size={24} />
            <Text style={styles.actionText}>{post.stats.shares}</Text>
          </TouchableOpacity>
        </View>
        <OpenBoxButton onPress={() => router.push(`/music-box/${post.id}` as any)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D0D0D',
    borderBottomWidth: 8,
    borderBottomColor: '#000',
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  timeAgo: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginRight: 12,
  },
  boxContent: {
    marginHorizontal: 16,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  boxDetails: {
    justifyContent: 'flex-end',
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  boxDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  previewList: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  previewHeader: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 4,
  },
  addTrackText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
