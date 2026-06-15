import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useBoxDetail } from '@/features/boxes/application/useBoxDetail';
import { RecentContributorsWidget } from '@/features/boxes/components/contributors/RecentContributorsWidget';
import { MovieBoxDetailVideoTile } from '@/features/boxes/components/details/MovieBoxDetailVideoTile';
import { dummyMovieBoxPost } from '@/features/boxes/data/dummyMovieBoxData';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function MovieBoxDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { box: fetchedBox, isLoading } = useBoxDetail(id as string);

  const post = React.useMemo(() => {
    if (!fetchedBox) return dummyMovieBoxPost;
    return {
      ...dummyMovieBoxPost,
      box: {
        ...dummyMovieBoxPost.box,
        title: fetchedBox.title,
        description: (fetchedBox as any).raw?.description || dummyMovieBoxPost.box.description,
        coverImageUrl: fetchedBox.coverImageUrl || dummyMovieBoxPost.box.coverImageUrl,
      }
    };
  }, [fetchedBox]);

  // Track the currently "playing" (visible) video
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Filter state for members
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Extract unique members from the videos list
  const uniqueMembers = React.useMemo(() => {
    const map = new Map();
    post.videos.forEach(v => {
      if (v.addedBy && !map.has(v.addedBy.id)) {
        map.set(v.addedBy.id, v.addedBy);
      }
    });
    return Array.from(map.values());
  }, [post.videos]);

  // Filter videos based on selection
  const filteredVideos = React.useMemo(() => {
    if (!selectedMemberId) return post.videos;
    return post.videos.filter(v => v.addedBy?.id === selectedMemberId);
  }, [post.videos, selectedMemberId]);

  // Handle visibility tracking to automatically mark a video as playing when scrolled into view
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveVideoId(viewableItems[0].item.id);
    }
  }).current;

  // Render the header component (Box Details + Members Widget)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Members / Filter Widget */}
      <View style={[styles.contributorsSection, { marginBottom: 24, paddingTop: 16 }]}>
        <RecentContributorsWidget
          contributors={uniqueMembers}
          selectedMemberId={selectedMemberId}
          onSelectMember={setSelectedMemberId}
          onAddPress={() => router.push(`/movie-box/post/${id}`)}
        />
      </View>

      {/* Box Info */}
      <View style={styles.boxInfoSection}>
        <Image source={{ uri: post.box.coverImageUrl }} style={styles.coverImage} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
          style={styles.gradientOverlay}
        />
        <View style={styles.boxDetailsOverlay}>
          <Text style={styles.boxTitle}>{post.box.title}</Text>
          <Text style={styles.boxDescription}>{post.box.description}</Text>
          <Text style={styles.statsText}>{post.videos.length} Videos • {post.stats.likes} Likes</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ChartAppBar title="Movie Box" />

        {isLoading ? (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color="#E50914" size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredVideos}
            keyExtractor={(item) => item.id}
            extraData={selectedMemberId}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View>
                <MovieBoxDetailVideoTile
                  video={item}
                  isPlaying={activeVideoId === item.id}
                />
                <View style={styles.divider} />
              </View>
            )}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No videos found for this member.</Text>
              </View>
            }
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
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
  },
  boxInfoSection: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  boxDetailsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  boxDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  statsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  contributorsSection: {
    marginTop: 16,
  },
  divider: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  }
});
