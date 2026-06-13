import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const ShimmerElement = ({ width, height, borderRadius = 4, style }: any) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#2A2A2A' },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const InboxFullPageShimmer = () => {
  const dummyItems = Array.from({ length: 8 });

  return (
    <View style={styles.container}>
      {dummyItems.map((_, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.avatarWrapper}>
            <ShimmerElement width={64} height={64} borderRadius={32} />
          </View>
          <View style={styles.content}>
            <View style={styles.titleLine}>
              <ShimmerElement width={160} height={20} borderRadius={4} />
            </View>
            <View style={styles.subtitleLine}>
              <ShimmerElement width={260} height={16} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatarWrapper: {
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  titleLine: {
    marginBottom: 8,
  },
  subtitleLine: {},
});
