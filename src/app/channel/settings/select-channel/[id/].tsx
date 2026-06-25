import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Search, CheckCircle2 } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

export default function SelectChannelPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  // Mock data for demonstration
  const channels = [
    { id: '101', name: 'Tech Talk', memberCount: '1.2k', avatar: 'https://picsum.photos/100/100?random=10' },
    { id: '102', name: 'Gaming Hub', memberCount: '5k', avatar: 'https://picsum.photos/100/100?random=11' },
    { id: '103', name: 'Cooking Fun', memberCount: '800', avatar: 'https://picsum.photos/100/100?random=12' },
    { id: '104', name: 'Music World', memberCount: '12k', avatar: 'https://picsum.photos/100/100?random=13' },
  ];

  const handleInvite = (channelId: string) => {
    const newSentIds = new Set(sentIds);
    newSentIds.add(channelId);
    setSentIds(newSentIds);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELECT CHANNEL</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="rgba(255,255,255,0.3)" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search channel"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {channels.map((channel) => {
          const isSent = sentIds.has(channel.id);
          return (
            <View key={channel.id} style={styles.channelTile}>
              <Image source={{ uri: channel.avatar }} style={styles.channelAvatar} />
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>{channel.name}</Text>
                <Text style={styles.channelMembers}>{channel.memberCount} members</Text>
              </View>
              
              <TouchableOpacity activeOpacity={1} 
                style={[styles.inviteButton, isSent && styles.sentButton]} 
                onPress={() => !isSent && handleInvite(channel.id)}
                disabled={isSent}
              >
                <Text style={[styles.inviteButtonText, isSent && styles.sentButtonText]}>
                  {isSent ? 'SENT' : 'INVITE'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  channelTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111',
  },
  channelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  channelName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  channelMembers: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  inviteButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  sentButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowOpacity: 0,
    elevation: 0,
  },
  sentButtonText: {
    color: 'rgba(255,255,255,0.3)',
  },
  footerSpacer: {
    height: 60,
  },
});
