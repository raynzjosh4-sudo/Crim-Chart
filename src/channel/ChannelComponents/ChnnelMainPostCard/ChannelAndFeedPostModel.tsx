import { ChannelPostCard } from '@/channel/ChannelComponents/ChnnelMainPostCard/ChannelPostCard';
import { RegularPostCard } from '@/channel/ChannelComponents/ChnnelMainPostCard/RegularPostCard'; // TS Server: please refresh!
import { InvitePostCard } from '@/components/inviteCard/InvitePostCard';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

export interface ChannelAndFeedPostModelProps {
  content: string;
  timeAgo: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  aspectRatio?: number | null;
  type?: string | null;
  isVideo?: boolean | null;
  isAudio?: boolean | null;
  likesCount?: number;
  commentsCount?: number;
  tagsCount?: number;
  isLiked?: boolean;
  onLikeTap?: () => void;
  onCommentTap?: () => void;
  inviteChannelId?: string | null;
  inviteChannelName?: string | null;
  inviteChannelImage?: string | null;
  inviteChannelTitle?: string | null;
  onJoinPressed?: () => void;
  onTagTap?: () => void;
  isChannelPost?: boolean | null;
  authorData: CrimChartUserModel;
  taggerName?: string | null;
  taggerAvatar?: string | null;
  sourceChannelName?: string | null;
  sourceChannelAvatar?: string | null;
  currentChannelAvatar?: string | null;
  showCreatorBadge?: boolean;
  thumbnailUrl?: string | null;
  postId: string;
  channelId?: string | null;
  channelName?: string | null;
  linkChain?: string[] | null;
  widgetType?: string | null;
  channelDescription?: string | null;
  metadata?: any;
  isActive?: boolean;
}

export const ChannelAndFeedPostModel: React.FC<ChannelAndFeedPostModelProps> = (props) => {
  // 1. Check for Invite type
  if (props.type === 'invite') {
    return (
      <InvitePostCard
        content={props.content}
        timeAgo={props.timeAgo}
        inviteChannelId={props.inviteChannelId!}
        inviteChannelName={props.inviteChannelName!}
        inviteChannelImage={props.inviteChannelImage ?? undefined}
        inviteChannelTitle={props.inviteChannelTitle ?? undefined}
        author={props.authorData}
      />
    );
  }

  // 2. Check for Channel Post
  const isActuallyChannelPost = props.widgetType === 'channel_post' || (props.channelId && props.channelId.length > 0 && props.channelId !== 'user_feed');
  
  if (isActuallyChannelPost) {
    return (
      <ChannelPostCard
        {...props}
      />
    );
  }

  // 3. Fallback to Regular Post
  return (
    <RegularPostCard
      {...props}
      author={props.authorData}
      metadata={props.metadata}
      isActive={props.isActive}
    />
  );
};
