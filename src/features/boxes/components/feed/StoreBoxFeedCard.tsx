import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { PostFooter } from '@/components/PostFooter/PostFooter';
import { PostHeader } from '@/components/PostHeader/PostHeader';
import { BoxFeedCardWrapper } from '@/components/wrappers/BoxFeedCardWrapper';
import { FeedPermissionsWrapper } from '@/components/wrappers/FeedPermissionsWrapper';
import { useStyles } from '@/core/hooks/useStyles';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { OpenBoxButton } from '../shared/OpenBoxButton';
import { StoreItemTile } from '../details/StoreItemTile';

interface Props { boxId?: string; prefetchedData?: any; }

const { width } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = 140;

export const StoreBoxFeedCard = ({ boxId, prefetchedData }: Props) => {
  const router = useRouter();
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  const handleOpenBox = () => {
    router.push(`/store-box/${boxId}` as any);
  };



  const renderAddYoursCard = () => (
    <TouchableOpacity activeOpacity={1} style={[styles.carouselItem, styles.addYoursCard]} onPress={() => router.push(`/store-box/post/${boxId}` as any)}>
      <View style={styles.addYoursImagePlaceholder}>
        <Plus color="rgba(255,255,255,0.5)" size={40} />
      </View>
      <Text style={styles.addYoursText}>Sell an Item</Text>
    </TouchableOpacity>
  );

  if (!boxId) return null;

  return (
    <BoxFeedCardWrapper boxId={boxId} prefetchedData={prefetchedData}>
      {(rawData, boxModel, ownerModel, interactionState) => {
        const rawName = ownerModel?.displayName || 'Unknown';
        
        const renderStoreItem = ({ item }: { item: any }) => (
          <StoreItemTile 
            item={item} 
            boxId={boxModel?.id || boxId}
            onLikePress={() => {
              const idToLike = item.post_id || item.id;
              if (idToLike) {
                useInteractionStore.getState().toggleLike(idToLike, boxModel?.id || boxId, 'box_items');
              }
            }}
          />
        );

        return (
          <FeedPermissionsWrapper permissions={{ canComment: true, canSubmit: boxModel?.allowSubmissions ?? true }}>
            <View style={styles.cardContainer}>
              {/* Post Header */}
              <View style={{ paddingBottom: 12, paddingTop: 4 }}>
                {ownerModel ? (
                  <PostHeader
                    author={ownerModel}
                    timeAgo="Opened a Store Box"
                    onAvatarTap={() => router.push(`/profile/${ownerModel.id}` as any)}
                  />
                ) : null}
              </View>

              {/* Box Info */}
              <View style={styles.boxInfo}>
                <Text style={styles.boxTitle}>{boxModel.title}</Text>
                <Text style={styles.boxDescription} numberOfLines={2}>{boxModel.raw?.description || ''}</Text>
              </View>

              {/* Store Items Carousel */}
              <FlatList
                data={(rawData.trendingTracks || []).slice(0, 5)} // Show top 5 in preview
                horizontal
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={renderAddYoursCard}
                keyExtractor={(item: any) => item.id}
                renderItem={renderStoreItem}
                contentContainerStyle={styles.carouselContent}
              />

              {/* Action Bar */}
              <PostFooter
                likesCount={interactionState?.likesCount ?? 0}
                isLiked={interactionState?.isLiked ?? false}
                onLikePress={() => {
                  const targetId = boxModel.postId || boxId;
                  if (targetId) {
                    useInteractionStore.getState().toggleLike(targetId, undefined, 'posts');
                  }
                }}
                commentsCount={0}
                tagsCount={0}
                isTagged={interactionState?.isTagged ?? false}
                onTagPress={() => {
                  if (boxModel.postId) {
                    setTagOverlayVisible(true);
                  }
                }}
                iconSize={24}
                rightContent={<OpenBoxButton onPress={handleOpenBox} />}
                style={{ paddingTop: 12, paddingHorizontal: 16 }}
              />

              <TagOverlay
                visible={tagOverlayVisible}
                onClose={() => setTagOverlayVisible(false)}
                postId={boxModel.postId ?? ''}
                sourceChannelId=""
                linkChain={[]}
              />
            </View>
          </FeedPermissionsWrapper>
        );
      }}
    </BoxFeedCardWrapper>
  );
}

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  cardContainer: {
    backgroundColor: colors.background,
    marginBottom: 8 * scale,
    paddingTop: 16 * scale,
    paddingBottom: 16 * scale,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16 * scale,
    marginBottom: 12 * scale,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 36 * scale,
    height: 36 * scale,
    borderRadius: 18 * scale,
    marginRight: 10 * scale,
  },
  creatorName: {
    color: colors.text,
    fontSize: 15 * scale,
    fontWeight: '700',
  },
  headerSubText: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
  },
  boxInfo: {
    paddingHorizontal: 16 * scale,
    marginBottom: 16 * scale,
  },
  boxTitle: {
    color: colors.text,
    fontSize: 22 * scale,
    fontWeight: '900',
    marginBottom: 4 * scale,
  },
  boxDescription: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
    lineHeight: 20 * scale,
  },
  carouselContent: {
    paddingHorizontal: 16 * scale,
    paddingBottom: 16 * scale,
  },
  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH * scale,
    marginRight: 12 * scale,
  },
  carouselImage: {
    width: CAROUSEL_ITEM_WIDTH * scale,
    height: CAROUSEL_ITEM_WIDTH * scale,
    borderRadius: 12 * scale,
    marginBottom: 8 * scale,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceTag: {
    position: 'absolute',
    top: 8 * scale,
    right: 8 * scale,
    backgroundColor: '#4ADE80',
    paddingHorizontal: 6 * scale,
    paddingVertical: 4 * scale,
    borderRadius: 6 * scale,
  },
  priceText: {
    color: '#000',
    fontSize: 12 * scale,
    fontWeight: '900',
  },
  itemTitle: {
    color: colors.text,
    fontSize: 13 * scale,
    fontWeight: '600',
    lineHeight: 18 * scale,
  },
  addYoursCard: {
    alignItems: 'center',
  },
  addYoursImagePlaceholder: {
    width: CAROUSEL_ITEM_WIDTH * scale,
    height: CAROUSEL_ITEM_WIDTH * scale,
    borderRadius: 12 * scale,
    marginBottom: 8 * scale,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  addYoursText: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
    fontWeight: '700',
    marginTop: 4 * scale,
  },
});
