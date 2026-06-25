import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VideoPost } from '../../models/VideoPost';
import { ShortVideoPlayerCard } from '@/components/video_player/ShortVideoPlayerCard';
import { CompetitorOverlay } from './CompetitorOverlay';

interface CompetitionVideoCardProps {
  video: VideoPost;
  isPlaying: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onChart?: () => void;
}

export const CompetitionVideoCard: React.FC<CompetitionVideoCardProps> = ({
  video,
  isPlaying,
  onLike,
  onComment,
  onChart,
}) => {
  return (
    <View style={styles.container}>
      <ShortVideoPlayerCard
        video={video}
        isPlaying={isPlaying}
        onLike={onLike}
        onComment={onComment}
        onChart={onChart}
      />
      {video.isCompetition && video.competitorName && (
        <CompetitorOverlay
          competitorName={video.competitorName}
          competitorAvatarUrl={video.competitorAvatarUrl}
          competitorLikes={video.competitorLikes ?? 0}
          myLikes={video.likesCount}
        />
      )}
    </View>
  );
};

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { width: '100%', height, position: 'relative' },
});
