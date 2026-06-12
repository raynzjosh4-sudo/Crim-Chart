export interface ChannelFeedPostModel {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  postType: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
}
