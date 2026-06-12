import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThumbnailMediaType } from './ThumbnailMediaType';
import { VideoThumbnail } from './VideoThumbnail';

interface ThumbnailMediaProps {
  mediaUrl: string;
  mediaType: ThumbnailMediaType;
}

export const ThumbnailMedia: React.FC<ThumbnailMediaProps> = ({ mediaUrl, mediaType }) => {
  const { colors } = useTheme();

  switch (mediaType) {
    case ThumbnailMediaType.video:
      return <VideoThumbnail videoUrl={mediaUrl} />;
    case ThumbnailMediaType.image:
    case ThumbnailMediaType.gif:
      return (
        <Image
          source={{ uri: mediaUrl }}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]}
          contentFit="cover"
        />
      );
    default:
      return null;
  }
};
