import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ThumbnailMediaType } from './thumbnaillinkmedia/ThumbnailMediaType';
import { ThumbnailMedia } from './thumbnaillinkmedia/ThumbnailMedia';

interface ThumbnailLinkProps {
  username?: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: ThumbnailMediaType;
  referenceId?: string;
  channelId?: string;
  onTap?: () => void;
  themeColor?: string;
  width?: number;
  height?: number;
}

export const ThumbnailLink: React.FC<ThumbnailLinkProps> = ({
  username,
  text,
  mediaUrl,
  mediaType = ThumbnailMediaType.image,
  referenceId,
  channelId,
  onTap,
  themeColor = '#448AFF', // approximate default blue accent
  width = 36,
  height = 48,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onTap} style={[styles.container, { backgroundColor: `${themeColor}14` }]}>
      <View style={styles.row}>
        {/* Accent Bar */}
        <View style={[styles.accentBar, { backgroundColor: themeColor }]} />
        
        <View style={{ width: 10 }} />
        
        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={[styles.username, { color: themeColor }]} numberOfLines={1}>
            {username || 'Contestant'}
          </Text>
          {!!text && (
            <Text style={[styles.textSnippet, { color: colors.text }]} numberOfLines={1}>
              {text}
            </Text>
          )}
        </View>

        {/* Media Thumbnail */}
        {!!mediaUrl && (
          <View style={styles.mediaContainer}>
            <ThumbnailMedia mediaUrl={mediaUrl} mediaType={mediaType} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    minHeight: 48,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textContent: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  username: {
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: -0.2,
  },
  textSnippet: {
    fontSize: 11.5,
    fontWeight: '500',
    opacity: 0.7,
    marginTop: 2,
  },
  mediaContainer: {
    width: 44,
    height: 44,
    margin: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
