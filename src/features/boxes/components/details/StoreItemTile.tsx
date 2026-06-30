import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import UserAvatar from '@/components/avatar/UserAvatar';
import { FollowUserButton } from '@/components/FollowUserButton';
import { AnimatedPostButton } from '@/components/buttons/AnimatedPostButton';
import { BoxReactions } from '@/components/reactions/BoxReactions';
import { CommentAction } from '@/features/feed/components/CommentAction';
import { Image } from 'expo-image';
import { Check, Eye, MessageCircle, Tag } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StoreItem } from '../../data/dummyStoreBoxData';

import { useAuthStore } from '@/features/auth/application/useAuthStore';

interface Props {
  item: StoreItem;
  // Live interaction values passed down from PostInteractionWrapper
  likesCount?: number;
  isLiked?: boolean;
  viewsCount?: number;
  onLikePress?: () => void;
  // Existing posting actions
  onPostPress?: (updatedItem: any) => void;
  onTagPress?: () => void;
  isTagged?: boolean;
  // Box detail mode props (mirrors MovieBoxDetailVideoTile)
  boxItemId?: string;
  boxId?: string;
  initialDislikes?: number;
  currentUserId?: string;
  onCommentPress?: (postId: string) => void;
}

const { width } = Dimensions.get('window');

export function StoreItemTile({ item, likesCount, isLiked, viewsCount, onLikePress, onPostPress, onTagPress, isTagged, boxItemId, boxId, initialDislikes, currentUserId, onCommentPress }: Props) {
  const currentUser = useAuthStore(state => state.user);
  const isLocal = item.seller.id === 'local_user';

  const displayAvatar = isLocal && currentUser?.profileImageUrl ? currentUser.profileImageUrl : item.seller.avatarUrl;
  const displayName = isLocal && (currentUser?.displayName || currentUser?.username) ? (currentUser.displayName || currentUser.username) : item.seller.name;

  const [title, setTitle] = useState(item.title);
  const [price, setPrice] = useState(item.price || '');
  const [description, setDescription] = useState(item.description);

  useEffect(() => {
    setTitle(item.title);
    setPrice(item.price || '');
    setDescription(item.description);
  }, [item]);

  return (
    <View style={styles.container}>
      {/* Seller Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <UserAvatar
            size={36}
            userId={item.seller.id || ''}
            fallbackUrl={displayAvatar}
            name={displayName || undefined}
          />
          <View style={styles.headerText}>
            <Text style={styles.sellerName}>{displayName}</Text>
          </View>
        </View>

        {!isLocal && item.seller.id && (
          <FollowUserButton
            targetUserId={item.seller.id}
            size="small"
            style={{ flex: 0, height: 32, marginLeft: 12 }}
          />
        )}
      </View>

      {/* Image */}
      <Image source={{ uri: item.mediaUrl }} style={styles.image} contentFit="cover" />

      {/* Info & Action Section */}
      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          {isLocal ? (
            <TextInput
              style={[styles.title, styles.inputField, { marginRight: 12, flex: 1 }]}
              value={title}
              onChangeText={setTitle}
              selectionColor="#FACD11"
            />
          ) : (
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          )}

          {isLocal ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(74,222,128,0.3)' }}>
              <TextInput
                style={[styles.priceText, { padding: 0, margin: 0, minWidth: 60 }]}
                value={price}
                onChangeText={setPrice}
                selectionColor="#4ADE80"
              />
            </View>
          ) : (
            <Text style={styles.priceText}>{item.price}</Text>
          )}
        </View>

        {isLocal ? (
          <TextInput
            style={[styles.description, styles.inputField]}
            value={description}
            onChangeText={setDescription}
            selectionColor="#FACD11"
            multiline
          />
        ) : (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}

        {/* Interaction Bar */}
        <View style={styles.actionBar}>
          {boxItemId ? (
            // ── In-box mode: reuse BoxReactions exactly like MovieBoxDetailVideoTile ──
            <>
              <BoxReactions
                boxItemId={boxItemId}
                postId={item.id}
                boxId={boxId}
                initialLikes={likesCount ?? item.likes ?? 0}
                initialDislikes={initialDislikes ?? 0}
                currentUserId={currentUserId}
              />
              <View style={styles.actionBtn}>
                <CommentAction
                  icon={MessageCircle}
                  label={(item.commentsCount ?? 0).toString()}
                  size={24}
                  direction="row"
                  onPress={() => item.id && onCommentPress?.(item.id)}
                />
              </View>
              <View style={[styles.actionBtn, { marginLeft: 'auto', marginRight: 0 }]}>
                <Eye size={24} color="#FFF" />
                <Text style={styles.actionText}>{viewsCount ?? item.viewsCount ?? 0}</Text>
              </View>
            </>
          ) : (
            // ── Posting mode: existing actions ──
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LikeAction
                  initialLikesCount={likesCount ?? item.likes ?? 0}
                  initialIsLiked={isLiked ?? false}
                  onLikeTap={onLikePress}
                />
                <CommentActionWidget postId={item.id} commentsCount={item.commentsCount ?? 0} />
                <View style={{ marginLeft: 8 }}>
                  <CommentAction
                    icon={Eye}
                    label={(viewsCount ?? item.viewsCount ?? 0).toString()}
                    size={20}
                    direction="row"
                  />
                </View>
              </View>
              {isLocal ? (
                <AnimatedPostButton
                  title="Post"
                  style={styles.postButton}
                  textStyle={styles.postButtonText}
                  onPress={async () => {
                    if (onPostPress) {
                      onPostPress({ ...item, title, price, description });
                    }
                  }}
                />
              ) : (
                <TouchableOpacity activeOpacity={1}
                  style={[styles.tagButton, isTagged && styles.tagButtonAdded]}
                  onPress={onTagPress}
                >
                  {isTagged ? (
                    <>
                      <Check size={12} color="#000" style={{ marginRight: 6 }} />
                      <Text style={[styles.tagButtonText, { color: '#000' }]}>Tagged</Text>
                    </>
                  ) : (
                    <>
                      <Tag size={12} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.tagButtonText}>Tag</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
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
    justifyContent: 'space-between',
    padding: 12,
  },
  headerText: {
    marginLeft: 10,
  },
  sellerName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  image: {
    width: width,
    height: width, // Square full width
  },
  infoContainer: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 2,
    marginBottom: 4,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  priceText: {
    color: '#4ADE80',
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12,
  },
  postButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12,
  },
  tagButtonAdded: {
    backgroundColor: '#FFFFFF',
  },
  tagButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
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
});
