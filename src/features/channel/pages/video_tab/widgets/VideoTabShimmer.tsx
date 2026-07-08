import { useStyles } from "@/core/hooks/useStyles";
import { ScrollView, View } from 'react-native';

const HEIGHTS = [220, 300, 260, 340, 210, 290, 250, 320, 230, 310, 270, 350];

export const VideoTabShimmer = () => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    shimmer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 16
    },
    grid: {
      flexDirection: 'row',
      paddingHorizontal: 8,
      paddingTop: 12,
      paddingBottom: 20,
      gap: 8
    },
    column: {
      flex: 1
    }
  }));

  return (
    <ScrollView style={styles.container} scrollEnabled={false} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        <View style={styles.column}>
          <View style={[styles.shimmer, { height: HEIGHTS[0], marginBottom: 8 }]} />
          <View style={[styles.shimmer, { height: HEIGHTS[1], marginBottom: 8 }]} />
          <View style={[styles.shimmer, { height: HEIGHTS[3], marginBottom: 8 }]} />
        </View>
        <View style={styles.column}>
          <View style={[styles.shimmer, { height: HEIGHTS[1], marginBottom: 8 }]} />
          <View style={[styles.shimmer, { height: HEIGHTS[2], marginBottom: 8 }]} />
          <View style={[styles.shimmer, { height: HEIGHTS[4], marginBottom: 8 }]} />
        </View>
      </View>
    </ScrollView>
  );
};