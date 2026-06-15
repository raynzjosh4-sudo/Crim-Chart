import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import UserAvatar from '@/components/avatar/UserAvatar';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MoreHorizontal, Play, Plus, Tag, Trophy } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { dummySportsBoxPost } from '../../data/dummySportsBoxData';
import { OpenBoxButton } from '../shared/OpenBoxButton';

export const SportsBoxFeedCard = () => {
  const router = useRouter();
  const post = dummySportsBoxPost;
  const topHighlight = post.highlights[0];

  return (
    <View style={styles.card}>
      {/* Post Header */}
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
            <Text style={styles.timeAgo}>Started a Live Sports Box</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MoreHorizontal color="rgba(255,255,255,0.6)" size={20} />
        </TouchableOpacity>
      </View>

      {/* Middle Row: Scoreboard + Add Button */}
      <View style={styles.middleSectionRow}>
        {/* Compact Live Scoreboard */}
        <View style={styles.scoreboardContainer}>
          <View style={styles.teamColumn}>
            <View style={[styles.teamLogo, { backgroundColor: post.matchStats.homeTeam.logoColor }]} />
            <Text style={styles.teamName}>{post.matchStats.homeTeam.name}</Text>
          </View>
          
          <View style={styles.scoreCenter}>
            <Text style={styles.scoreText}>
              {post.matchStats.homeTeam.score} - {post.matchStats.awayTeam.score}
            </Text>
            <View style={styles.liveBadgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.periodText}>{post.matchStats.period} {post.matchStats.timeRemaining}</Text>
            </View>
          </View>

          <View style={styles.teamColumn}>
            <Text style={styles.teamName}>{post.matchStats.awayTeam.name}</Text>
            <View style={[styles.teamLogo, { backgroundColor: post.matchStats.awayTeam.logoColor }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.addBtnTop}>
          <Plus size={14} color="#FFF" />
          <Text style={styles.addTextTop}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Box Description */}
      <View style={styles.descContainer}>
        <Text style={styles.boxTitle}>{post.box.title}</Text>
      </View>

      {/* Featured Highlight */}
      <TouchableOpacity
        style={styles.featuredHighlight}
        activeOpacity={0.9}
        onPress={() => router.push(`/sports-box/${post.id}` as any)}
      >
        <Image source={{ uri: topHighlight.mediaUrl }} style={styles.highlightImage} contentFit="cover" />
        <View style={styles.highlightOverlay}>
          <View style={styles.highlightBadge}>
            <Trophy size={14} color="#FFF" />
            <Text style={styles.highlightBadgeText}>Top Play</Text>
          </View>
          <View style={styles.playIconContainer}>
            <Play fill="#FFF" color="#FFF" size={32} />
          </View>
          <View style={styles.highlightInfo}>
            <Text style={styles.highlightTitle} numberOfLines={2}>{topHighlight.title}</Text>
            <Text style={styles.highlightAddedBy}>Added by {topHighlight.addedBy.name}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <LikeAction initialLikesCount={post.stats.likes} initialIsLiked={false} />
          <CommentActionWidget commentsCount={post.stats.comments} postId={post.id} />
          <TouchableOpacity style={[styles.actionBtn, { marginLeft: 24 }]}>
            <Tag color="#FFF" size={24} />
            <Text style={styles.actionText}>{post.stats.shares}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightActions}>
          <OpenBoxButton onPress={() => router.push(`/sports-box/${post.id}` as any)} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D0D0D',
    borderBottomWidth: 8,
    borderBottomColor: '#000',
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
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
  middleSectionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  scoreboardContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  addBtnTop: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addTextTop: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  teamColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  teamName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginHorizontal: 8,
  },
  scoreCenter: {
    alignItems: 'center',
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  periodText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  descContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  featuredHighlight: {
    marginHorizontal: 16,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  highlightImage: {
    width: '100%',
    height: '100%',
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 16,
  },
  highlightBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  highlightBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  highlightInfo: {
    justifyContent: 'flex-end',
  },
  highlightTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  highlightAddedBy: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
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
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
