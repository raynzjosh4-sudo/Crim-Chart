import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MovieBoxInfoWidgetProps {
  coverImageUrl: string;
  title: string;
  description: string;
  videosCount: number;
  likesCount: number;
}

export const MovieBoxInfoWidget = ({ coverImageUrl, title, description, videosCount, likesCount }: MovieBoxInfoWidgetProps) => {
  return (
    <View style={styles.boxInfoSection}>
      <Image source={coverImageUrl ? { uri: coverImageUrl } : undefined} style={styles.coverImage} contentFit="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
        style={styles.gradientOverlay}
      />
      <View style={styles.boxDetailsOverlay}>
        <Text style={styles.boxTitle}>{title}</Text>
        <Text style={styles.boxDescription}>{description}</Text>
        <Text style={styles.statsText}>{videosCount} Videos • {likesCount} Likes</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boxInfoSection: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  boxDetailsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  boxDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  statsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
});
