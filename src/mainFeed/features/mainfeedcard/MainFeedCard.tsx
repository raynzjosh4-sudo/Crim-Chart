import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MainFeedCardModel, MainFeedCardType } from '../../models/MainFeedCardTypeModel';
import { ChannelPostModel } from '../../models/ChannelPostModel';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { Mainfeedcard } from './subfeedCards/Mainfeedcard';
import { ChannelsWidget } from '../charts_stars/ChannelsWidget';
import { ThumbnailLinkCard } from './ThumbnailLinkCard';
import { ChannelAndFeedPostModel } from '@/channel/ChannelComponents/ChnnelMainPostCard/ChannelAndFeedPostModel';
import { StoryListWidget } from '@/components/statuspagesAndWidgets/StoryListWidget';
import { EliteCardWidget } from '@/components/hiness/EliteCardWidget';
import { UserRecommendationCarousel } from '../../pages/main_page_widgets/UserRecommendationCarousel';

interface MainFeedCardProps {
  card: MainFeedCardModel;
  isActive?: boolean;
}

export const MainFeedCard: React.FC<MainFeedCardProps> = ({ card, isActive }) => {
  switch (card.cardType) {
    case MainFeedCardType.commonChart:
      return <Mainfeedcard data={card.itemData as CrimChartUserModel} />;

    case MainFeedCardType.channels:
    case MainFeedCardType.discoverTops:
      return <ChannelsWidget models={card.itemData as CrimChartUserModel[]} />;

    case MainFeedCardType.channelPost:
    case MainFeedCardType.socialPost: {
      const data = card.itemData as ChannelPostModel;
      if (!data || !data.author) return null;
      return (
        <ChannelAndFeedPostModel
          content={data.caption || ''}
          timeAgo={data.timeAgo || ''}
          imageUrl={data.imageUrls?.[0]}
          imageUrls={data.imageUrls}
          videoUrl={data.videoUrl}
          isVideo={data.isVideo}
          audioUrl={data.audioUrl}
          isAudio={data.isAudio}
          thumbnailUrl={data.thumbnailLinkUrl}
          metadata={data.metadata}
          likesCount={data.likesCount}
          commentsCount={data.commentsCount}
          tagsCount={data.tagsCount}
          isLiked={data.isLiked}
          authorData={data.author}
          postId={data.id}
          channelId={data.channel?.id}
          channelName={data.channel?.title}
          widgetType={data.widgetType ?? (card.cardType === MainFeedCardType.socialPost ? 'regular_post' : 'channel_post')}
          isActive={isActive}
        />
      );
    }

    case MainFeedCardType.storyList:
      return (
        <StoryListWidget
          stories={card.itemData as any[]}
          onStoryTap={(story, index) => {
            // TODO: handle story tap
          }}
        />
      );

    case MainFeedCardType.Elite:
      return <EliteCardWidget data={card.itemData as any} />;

    case MainFeedCardType.user_recommendation_carousel:
      return <UserRecommendationCarousel />;

    default:
      return <View style={styles.empty} />;
  }
};

const styles = StyleSheet.create({
  empty: { height: 0 },
});

