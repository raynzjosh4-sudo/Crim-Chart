import React from 'react';
import { FlatList, FlatListProps, Platform, View } from 'react-native';
import { WebFeedPager } from './WebFeedPager';

export interface FeedScrollListProps<T> extends FlatListProps<T> {
  itemHeight: number;
}

/**
 * A customized FlatList designed for TikTok-style vertical video feeds.
 * It strictly enforces snapping to exactly one item per swipe.
 */
export const FeedScrollList = React.forwardRef((props: FeedScrollListProps<any>, ref: React.Ref<FlatList<any>>) => {
  const { itemHeight, ...rest } = props;

  if (Platform.OS === 'web') {
    return (
      <WebFeedPager
        data={rest.data}
        itemHeight={itemHeight}
        renderItem={rest.renderItem}
        initialScrollIndex={rest.initialScrollIndex}
        onViewableItemsChanged={rest.onViewableItemsChanged}
      />
    );
  }

  return (
    <FlatList
      ref={ref}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      snapToAlignment="start"
      decelerationRate="fast"
      disableIntervalMomentum={true} // Native: Prevents momentum from carrying over multiple items
      {...rest}
      pagingEnabled={false} // Strictly disable on Native so disableIntervalMomentum works
    />
  );
});
