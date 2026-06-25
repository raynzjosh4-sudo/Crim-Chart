import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface TagCardProps {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  buttonText: string;
  onTap?: () => void;
}

export const TagCard: React.FC<TagCardProps> = ({
  title,
  description,
  imageUrl,
  buttonText,
  onTap,
}) => {
  const { colors, dark } = useTheme();
  const initial = title.length > 0 ? title[0].toUpperCase() : 'C';

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: dark ? '#1E1E1E' : colors.card, borderColor: dark ? 'rgba(255,255,255,0.06)' : colors.border }]} onPress={onTap} activeOpacity={0.8}>
      {/* Avatar */}
      <View style={[styles.imageWrapper, { backgroundColor: dark ? '#2A2A2A' : colors.background }]}>
        {imageUrl && imageUrl.length > 0 ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={[styles.initialText, { color: colors.text, opacity: 0.6 }]}>{initial}</Text>
          </View>
        )}
      </View>

      <View style={{ height: 8 }} />

      {/* Name */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>

      {description && description.length > 0 && (
        <Text style={[styles.description, { color: colors.text, opacity: 0.5 }]} numberOfLines={1}>{description}</Text>
      )}

      <View style={{ height: 8 }} />

      {/* Tag Button */}
      <View style={[styles.button, { backgroundColor: dark ? '#2A2A2A' : colors.background, borderColor: dark ? 'rgba(255,255,255,0.12)' : colors.border }]}>
        <Text style={[styles.buttonText, { color: colors.text, opacity: 0.9 }]}>{buttonText}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  imageWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
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
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  description: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  buttonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '800',
  },
});
