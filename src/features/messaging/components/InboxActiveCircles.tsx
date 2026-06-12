import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/core/theme/colors';

interface ActiveContact {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  hasStatus: boolean;
}

interface InboxActiveCirclesProps {
  contacts: ActiveContact[];
  onContactPress: (contact: ActiveContact) => void;
}

export const InboxActiveCircles: React.FC<InboxActiveCirclesProps> = ({ contacts, onContactPress }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {contacts.map((contact) => (
          <TouchableOpacity 
            key={contact.id} 
            style={styles.contactItem}
            onPress={() => onContactPress(contact)}
          >
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarRing, contact.hasStatus && styles.avatarRingActive]}>
                <Image 
                  source={{ uri: contact.avatarUrl || 'https://i.pravatar.cc/150' }} 
                  style={styles.avatar}
                />
              </View>
              {contact.isOnline && <View style={styles.onlineDot} />}
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {contact.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 110,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 18,
  },
  contactItem: {
    alignItems: 'center',
    width: 72,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarRingActive: {
    borderColor: colors.primary,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
});
