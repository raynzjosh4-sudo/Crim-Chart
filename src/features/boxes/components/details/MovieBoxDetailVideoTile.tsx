import UserAvatar from '@/components/avatar/UserAvatar';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MessageCircle, Play, Pause, ThumbsDown, ThumbsUp, Download } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface CommentPreview {
  id: string;
  user: { id: string; name: string; avatarUrl: string; };
  text: string;
}

export interface AddedBy {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface MovieBoxDetailVideoTileProps {
  video: {
    id: string;
    title: string;
    director: string;
    thumbnailUrl: string;
    duration: string;
    likes: number;
    dislikes: number;
    commentsCount?: number;
    addedBy?: AddedBy;
    linkedFrom?: {
      id: string;
      avatarUrl: string;
      name: string;
    };
    recentComments?: CommentPreview[];
  };
  isPlaying?: boolean;
}

export const MovieBoxDetailVideoTile = ({ video, isPlaying }: MovieBoxDetailVideoTileProps) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Facebook-style Post Header */}
      <View style={styles.postHeader}>
        {video.addedBy ? (
          <View style={styles.headerLeft}>
            <UserAvatar 
              userId={video.addedBy.id} 
              fallbackUrl={video.addedBy.avatarUrl} 
              name={video.addedBy.name} 
              size={36} 
            />
            <View style={styles.postHeaderText}>
              <Text style={styles.postHeaderName}>{video.addedBy.name}</Text>
              <Text style={styles.postHeaderSub}>Added a video</Text>
            </View>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerLeft} />
        )}
        
        <TouchableOpacity style={styles.downloadBtn}>
          <Download size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* Cinematic 16:9 Video Header */}
      <TouchableOpacity
        style={styles.thumbnailContainer}
        onPress={() => {}}
        activeOpacity={0.8}
      >
        <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumbnail} contentFit="cover" />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        <View style={[styles.playOverlay, isPlaying && styles.playingOverlay]}>
          {isPlaying ? (
            <Pause size={24} color="#FFF" fill="#FFF" />
          ) : (
            <Play size={24} color="#FFF" fill="#FFF" />
          )}
        </View>
        
        {/* Avatar of the original user if the track was linked from somewhere */}
        {video.linkedFrom && (
          <View style={styles.linkedFromBadge}>
            <UserAvatar 
              userId={video.linkedFrom.id} 
              fallbackUrl={video.linkedFrom.avatarUrl} 
              name={video.linkedFrom.name} 
              size={36} 
            />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{video.title}</Text>
        <Text style={styles.videoDirector}>Directed by {video.director}</Text>
      </View>

      {/* Inline Comments Preview (Before Action Bar) */}
      {video.recentComments && video.recentComments.length > 0 && (
        <View style={styles.commentsContainer}>
          {video.recentComments.slice(0, 2).map(comment => (
            <View key={comment.id} style={styles.commentRow}>
              <UserAvatar
                userId={comment.user.id}
                fallbackUrl={comment.user.avatarUrl}
                name={comment.user.name}
                size={20}
              />
              <Text style={styles.commentText} numberOfLines={2}>
                <Text style={styles.commentUser}>{comment.user.name} </Text>
                {comment.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Facebook-style Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn}>
          <ThumbsUp size={24} color="#FFF" />
          <Text style={styles.actionText}>{video.likes > 0 ? video.likes : 'Like'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <ThumbsDown size={24} color="#FFF" />
          <Text style={styles.actionText}>{video.dislikes > 0 ? video.dislikes : 'Dislike'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle size={24} color="#FFF" />
          <Text style={styles.actionText}>{video.commentsCount ? `${video.commentsCount} Comments` : 'Comment'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  playOverlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    transform: [{ scale: 1.1 }],
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postHeaderText: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  postHeaderName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  postHeaderSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  followBtn: {
    marginLeft: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  followBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkedFromBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#000',
  },
  videoInfo: {
    width: '100%',
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  videoDirector: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  commentsContainer: {
    marginTop: 12,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  commentUser: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  commentText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginLeft: 8,
  }
});
