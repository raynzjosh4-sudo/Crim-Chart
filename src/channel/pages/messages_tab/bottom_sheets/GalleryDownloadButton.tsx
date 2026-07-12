import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Download } from 'lucide-react-native';
import { MediaDownloadWrapper } from '@/components/wrappers/MediaDownloadWrapper';

interface GalleryDownloadButtonProps {
  url?: string;
  type?: string;
}

export const GalleryDownloadButton: React.FC<GalleryDownloadButtonProps> = ({ url, type = 'image' }) => {
  if (!url) return null;

  const mediaType = type.includes('video') ? 'video' : type.includes('audio') ? 'audio' : 'image';

  return (
    <MediaDownloadWrapper
      mediaUrl={url}
      mediaType={mediaType as 'image' | 'video' | 'audio'}
      title="Gallery Media"
    >
      {({ download, isDownloading }) => (
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.iconButton} 
          onPress={download}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Download color="#FFF" size={28} />
          )}
        </TouchableOpacity>
      )}
    </MediaDownloadWrapper>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
});
