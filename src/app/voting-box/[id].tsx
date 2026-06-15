import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { dummyVotingBoxPost } from '@/features/boxes/data/dummyVotingBoxData';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { VotingGridTile } from '@/features/boxes/components/details/VotingGridTile';
import { RecentContributorsWidget } from '@/features/boxes/components/contributors/RecentContributorsWidget';
import { Plus } from 'lucide-react-native';
import { useBoxDetail } from '@/features/boxes/application/useBoxDetail';
import { ActivityIndicator } from 'react-native';
import { CreatorActionWrapper } from '@/features/boxes/components/details/CreatorActionWrapper';

export default function VotingBoxDetailPage() {
  const { id } = useLocalSearchParams();
  
  const { box: fetchedBox, isLoading } = useBoxDetail(id as string);

  const post = React.useMemo(() => {
    if (!fetchedBox) return dummyVotingBoxPost;
    return {
      ...dummyVotingBoxPost,
      box: {
        ...dummyVotingBoxPost.box,
        title: fetchedBox.title,
        description: (fetchedBox as any).raw?.description || dummyVotingBoxPost.box.description,
        coverImageUrl: fetchedBox.coverImageUrl || dummyVotingBoxPost.box.coverImageUrl,
      }
    };
  }, [fetchedBox]);

  const [selectedMemberId, setSelectedMemberId] = React.useState(null as string | null);

  // Extract unique members from the items
  const uniqueMembers = React.useMemo(() => {
    const map = new Map();
    post.items.forEach(item => {
      if (item.addedBy && !map.has(item.addedBy.id)) {
        map.set(item.addedBy.id, item.addedBy);
      }
    });
    return Array.from(map.values());
  }, [post.items]);

  // Ensure items are sorted by score highest to lowest
  const sortedItems = React.useMemo(() => {
    let filtered = [...post.items];
    if (selectedMemberId) {
      filtered = filtered.filter(item => item.addedBy?.id === selectedMemberId);
    }
    return filtered.sort((a, b) => b.score - a.score);
  }, [post.items, selectedMemberId]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.boxTitle}>{post.box.title}</Text>
      <Text style={styles.boxDescription}>{post.box.description}</Text>
      
      <View style={styles.widgetWrapper}>
        <RecentContributorsWidget 
          contributors={uniqueMembers}
          selectedMemberId={selectedMemberId}
          onSelectMember={setSelectedMemberId}
        />
      </View>
    </View>
  );

  const handleAddPress = () => {
    // TODO: Implement navigation or modal to add data to this box
    console.log('Add data pressed for box id:', id);
  };

  return (
    <CreatorActionWrapper 
      ownerId={(fetchedBox as any)?.raw?.owner_id} 
      onAddPress={handleAddPress}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ChartAppBar title="Leaderboard" />

          {isLoading ? (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator color="#9C27B0" size="large" />
            </View>
          ) : (
            <FlatList
              data={sortedItems}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={renderHeader}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              renderItem={({ item, index }) => (
                <VotingGridTile item={item} rank={index + 1} />
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </CreatorActionWrapper>
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
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  boxDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 18,
  },
  widgetWrapper: {
    marginTop: 12,
    marginLeft: -16, 
  },
});
