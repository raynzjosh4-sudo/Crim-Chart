import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MoreHorizontal, Plus, Tag } from 'lucide-react-native';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StoreItem, dummyStoreBoxPost } from '../../data/dummyStoreBoxData';
import { OpenBoxButton } from '../shared/OpenBoxButton';
import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';

// Removed Props interface as we will use dummy data directly

const { width } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = 140;

export function StoreBoxFeedCard() {
  const post = dummyStoreBoxPost;
  const { id: boxId, title, description } = post.box;
  const items = post.items;
  const creator = post.creator;
  const router = useRouter();

  const handleOpenBox = () => {
    router.push(`/store-box/${boxId}` as any);
  };

  const renderStoreItem = ({ item }: { item: StoreItem }) => (
    <View style={styles.carouselItem}>
      <Image source={{ uri: item.mediaUrl }} style={styles.carouselImage} contentFit="cover" />
      <View style={styles.priceTag}>
        <Text style={styles.priceText}>{item.currency}{item.price.toLocaleString()}</Text>
      </View>
      <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
    </View>
  );

  const renderAddYoursCard = () => (
    <TouchableOpacity style={[styles.carouselItem, styles.addYoursCard]}>
      <View style={styles.addYoursImagePlaceholder}>
        <Plus color="rgba(255,255,255,0.5)" size={40} />
      </View>
      <Text style={styles.addYoursText}>Sell an Item</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.cardContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: creator.avatarUrl }} style={styles.creatorAvatar} />
          <View>
            <Text style={styles.creatorName}>{creator.name}</Text>
            <Text style={styles.headerSubText}>Opened a Store Box</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Box Info */}
      <View style={styles.boxInfo}>
        <Text style={styles.boxTitle}>{title}</Text>
        <Text style={styles.boxDescription} numberOfLines={2}>{description}</Text>
      </View>

      {/* Store Items Carousel */}
      <FlatList
        data={items.slice(0, 5)} // Show top 5 in preview
        horizontal
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={renderAddYoursCard}
        keyExtractor={(item) => item.id}
        renderItem={renderStoreItem}
        contentContainerStyle={styles.carouselContent}
      />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <LikeAction initialLikesCount={dummyStoreBoxPost.stats.likes} initialIsLiked={false} />
          <CommentActionWidget commentsCount={dummyStoreBoxPost.stats.comments} />
          <TouchableOpacity style={[styles.actionBtn, { marginLeft: 24, marginRight: 0 }]}>
            <Tag color="#FFF" size={24} />
            <Text style={styles.actionText}>{dummyStoreBoxPost.stats.shares}</Text>
          </TouchableOpacity>
        </View>

        <OpenBoxButton onPress={handleOpenBox} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#121212',
    marginBottom: 8,
    paddingTop: 16,
    paddingBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  creatorName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  headerSubText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  boxInfo: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  boxDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  carouselContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH,
    marginRight: 12,
  },
  carouselImage: {
    width: CAROUSEL_ITEM_WIDTH,
    height: CAROUSEL_ITEM_WIDTH,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4ADE80',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  itemTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  addYoursCard: {
    alignItems: 'center',
  },
  addYoursImagePlaceholder: {
    width: CAROUSEL_ITEM_WIDTH,
    height: CAROUSEL_ITEM_WIDTH,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  addYoursText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
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
