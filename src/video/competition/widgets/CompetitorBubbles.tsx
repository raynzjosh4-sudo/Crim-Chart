import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface CompetitorBubblesProps {
  avatarUrls: string[];
  label?: string;
}

export const CompetitorBubbles: React.FC<CompetitorBubblesProps> = ({
  avatarUrls,
  label,
}) => {
  const shown = avatarUrls.slice(0, 3);
  return (
    <View style={styles.row}>
      {shown.map((url, i) => (
        <Image
          key={i}
          source={{ uri: url }}
          style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10 }]}
        />
      ))}
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#1A1A1A',
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '600',
  },
});
