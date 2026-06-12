import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Play } from 'lucide-react-native';

interface PostPreview {
  id: string;
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
  isVideo?: boolean;
  authorName: string;
  authorAvatarUrl?: string;
  timeAgo: string;
}

interface ThumbnailLinkCardProps {
  post: PostPreview;
  onTap?: () => void;
}

export const ThumbnailLinkCard: React.FC<ThumbnailLinkCardProps> = ({ post, onTap }) => {
  const previewUrl = post.imageUrl ?? post.videoUrl;

  return (
    <TouchableOpacity style={styles.card} onPress={onTap} activeOpacity={0.85}>
      {/* Author row */}
      <View style={styles.authorRow}>
        <View style={styles.avatar}>
          {post.authorAvatarUrl ? (
            <Image source={{ uri: post.authorAvatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarFallback}>👤</Text>
          )}
        </View>
        <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
        <Text style={styles.timeAgo}>{post.timeAgo}</Text>
      </View>

      {/* Content preview */}
      <View style={styles.content}>
        {previewUrl ? (
          <View style={styles.thumb}>
            <Image source={{ uri: previewUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            {post.isVideo && (
              <View style={styles.playOverlay}>
                <Play color="#FFF" size={22} fill="#FFF" />
              </View>
            )}
          </View>
        ) : null}
        <View style={{ flex: 1, padding: 10 }}>
          {post.caption ? (
            <Text style={styles.caption} numberOfLines={previewUrl ? 3 : 5}>{post.caption}</Text>
          ) : (
            <Text style={styles.viewOriginal}>View original content</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: { fontSize: 12 },
  authorName: { flex: 1, color: '#FFF', fontWeight: '700', fontSize: 12 },
  timeAgo: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
  content: { flexDirection: 'row' },
  thumb: { width: 100, height: 100, backgroundColor: '#1A1A1A', position: 'relative' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  caption: { color: '#FFF', fontSize: 13, lineHeight: 18 },
  viewOriginal: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontStyle: 'italic' },
});
