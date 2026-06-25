import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Plus, MoreHorizontal } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface Status {
  id: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  primaryImageUrl?: string;
  imageUrls: string[];
}

interface MembersStoryBarProps {
  statuses: Status[];
  onAddStory: () => void;
  canPostStatus?: boolean;
}

export const MembersStoryBar: React.FC<MembersStoryBarProps> = ({
  statuses,
  onAddStory,
  canPostStatus = true,
}) => {
  if (!canPostStatus && statuses.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Status</Text>
        <MoreHorizontal size={20} color="rgba(255,255,255,0.6)" />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {canPostStatus && (
          <TouchableOpacity activeOpacity={1} style={styles.addCard} onPress={onAddStory}>
            <View style={styles.addCardOverlay} />
            <View style={styles.addIconContainer}>
              <View style={styles.avatarPlaceholder}>
                <Image 
                  source={{ uri: 'https://i.pravatar.cc/150?img=11' }} // Just a placeholder
                  style={styles.avatarSmall} 
                />
                <View style={styles.plusBadge}>
                  <Plus size={10} color="#000" strokeWidth={3} />
                </View>
              </View>
            </View>
            <Text style={styles.cardLabel}>Add status</Text>
          </TouchableOpacity>
        )}

        {statuses.map((status, index) => (
          <TouchableOpacity activeOpacity={1} key={status.id} style={styles.statusCard}>
            <Image 
              source={{ uri: status.primaryImageUrl || status.authorAvatarUrl }} 
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <View style={styles.statusGradient} />
            
            <View style={styles.statusAvatarContainer}>
              <View style={styles.statusAvatarRing}>
                <Image source={{ uri: status.authorAvatarUrl }} style={styles.avatarSmall} />
              </View>
            </View>

            <Text style={styles.cardLabel}>{status.authorUsername.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  addCard: {
    width: 105,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#111',
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 12,
  },
  statusCard: {
    width: 105,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#111',
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 12,
  },
  addCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  statusGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  addIconContainer: {
    alignSelf: 'flex-start',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 2,
  },
  cardLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusAvatarContainer: {
    alignSelf: 'flex-start',
  },
  statusAvatarRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 2,
  },
});
