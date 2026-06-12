import { mockMoments, mockVideos } from '@/data/mockVideoData';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { VideoCard } from './widgets/VideoCard';
import { VideoPromotionBanner } from './widgets/VideoPromotionBanner';
import { VideoTabShimmer } from './widgets/VideoTabShimmer';

interface VideoTabViewProps {
  channelId?: string;
  channelName?: string;
  channelTitle?: string;
  isLoading?: boolean;
}

const HEIGHTS = [220, 300, 260, 340, 210, 290, 250, 320, 230, 310, 270, 350];

export const VideoTabView: React.FC<VideoTabViewProps> = ({
  channelId,
  channelName,
  channelTitle,
  isLoading = false,
}) => {
  const navigation = useNavigation() as any;
  const moments = mockMoments;
  const videos = mockVideos;

  if (isLoading) {
    return <VideoTabShimmer />;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VideoPromotionBanner
          channelName={channelName}
          channelTitle={channelTitle}
          onPostMoment={() => {
            navigation.navigate('FirstPostMainPage', { isMoment: true });
          }}
          moments={moments}
        />

        {videos.length === 0 ? (
          <View style={styles.noVideosContainer}>
            <Text style={styles.noVideosText}>No videos yet</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            <View style={styles.column}>
              {videos.filter((_, i) => i % 2 === 0).map((video, index) => {
                const globalIndex = index * 2;
                return (
                  <View key={video.id} style={styles.cardWrapper}>
                    <VideoCard
                      video={video}
                      height={HEIGHTS[globalIndex % HEIGHTS.length]}
                      index={globalIndex}
                      allVideos={videos}
                    />
                  </View>
                );
              })}
            </View>
            <View style={styles.column}>
              {videos.filter((_, i) => i % 2 !== 0).map((video, index) => {
                const globalIndex = index * 2 + 1;
                return (
                  <View key={video.id} style={styles.cardWrapper}>
                    <VideoCard
                      video={video}
                      height={HEIGHTS[globalIndex % HEIGHTS.length]}
                      index={globalIndex}
                      allVideos={videos}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 20,
    gap: 8,
  },
  column: {
    flex: 1,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  noVideosContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideosText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
  },
});
