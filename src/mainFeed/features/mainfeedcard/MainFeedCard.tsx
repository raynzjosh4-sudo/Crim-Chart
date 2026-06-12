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

interface MainFeedCardProps {
  card: MainFeedCardModel;
}

export const MainFeedCard: React.FC<MainFeedCardProps> = ({ card }) => {
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
          likesCount={data.likesCount}
          commentsCount={data.commentsCount}
          tagsCount={data.tagsCount}
          isLiked={data.isLiked}
          authorData={data.author}
          postId={data.id}
          channelId={data.channel?.id}
          channelName={data.channel?.title}
          widgetType={data.widgetType ?? (card.cardType === MainFeedCardType.socialPost ? 'regular_post' : 'channel_post')}
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

    default:
      return <View style={styles.empty} />;
  }
};

const styles = StyleSheet.create({
  empty: { height: 0 },
});

