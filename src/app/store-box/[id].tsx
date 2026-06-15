import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { RecentContributorsWidget } from '@/features/boxes/components/contributors/RecentContributorsWidget';
import { StoreItemTile } from '@/features/boxes/components/details/StoreItemTile';
import { dummyStoreBoxPost } from '@/features/boxes/data/dummyStoreBoxData';
import { useLocalSearchParams } from 'expo-router';
import { Tag } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useBoxDetail } from '@/features/boxes/application/useBoxDetail';

export default function StoreBoxDetailPage() {
  const { id } = useLocalSearchParams();
  
  const { box: fetchedBox, isLoading } = useBoxDetail(id as string);

  const post = React.useMemo(() => {
    if (!fetchedBox) return dummyStoreBoxPost;
    return {
      ...dummyStoreBoxPost,
      box: {
        ...dummyStoreBoxPost.box,
        title: fetchedBox.title,
        description: (fetchedBox as any).raw?.description || dummyStoreBoxPost.box.description,
        coverImageUrl: fetchedBox.coverImageUrl || dummyStoreBoxPost.box.coverImageUrl,
      }
    };
  }, [fetchedBox]);

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Extract unique sellers from the items
  const uniqueSellers = React.useMemo(() => {
    const map = new Map();
    post.items.forEach(item => {
      if (item.seller && !map.has(item.seller.id)) {
        map.set(item.seller.id, item.seller);
      }
    });
    return Array.from(map.values());
  }, [post.items]);

  const displayedItems = React.useMemo(() => {
    if (!selectedSellerId) return post.items;
    return post.items.filter(item => item.seller?.id === selectedSellerId);
  }, [post.items, selectedSellerId]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.boxTitle}>{post.box.title}</Text>
      <Text style={styles.boxDescription}>{post.box.description}</Text>

      <View style={styles.statsRow}>
        <Tag size={16} color="#4ADE80" />
        <Text style={styles.statsText}>{post.stats.activeListings} Active Listings</Text>
      </View>

      <View style={styles.widgetWrapper}>
        <Text style={styles.widgetTitle}>Browse by Seller</Text>
        <RecentContributorsWidget
          contributors={uniqueSellers}
          selectedMemberId={selectedSellerId}
          onSelectMember={setSelectedSellerId}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ChartAppBar title="Store Box" />

        {isLoading ? (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color="#4ADE80" size="large" />
          </View>
        ) : (
          <FlatList
            data={displayedItems}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <StoreItemTile item={item} />}
        />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    paddingBottom: 80,
  },
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  boxDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsText: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  widgetWrapper: {
    marginTop: 24,
  },
  widgetTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
});
