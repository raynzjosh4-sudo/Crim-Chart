import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import UserAvatar from '@/components/avatar/UserAvatar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MoreHorizontal, Play, Plus, Tag } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { dummyMovieBoxPost } from '../../data/dummyMovieBoxData';
import { OpenBoxButton } from '../shared/OpenBoxButton';
import { MovieBoxVideoPreviewTile } from './MovieBoxVideoPreviewTile';

export const MovieBoxFeedCard = () => {
  const router = useRouter();
  const post = dummyMovieBoxPost;
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
            <Text style={styles.timeAgo}>Curated a new Video Box</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <TouchableOpacity>
            <MoreHorizontal color="rgba(255,255,255,0.6)" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cinematic Cover Art (16:9) */}
      <View style={styles.cinematicContainer}>
        <Image source={{ uri: post.box.coverImageUrl }} style={styles.coverImage} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
          style={styles.gradientOverlay}
        />

        <View style={styles.boxDetails}>
          <Text style={styles.boxTitle}>{post.box.title}</Text>
          <Text style={styles.boxDesc} numberOfLines={2}>{post.box.description}</Text>
        </View>
      </View>

      {/* Up Next / Video Preview Rail */}
      <View style={styles.upNextSection}>
        <Text style={styles.upNextHeader}>Video Preview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railContent}>
          {/* Add Yours Tile */}
          <TouchableOpacity style={styles.addYoursTile}>
            <View style={styles.addYoursIconContainer}>
              <Play size={20} color="#FFF" fill="#FFF" />
              <View style={styles.addYoursPlusBadge}>
                <Plus size={10} color="#000" strokeWidth={3} />
              </View>
            </View>
            <Text style={styles.addYoursText}>Add Yours</Text>
          </TouchableOpacity>

          {/* Mapped Videos (Max 10) */}
          {post.previewItems.slice(0, 10).map((video) => (
            <MovieBoxVideoPreviewTile key={video.id} video={video} />
          ))}

          {/* Show More Tile */}
          {post.previewItems.length > 10 && (
            <TouchableOpacity style={styles.showMoreTile} onPress={() => router.push(`/movie-box/${post.id}` as any)}>
              <MoreHorizontal size={24} color="#FFF" />
              <Text style={styles.showMoreText}>Show More</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
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

        <OpenBoxButton onPress={() => router.push(`/movie-box/${post.id}` as any)} />
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
  cinematicContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  boxDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
  },
  boxDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
  },
  upNextSection: {
    marginTop: 16,
  },
  upNextHeader: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  railContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  addYoursTile: {
    width: 140,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  addYoursIconContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  addYoursPlusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: '#FFF',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addYoursText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
  showMoreTile: {
    width: 140,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showMoreText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
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
