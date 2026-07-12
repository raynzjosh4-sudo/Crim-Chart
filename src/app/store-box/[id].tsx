import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { StorePostingPageShimmer } from '@/components/shimmers/StorePostingShimmer';
import { useBoxDetail } from '@/features/boxes/application/useBoxDetail';
import { useBoxItems } from '@/features/boxes/application/useBoxItems';
import { useBoxMembers } from '@/features/boxes/application/useBoxMembers';
import { RecentContributorsWidget } from '@/features/boxes/components/contributors/RecentContributorsWidget';
import { StoreItemTile } from '@/features/boxes/components/details/StoreItemTile';
import { StoreItem } from '@/features/boxes/data/dummyStoreBoxData';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Tag } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
export default function StoreBoxDetailPage() {
  const styles = useStyles(colors => ({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background
    },
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    listContent: {
      paddingBottom: 80
    },
    headerContainer: {
      paddingTop: 12,
      paddingBottom: 24,
      paddingHorizontal: 16
    },
    boxTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      marginBottom: 6
    },
    boxDescription: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(74, 222, 128, 0.1)',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16
    },
    statsText: {
      color: '#4ADE80',
      fontSize: 13,
      fontWeight: '800',
      marginLeft: 6
    },
    widgetWrapper: {
      marginTop: 24
    },
    widgetTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 8
    },
    footer: {
      paddingVertical: 20,
      alignItems: 'center'
    },
    emptyContainer: {
      paddingTop: 60,
      alignItems: 'center'
    },
    emptyText: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: 15
    }
  }));
  const {
    id
  } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const {
    box
  } = useBoxDetail(id as string);
  const {
    items,
    isLoading,
    isFetchingMore,
    loadMore
  } = useBoxItems(id as string);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  const { stopLoading } = useGlobalProgress();

  useEffect(() => {
    if (!isLoading) {
      stopLoading();
    }
  }, [isLoading]);

  useEffect(() => {
    console.log('[StoreBoxDetailPage] items count:', items.length);
    console.log('[StoreBoxDetailPage] raw items:', JSON.stringify(items, null, 2));
  }, [items]);

  // Map BoxItemModel → StoreItem for StoreItemTile
  const storeItems: StoreItem[] = React.useMemo(() => items.map(item => ({
    id: item.post_id,
    title: item.post.caption || 'Store Item',
    description: '',
    price: '',
    mediaUrl: item.post.mediaUrl || item.post.thumbnailUrl || '',
    seller: {
      id: item.addedBy?.id || item.post.authorId || '',
      name: item.addedBy?.name || item.post.authorName || '',
      avatarUrl: item.addedBy?.avatarUrl || item.post.authorAvatar || ''
    },
    likes: item.likes,
    commentsCount: item.post.commentsCount ?? 0,
    viewsCount: item.post.viewsCount ?? 0
  })), [items]);

  // Fetch actual members for this box
  const {
    members,
    isLoading: isLoadingMembers,
    isPaginating: isPaginatingMembers,
    loadMore: loadMoreMembers
  } = useBoxMembers(id as string);
  const displayedItems = React.useMemo(() => {
    if (!selectedSellerId) return storeItems;
    return storeItems.filter(item => item.seller?.id === selectedSellerId);
  }, [storeItems, selectedSellerId]);
  const renderHeader = () => <View style={styles.headerContainer}>
      <Text style={styles.boxTitle}>{box?.title || ''}</Text>
      {(box as any)?.raw?.description ? <Text style={styles.boxDescription}>{(box as any).raw.description}</Text> : null}

      <View style={styles.statsRow}>
        <Tag size={16} color="#4ADE80" />
        <Text style={styles.statsText}>{storeItems.length} Active Listings</Text>
      </View>

      <View style={styles.widgetWrapper}>
        <Text style={styles.widgetTitle}>Browse by Seller</Text>
        <RecentContributorsWidget contributors={members} isLoading={isLoadingMembers} isPaginating={isPaginatingMembers} onLoadMore={loadMoreMembers} selectedMemberId={selectedSellerId} onSelectMember={setSelectedSellerId} boxId={id as string} onAddPress={() => router.push(`/store-box/post/${id}`)} />
      </View>
    </View>;
  if (isLoading && items.length === 0) {
    return <StorePostingPageShimmer />;
  }
  return <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ChartAppBar title="Store Box" />

        <FlatList data={displayedItems} keyExtractor={item => item.id} ListHeaderComponent={renderHeader} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} renderItem={({
        item
      }) => <StoreItemTile item={item} boxItemId={(item as any).boxItemId || item.id} boxId={id as string} initialDislikes={(item as any).dislikes || 0} currentUserId={user?.id} />} onEndReached={loadMore} onEndReachedThreshold={0.5} ListFooterComponent={isFetchingMore ? <View style={styles.footer}>
                <ActivityIndicator color="#4ADE80" size="small" />
              </View> : null} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items in this box yet</Text>
            </View>} />
      </View>
    </SafeAreaView>;
}