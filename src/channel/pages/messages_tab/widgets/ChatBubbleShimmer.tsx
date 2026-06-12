import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShimmerEffect } from '../../widgets2/shimmer/ShimmerEffect';

export const ChatBubbleShimmer: React.FC = () => {
  const baseColor = 'rgba(255,255,255,0.05)';

  return (
    <ShimmerEffect>
      <View>
        {[1, 2, 3].map((key) => (
          <View key={key} style={styles.messageRow}>
            <View style={[styles.avatar, { backgroundColor: baseColor }]} />
            
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <View style={[styles.name, { backgroundColor: baseColor }]} />
                <View style={[styles.time, { backgroundColor: baseColor }]} />
              </View>
              
              <View style={[styles.line1, { backgroundColor: baseColor }]} />
              <View style={[styles.line2, { backgroundColor: baseColor }]} />
            </View>
          </View>
        ))}
      </View>
    </ShimmerEffect>
  );
};

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    width: 100,
    height: 12,
    borderRadius: 4,
  },
  time: {
    width: 40,
    height: 10,
    borderRadius: 4,
  },
  line1: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  line2: {
    width: 180,
    height: 14,
    borderRadius: 4,
  },
});
