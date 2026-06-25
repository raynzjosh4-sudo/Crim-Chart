import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

/** Matches the shape of a post card in the feed (avatar + media + actions + caption) */
export const PostCardSkeleton = () => (
  <View style={{ backgroundColor: '#000', marginBottom: 20, paddingVertical: 12 }}>
    {/* Header row */}
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
      <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBox width={130} height={13} />
        <SkeletonBox width={80} height={11} />
      </View>
      <SkeletonBox width={24} height={8} borderRadius={4} />
    </View>

    {/* Media block */}
    <SkeletonBox width={'100%'} height={320} borderRadius={0} />

    {/* Action bar */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <SkeletonBox width={26} height={26} borderRadius={13} />
        <SkeletonBox width={26} height={26} borderRadius={13} />
        <SkeletonBox width={26} height={26} borderRadius={13} />
      </View>
      <SkeletonBox width={26} height={26} borderRadius={13} />
    </View>

    {/* Caption */}
    <View style={{ paddingHorizontal: 16, gap: 8 }}>
      <SkeletonBox width={'88%'} height={13} />
      <SkeletonBox width={'55%'} height={11} />
    </View>
  </View>
);

/** Matches a video card (full height dark block with overlay) */
export const VideoCardSkeleton = () => (
  <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'flex-end' }}>
    <View style={{ paddingHorizontal: 16, paddingBottom: 80, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <SkeletonBox width={36} height={36} borderRadius={18} />
        <SkeletonBox width={100} height={13} />
      </View>
      <SkeletonBox width={'75%'} height={13} />
      <SkeletonBox width={'50%'} height={11} />
    </View>
  </View>
);

/** Matches a box feed card (cover image + title + track rows) */
export const BoxFeedCardSkeleton = () => (
  <View style={{ backgroundColor: '#111', borderRadius: 16, margin: 12, overflow: 'hidden' }}>
    {/* Cover image */}
    <SkeletonBox width={'100%'} height={200} borderRadius={0} />

    {/* Box info */}
    <View style={{ padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <SkeletonBox width={38} height={38} borderRadius={19} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox width={140} height={13} />
          <SkeletonBox width={80} height={10} />
        </View>
      </View>

      {/* Track rows */}
      {[0, 1].map(i => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <SkeletonBox width={44} height={44} borderRadius={8} />
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonBox width={'70%'} height={12} />
            <SkeletonBox width={'45%'} height={10} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

/** 3-column grid of square tiles for Explore */
export const ExploreGridSkeleton = () => {
  const TILE_SIZE = 120;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 1 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonBox key={i} width={TILE_SIZE} height={TILE_SIZE} borderRadius={0} />
      ))}
    </View>
  );
};

/** Row skeleton for channel lists */
export const ChannelListSkeleton = ({ count = 5 }: { count?: number }) => (
  <View style={{ gap: 0 }}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        <SkeletonBox width={48} height={48} borderRadius={24} />
        <View style={{ flex: 1, gap: 7 }}>
          <SkeletonBox width={'60%'} height={13} />
          <SkeletonBox width={'40%'} height={11} />
        </View>
        <SkeletonBox width={70} height={30} borderRadius={15} />
      </View>
    ))}
  </View>
);

/** Row skeleton for user lists */
export const UserListSkeleton = ({ count = 5 }: { count?: number }) => (
  <View style={{ gap: 0 }}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 }}>
        <SkeletonBox width={42} height={42} borderRadius={21} />
        <View style={{ flex: 1, gap: 7 }}>
          <SkeletonBox width={'50%'} height={13} />
          <SkeletonBox width={'35%'} height={11} />
        </View>
      </View>
    ))}
  </View>
);

/** Comment row skeletons */
export const CommentListSkeleton = ({ count = 5 }: { count?: number }) => (
  <View style={{ gap: 0 }}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 10 }}>
        <SkeletonBox width={36} height={36} borderRadius={18} />
        <View style={{ flex: 1, gap: 7, paddingTop: 2 }}>
          <SkeletonBox width={'40%'} height={12} />
          <SkeletonBox width={'85%'} height={12} />
          <SkeletonBox width={'60%'} height={12} />
        </View>
      </View>
    ))}
  </View>
);

/** Gift grid skeleton */
export const GiftGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 }}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={{ alignItems: 'center', gap: 6, width: 72 }}>
        <SkeletonBox width={64} height={64} borderRadius={12} />
        <SkeletonBox width={55} height={10} />
      </View>
    ))}
  </View>
);
