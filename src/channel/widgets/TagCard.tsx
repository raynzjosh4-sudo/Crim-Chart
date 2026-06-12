import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { TagEntity } from '@/channel/domain/entities/TagEntity';

interface Props { tag: TagEntity; onPress?: () => void; }

export default function TagCard({ tag, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.hash, { color: colors.primary }]}>#</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>#{tag.name}</Text>
        <Text style={[styles.meta, { color: colors.text + '60' }]}>{tag.channelsCount} channels</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  hash: { fontSize: 22, fontWeight: '900' },
  info: { marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
});
