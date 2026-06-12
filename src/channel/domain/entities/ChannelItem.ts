export type ChannelItemType = 'post' | 'moment' | 'ad' | 'divider';

export interface ChannelItem {
  type: ChannelItemType;
  data: any;
}
