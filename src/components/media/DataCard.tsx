import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, CheckCircle } from 'lucide-react-native';
import CrimchartUserAvatarImage from '@/components/avatar/CrimchartUserAvatarImage';
import { MediaData, MediaType } from '@/components/media/types';
import { colors } from '@/core/theme/colors';

interface DataCardProps {
  mediaData: MediaData;
  isSelected: boolean;
  onTap: () => void;
}

export default function DataCard({ mediaData, isSelected, onTap }: DataCardProps) {
  return (
    <TouchableOpacity
      onPress={onTap}
      activeOpacity={0.85}
      style={styles.container}
    >
      <View style={styles.imageWrapper}>
        <CrimchartUserAvatarImage
          url={mediaData.thumbnailUrl ?? mediaData.contentUrl}
          fit="cover"
          width={undefined}
          height={undefined}
          style={styles.image}
        />
      </View>

      {mediaData.type === MediaType.video && (
        <View style={styles.playIconWrapper}>
          <Play color="white" size={28} fill="white" />
        </View>
      )}

      {isSelected && (
        <View style={[styles.selectedOverlay, { borderColor: colors.primary }]}>
          <CheckCircle color="white" size={32} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 100 / 160,
  },
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    flex: 1,
  },
  playIconWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
