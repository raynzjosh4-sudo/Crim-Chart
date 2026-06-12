import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Plus, User } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

// Placeholder mock type until data hook is integrated
type StatusMock = {
  id: string;
  authorName: string;
  avatarUrl: string;
  imageUrl: string;
};

export const UserStatusMoments: React.FC = () => {
  const statuses: StatusMock[] = [
    { id: '1', authorName: 'Alice', avatarUrl: '', imageUrl: 'https://picsum.photos/200/300' },
    { id: '2', authorName: 'Bob', avatarUrl: '', imageUrl: 'https://picsum.photos/200/301' },
    { id: '3', authorName: 'Charlie', avatarUrl: '', imageUrl: 'https://picsum.photos/200/302' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Create Status Card */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.createIconWrapper}>
            <View style={styles.createAvatar}>
              <User size={30} color="rgba(255,255,255,0.5)" />
            </View>
            <View style={styles.plusBadge}>
              <Plus size={14} color="#000" />
            </View>
          </View>
          <Text style={styles.statusLabel}>Status</Text>
        </TouchableOpacity>

        {/* User Status Cards */}
        {statuses.map(status => (
          <TouchableOpacity key={status.id} style={styles.card}>
            <ExpoImage source={{ uri: status.imageUrl }} style={styles.cardImage} contentFit="cover" />
            <View style={styles.gradient} />
            <View style={styles.avatarRing}>
              <ExpoImage source={{ uri: status.avatarUrl || 'https://i.pravatar.cc/150' }} style={styles.userAvatar} />
            </View>
            <Text style={styles.authorName} numberOfLines={1}>{status.authorName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 175,
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: 100,
    height: 160,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  createIconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  createAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(250, 205, 17, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  statusLabel: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  avatarRing: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFF', // colors.secondary
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  authorName: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
  },
});
