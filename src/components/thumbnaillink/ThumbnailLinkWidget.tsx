import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, Link2Off, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

export interface ThumbnailLinkModel {
  isOriginal: boolean;
  linkDepth: number;
  originalAuthor: string;
}

interface ThumbnailLinkWidgetProps {
  thumbnailLink: ThumbnailLinkModel;
  onTap?: () => void;
  compact?: boolean;
}

export const ThumbnailLinkWidget: React.FC<ThumbnailLinkWidgetProps> = ({
  thumbnailLink,
  onTap,
  compact = false,
}) => {
  const { colors } = useTheme();
  const IconComponent = thumbnailLink.isOriginal ? Link : Link2Off;

  return (
    <TouchableOpacity
      onPress={onTap}
      disabled={!onTap}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          minWidth: compact ? 120 : 150,
          maxWidth: compact ? 200 : 300,
          paddingHorizontal: compact ? 8 : 12,
          paddingVertical: compact ? 4 : 6,
        },
      ]}
    >
      <View style={styles.row}>
        <IconComponent
          size={compact ? 14 : 16}
          color={thumbnailLink.isOriginal ? colors.primary : colors.text}
        />
        
        <View style={{ width: compact ? 4 : 6 }} />

        {!thumbnailLink.isOriginal && (
          <>
            <View style={[styles.depthBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={[styles.depthText, { fontSize: compact ? 10 : 12 }]}>
                {thumbnailLink.linkDepth}x
              </Text>
            </View>
            <View style={{ width: compact ? 4 : 6 }} />
          </>
        )}

        <View style={styles.authorInfo}>
          <Text style={[styles.authorLabel, { fontSize: compact ? 10 : 12, color: 'rgba(255,255,255,0.6)' }]} numberOfLines={1}>
            {thumbnailLink.isOriginal ? 'Original Post' : 'Linked from'}
          </Text>
          <Text style={[styles.authorName, { fontSize: compact ? 11 : 13, color: colors.primary }]} numberOfLines={1}>
            @{thumbnailLink.originalAuthor}
          </Text>
        </View>

        {onTap && (
          <>
            <View style={{ width: compact ? 4 : 6 }} />
            <ChevronRight size={compact ? 12 : 14} color="rgba(255,255,255,0.6)" />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const CompactThumbnailLink: React.FC<{ thumbnailLink: ThumbnailLinkModel; onTap?: () => void }> = ({
  thumbnailLink,
  onTap,
}) => {
  const { colors } = useTheme();
  const IconComponent = Link;

  return (
    <TouchableOpacity onPress={onTap} disabled={!onTap} style={styles.row}>
      <IconComponent size={14} color={thumbnailLink.isOriginal ? colors.primary : colors.text} />
      <View style={{ width: 4 }} />
      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
        {thumbnailLink.isOriginal ? 'Original' : `${thumbnailLink.linkDepth}x linked`}
      </Text>
      {onTap && (
        <>
          <View style={{ width: 4 }} />
          <ChevronRight size={12} color="rgba(255,255,255,0.6)" />
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  depthBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  depthText: {
    fontWeight: '500',
    color: 'white',
  },
  authorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  authorLabel: {
    fontWeight: '400',
  },
  authorName: {
    fontWeight: '500',
  },
});
