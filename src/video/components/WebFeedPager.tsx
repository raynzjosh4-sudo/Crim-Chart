import React, { useState, useRef, useEffect } from 'react';
import { View, Platform } from 'react-native';

export const WebFeedPager = ({
  data,
  itemHeight,
  renderItem,
  initialScrollIndex = 0,
  onViewableItemsChanged,
}: any) => {
  const [activeIndex, setActiveIndex] = useState(initialScrollIndex);
  const [logicalIndex, setLogicalIndex] = useState(initialScrollIndex);
  const touchStartY = useRef(0);
  const touchTime = useRef(0);
  const wheelTimeout = useRef<any>(null);

  // Sync initialScrollIndex
  useEffect(() => {
    if (initialScrollIndex !== activeIndex && initialScrollIndex >= 0 && initialScrollIndex < data.length) {
      setActiveIndex(initialScrollIndex);
      setLogicalIndex(initialScrollIndex);
    }
  }, [initialScrollIndex, data.length]);

  // Decouple the lightweight CSS scroll from the heavy video lifecycle!
  // Wait 350ms (the duration of the CSS transition) before updating the logical index.
  // This prevents the browser from dropping frames by attempting to load/play new videos exactly while sliding.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLogicalIndex(activeIndex);
    }, 350);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  // Notify parent on index change so videos play/pause correctly AFTER the animation
  useEffect(() => {
    if (onViewableItemsChanged && data[logicalIndex]) {
      onViewableItemsChanged({ viewableItems: [{ index: logicalIndex, item: data[logicalIndex] }] });
    }
  }, [logicalIndex]);

  const handleTouchStart = (e: any) => {
    touchStartY.current = e.nativeEvent.touches[0].pageY;
    touchTime.current = Date.now();
  };

  const handleTouchEnd = (e: any) => {
    const touchEndY = e.nativeEvent.changedTouches[0].pageY;
    const distance = touchStartY.current - touchEndY;
    const velocity = Math.abs(distance) / (Date.now() - touchTime.current);

    if (distance > 100 || (distance > 30 && velocity > 0.5)) {
      // Swipe Up -> Snap to Next Video
      setActiveIndex((prev: number) => Math.min(prev + 1, data.length - 1));
    } else if (distance < -100 || (distance < -30 && velocity > 0.5)) {
      // Swipe Down -> Snap to Previous Video
      setActiveIndex((prev: number) => Math.max(prev - 1, 0));
    }
  };

  const handleWheel = (e: any) => {
    if (wheelTimeout.current) return;
    
    if (e.deltaY > 50) {
      setActiveIndex((prev: number) => Math.min(prev + 1, data.length - 1));
      wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 500);
    } else if (e.deltaY < -50) {
      setActiveIndex((prev: number) => Math.max(prev - 1, 0));
      wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 500);
    }
  };

  return (
    <View 
      style={{ 
        flex: 1, 
        overflow: 'hidden', 
        height: itemHeight, 
        backgroundColor: '#000',
        touchAction: 'none' // Strictly block native browser scrolling
      } as any}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...(Platform.OS === 'web' ? { onWheel: handleWheel } : {})}
    >
      <View 
        style={[
          { transform: [{ translateY: -activeIndex * itemHeight }] },
          // The magic: let the browser natively handle the slide transition using pure CSS
          Platform.OS === 'web' ? { transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)' } as any : {}
        ]}
      >
        {data.map((item: any, index: number) => (
          <View key={item.id || index} style={{ height: itemHeight }}>
            {/* Memory optimization: Render adjacent videos based on the stable logicalIndex */}
            {Math.abs(index - logicalIndex) <= 2 ? renderItem({ item, index }) : null}
          </View>
        ))}
      </View>
    </View>
  );
};
