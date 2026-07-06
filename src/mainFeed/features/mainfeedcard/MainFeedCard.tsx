import { ChannelAndFeedPostModel } from '@/channel/ChannelComponents/ChnnelMainPostCard/ChannelAndFeedPostModel';
import { EliteCardWidget } from '@/components/hiness/EliteCardWidget';
import { StoryListWidget } from '@/components/statuspagesAndWidgets/StoryListWidget';
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { StyleSheet, View } from 'react-native';
import { ChannelPostModel } from '../../models/ChannelPostModel';
import { MainFeedCardModel, MainFeedCardType } from '../../models/MainFeedCardTypeModel';
import { UserRecommendationCarousel } from '../../pages/main_page_widgets/UserRecommendationCarousel';
import { ChannelsWidget } from '../charts_stars/ChannelsWidget';
import { Mainfeedcard } from './subfeedCards/Mainfeedcard';

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
        <PostInteractionWrapper
          postId={data.id}
          initialLikesCount={data.likesCount}
          initialViewsCount={data.viewsCount}
          initialDownloadsCount={0}
          sourceTable={data.sourceTable || 'posts'}
          forceIsVisible={isActive}
        >
          {({ isLiked, likesCount, viewsCount, downloadsCount }) => (
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
              likesCount={likesCount}
              commentsCount={data.commentsCount}
              tagsCount={data.tagsCount}
              viewsCount={viewsCount}
              downloadsCount={downloadsCount}
              isLiked={isLiked}
              authorData={data.author}
              postId={data.id}
              channelId={data.channel?.id}
              channelName={data.channel?.title}
              channelDescription={data.channel?.description}
              widgetType={data.widgetType ?? (card.cardType === MainFeedCardType.socialPost ? 'regular_post' : 'channel_post')}
              source_type={data.source_type}
              isActive={isActive}
            />
          )}
        </PostInteractionWrapper>
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

