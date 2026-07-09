import { MixedFeedItem } from '../models/MixedFeedItem';

export let preloadedMainFeed: MixedFeedItem[] | null = null;
export const setPreloadedMainFeed = (feed: MixedFeedItem[] | null) => { preloadedMainFeed = feed; };
