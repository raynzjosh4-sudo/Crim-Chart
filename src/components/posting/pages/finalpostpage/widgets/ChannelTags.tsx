import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Users, Check } from 'lucide-react-native';

export interface ChannelData {
  id: string;
  name: string;
  avatarUrl: string;
}

interface ChannelTagsProps {
  channels: ChannelData[];
  selectedChannels: string[];
  onChannelSelected: (id: string) => void;
}

export const ChannelTags: React.FC<ChannelTagsProps> = ({ channels, selectedChannels, onChannelSelected }) => {
  if (channels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No channels found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {channels.map((channel) => {
          const isSelected = selectedChannels.includes(channel.id);

          return (
            <TouchableOpacity
              key={channel.id}
              activeOpacity={0.8}
              onPress={() => onChannelSelected(channel.id)}
              style={[
                styles.channelCard,
                isSelected ? styles.channelCardSelected : styles.channelCardUnselected
              ]}
            >
              <View style={[styles.avatarContainer, isSelected && styles.avatarContainerSelected]}>
                {channel.avatarUrl ? (
                  <Image source={{ uri: channel.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Users color={isSelected ? '#000' : '#FACD11'} size={20} />
                )}
              </View>
              <Text 
                style={[styles.nameText, isSelected ? styles.nameTextSelected : styles.nameTextUnselected]} 
                numberOfLines={1}
              >
                {channel.name}
              </Text>
              
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Check color="#FACD11" size={10} strokeWidth={4} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    marginBottom: 8,
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  channelCard: {
    width: 100,
    marginRight: 12,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelCardSelected: {
    backgroundColor: '#FACD11',
    borderColor: '#FACD11',
  },
  channelCardUnselected: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#0D0D0D', // Theme scaffold background
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatarContainerSelected: {
    borderColor: '#FACD11',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameText: {
    fontSize: 11,
    textAlign: 'center',
  },
  nameTextSelected: {
    color: '#000',
    fontWeight: '900',
  },
  nameTextUnselected: {
    color: '#FFF',
    fontWeight: '600',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 2,
  }
});
