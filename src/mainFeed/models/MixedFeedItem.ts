import { MainFeedCardModel } from "./MainFeedCardTypeModel";

export interface MixedFeedItem {
  id: string; // The unique ID of the pointer or dynamic injection
  entity_type: string; // 'video_post', 'audio_post', 'standard_post', 'box', 'user_recommendation_carousel', 'channel_recommendation_carousel'
  entity_id: string; // The ID of the actual post, box, or 'dynamic'
  source_type: string; // 'channel_post', 'post', 'box', 'dynamic'
  created_at: string;
  hydratedCard?: MainFeedCardModel; // Hydrated post details, if applicable
  prefetchedData?: any; // Raw prefetched data for the feed item
}
