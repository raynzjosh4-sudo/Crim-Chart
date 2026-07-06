import { useStyles } from "@/core/hooks/useStyles";
import { VoiceMessagePlayer } from '@/channel/pages/messages_tab/widgets/VoiceMessagePlayer';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { colors } from '@/core/theme/colors';
import { ResizeMode, Video } from 'expo-av';
import { Image as ExpoImage } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export interface CommentModel {
  id: string;
  post_id: string;
  author_id: string;
  author_username: string;
  author_avatar_url: string | null;
  text: string;
  media_url?: string | null;
  media_type?: string;
  reply_to_id?: string | null;
  created_at: string;
  likes_count: number;
  is_pending?: boolean;
}
interface CommentItemProps {
  comment: CommentModel;
  onReply?: (commentId: string, username: string) => void;
  onLike?: (commentId: string) => void;
}
export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onLike
}) => {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: '100%'
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#333',
      marginRight: 12
    },
    contentContainer: {
      flex: 1
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4
    },
    username: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 13,
      fontWeight: '600',
      marginRight: 8
    },
    timestamp: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: 12
    },
    commentText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4
    },
    commentMedia: {
      borderRadius: 12,
      marginTop: 8,
      backgroundColor: '#111',
      overflow: 'hidden'
    },
    audioPlaceholder: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginTop: 8,
      alignSelf: 'flex-start'
    },
    audioPlaceholderText: {
      color: '#FACD11',
      fontWeight: 'bold',
      fontSize: 12
    },
    actionsRow: {
      flexDirection: 'row',
      marginTop: 8,
      alignItems: 'center'
    },
    actionBtn: {
      paddingRight: 16,
      paddingVertical: 4
    },
    actionText: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: 12,
      fontWeight: '600'
    },
    likeContainer: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 4
    },
    likeBtn: {
      padding: 4
    },
    likeCount: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: 12,
      marginTop: 2
    }
  }));
  const isLiked = useInteractionStore(state => state.commentLikes[comment.id]);
  const likesCount = useInteractionStore(state => state.commentLikesCount[comment.id] ?? comment.likes_count);
  const toggleLike = useInteractionStore(state => state.toggleCommentLike);
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };
  return <View style={styles.container}>
      <ExpoImage source={comment.author_avatar_url ? {
      uri: comment.author_avatar_url
    } : require('../../../assets/images/favicon.png')} style={styles.avatar} contentFit="cover" />
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.username}>{comment.author_username}</Text>
          <Text style={styles.timestamp}>{timeAgo(comment.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>

        {comment.media_url && comment.media_type === 'image' && <ExpoImage source={{
        uri: comment.media_url
      }} style={[styles.commentMedia, {
        width: 200,
        height: 200
      }]} contentFit="cover" />}
        {comment.media_url && comment.media_type === 'video' && <Video source={{
        uri: comment.media_url
      }} style={[styles.commentMedia, {
        width: 240,
        height: 135
      }]} resizeMode={ResizeMode.COVER} useNativeControls isLooping={false} />}
        {comment.media_url && comment.media_type === 'audio' && <View style={{
        marginTop: 8,
        marginBottom: 8
      }}>
            <VoiceMessagePlayer url={comment.media_url} isMe={false} />
          </View>}

        <View style={styles.actionsRow}>
          <TouchableOpacity activeOpacity={1} onPress={() => onReply && onReply(comment.id, comment.author_username)} style={styles.actionBtn}>
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.likeContainer}>
        <TouchableOpacity onPress={() => toggleLike(comment.id)} style={styles.likeBtn} activeOpacity={0.7}>
          <Heart size={16} color={isLiked ? colors.primary : "rgba(255,255,255,0.4)"} fill={isLiked ? colors.primary : "transparent"} />
        </TouchableOpacity>
        {likesCount > 0 && <Text style={[styles.likeCount, isLiked && {
        color: colors.primary
      }]}>{likesCount}</Text>}
      </View>
    </View>;
};