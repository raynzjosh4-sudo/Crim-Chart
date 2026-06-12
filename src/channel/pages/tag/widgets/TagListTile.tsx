import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface TagListTileProps {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  buttonText: string;
  onTap?: () => void;
}

export const TagListTile: React.FC<TagListTileProps> = ({
  title,
  subtitle,
  imageUrl,
  buttonText,
  onTap,
}) => {
  const initial = title.length > 0 ? title[0].toUpperCase() : 'C';

  return (
    <View style={styles.container}>
      {/* Channel Avatar */}
      <View style={styles.avatarWrapper}>
        {imageUrl && imageUrl.length > 0 ? (
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initialText}>{initial}</Text>
          </View>
        )}
      </View>

      <View style={{ width: 16 }} />

      {/* Channel Info */}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && subtitle.length > 0 && (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        )}
      </View>

      {/* Tag Button */}
      <TouchableOpacity style={styles.button} onPress={onTap} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 22,
    fontWeight: '900',
  },
  title: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    minWidth: 100,
    borderRadius: 999,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  buttonText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    fontWeight: '900',
  },
});
