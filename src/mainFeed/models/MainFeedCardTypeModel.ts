export enum MainFeedCardType {
  storyList = 'storyList',
  channels = 'channels',
  commonChart = 'commonChart',
  channelPost = 'channelPost',
  socialPost = 'socialPost',
  Elite = 'Elite',
  discoverTops = 'discoverTops',
  discoverStars = 'discoverStars',
  commonChannel = 'commonChannel',
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
