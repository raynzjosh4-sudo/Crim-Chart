import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { ImageCardMedia } from '@/components/ImageCardMedia'; // Assuming this exists

interface CrimchartImageContentProps {
  imageUrls: string[];
  username: string;
  userProfileImageUrl: string;
  chartName: string;
  chartPoints: number;
  rank: number;
  themeColor: string;
  aspectRatio?: number;
}

const { width } = Dimensions.get('window');

export const CrimchartImageContent: React.FC<CrimchartImageContentProps> = ({
  imageUrls,
  username,
  userProfileImageUrl,
  chartName,
  chartPoints,
  rank,
  themeColor,
  aspectRatio = 2.2,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalCount = imageUrls.length;

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentPage(Math.round(index));
  };

  return (
    <View style={styles.container}>
      <View style={{ aspectRatio }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          bounces={true}
        >
          {imageUrls.map((url, index) => (
            <View key={index} style={{ width }}>
              <ImageCardMedia
                url={url}
                creatorAvatarUrl={userProfileImageUrl}
                themeColor={themeColor}
                username={username}
                subtitle={chartName}
                showThumbnail={false}
              />
            </View>
          ))}
        </ScrollView>

        {totalCount > 1 && (
          <View style={styles.dotsContainer}>
            {Array.from({ length: totalCount }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      currentPage === index ? themeColor : 'rgba(255, 255, 255, 0.4)',
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 150,
    maxHeight: 500,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    marginHorizontal: 4,
    borderRadius: 3,
  },
});

