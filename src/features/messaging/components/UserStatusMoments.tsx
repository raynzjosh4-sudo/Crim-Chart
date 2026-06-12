import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface StatusMoment {
  id: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  primaryImageUrl?: string;
}

interface UserStatusMomentsProps {
  statuses: StatusMoment[];
  onAddStatus: () => void;
  onViewStatus: (status: StatusMoment) => void;
}

export const UserStatusMoments: React.FC<UserStatusMomentsProps> = ({ statuses, onAddStatus, onViewStatus }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Create Status Card */}
        <TouchableOpacity style={styles.createCard} onPress={onAddStatus}>
          <View style={styles.createAvatarContainer}>
            <View style={styles.avatarCircle}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/150?u=me' }} 
                style={styles.meAvatar}
              />
            </View>
            <View style={styles.addButton}>
              <Plus size={12} color="#000" />
            </View>
          </View>
          <Text style={styles.cardLabel}>Status</Text>
        </TouchableOpacity>

        {/* Status Cards */}
        {statuses.map((status) => (
          <TouchableOpacity 
            key={status.id} 
            style={styles.statusCard}
            onPress={() => onViewStatus(status)}
          >
            {status.primaryImageUrl && (
              <Image 
                source={{ uri: status.primaryImageUrl }} 
                style={styles.cardBackground}
              />
            )}
            <View style={styles.cardOverlay} />
            
            <View style={styles.cardAvatarContainer}>
              <View style={styles.cardAvatarRing}>
                <Image 
                  source={{ uri: status.authorAvatarUrl || 'https://i.pravatar.cc/150' }} 
                  style={styles.cardAvatar}
                />
              </View>
            </View>

            <Text style={styles.authorName} numberOfLines={1}>
              {status.authorUsername}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 175,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  createCard: {
    width: 100,
    height: 160,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    padding: 2,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255, 179, 0, 0.5)',
  },
  meAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 4,
  },
  cardLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusCard: {
    width: 100,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardAvatarContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  cardAvatarRing: {
    padding: 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFB800',
  },
  cardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  authorName: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
