export enum MainFeedCardType {
  // --- Legacy / Internal Types ---
  storyList = 'storyList',
  channels = 'channels',
  commonChart = 'commonChart',
  channelPost = 'channelPost',
  socialPost = 'socialPost',
  Elite = 'Elite',
  discoverTops = 'discoverTops',
  discoverStars = 'discoverStars',
  commonChannel = 'commonChannel',

  // --- DB entity_type values (from user_feed_pointers) ---
  long_video_post = 'long_video_post',
  short_video_post = 'short_video_post',
  audio_post = 'audio_post',
  image_post = 'image_post',
  standard_post = 'standard_post',

  // Box types
  box = 'box',
  box_audio = 'box_audio',
  box_marketplace = 'box_marketplace',
  box_contest = 'box_contest',
  box_movie = 'box_movie',
  box_music = 'box_music',
  box_sports = 'box_sports',
  box_voting = 'box_voting',
  box_store = 'box_store',

  // Carousels / Dynamic Injections
  user_recommendation_carousel = 'user_recommendation_carousel',
  channel_recommendation_carousel = 'channel_recommendation_carousel',
}

export enum ScrollViewType {
  horizontal = 'horizontal',
  vertical = 'vertical',
  none = 'none',
}

/**
 * Wrapper model used by the main feed paging list.
 * itemData is typed as unknown to support any card sub-type.
 */
export interface MainFeedCardModel {
  id: string;
  cardType: MainFeedCardType;
  scrollViewType: ScrollViewType;
  /** Named route or path this card navigates to on tap. e.g. '/post/p1' */
  link: string;
  itemData: unknown;
}

export function createFeedCard(partial: Omit<MainFeedCardModel, 'scrollViewType'> & { scrollViewType?: ScrollViewType }): MainFeedCardModel {
  return {
    ...partial,
    scrollViewType: partial.scrollViewType ?? ScrollViewType.vertical,
  };
}
