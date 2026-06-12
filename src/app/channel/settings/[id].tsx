import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Share2, Bell, Shield, Users, UserPlus, Plus, Search, Clock } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

export default function ChannelDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Channel Details</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Share2 size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://picsum.photos/200/200?random=50' }} 
            style={styles.avatar} 
          />
          <Text style={styles.channelName}>beautiful 💖💖💖 girls</Text>
          <Text style={styles.channelSubtitle}>Channel • 1 members • Joined May 2026</Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Metadata */}
        <View style={styles.metadataRow}>
          <Clock size={16} color="rgba(255,255,255,0.4)" />
          <Text style={styles.metadataText}>Created on May 16, 2026</Text>
        </View>

        {/* Control Center */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTROL CENTER</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Bell size={22} color="#FFF" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>Custom sounds and visual alerts</Text>
            </View>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#333', true: colors.primary + '66' }}
              thumbColor={notificationsEnabled ? colors.primary : '#666'}
            />
          </View>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push(`/channel/settings/privacy/${id}` as any)}
          >
            <View style={styles.settingIconContainer}>
              <Shield size={22} color="#FFF" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Privacy and Permissions</Text>
              <Text style={styles.settingSubtitle}>Who can join and see content</Text>
            </View>
            <ChevronLeft size={20} color="rgba(255,255,255,0.4)" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>

        {/* Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANAGEMENT</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>1 followers</Text>
            </View>
            <Search size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push(`/channel/settings/select-channel/${id}` as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <UserPlus size={20} color="#000" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Invite followers</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push(`/channel/settings/select-channel/${id}` as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Plus size={20} color="#000" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Invite admins</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
              style={styles.memberAvatar} 
            />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>You</Text>
              <Text style={styles.settingSubtitle}>You're not visible to followers</Text>
            </View>
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Owner</Text>
            </View>
          </View>
        </View>

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
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#111',
    marginBottom: 16,
  },
  channelName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  channelSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  editButton: {
    position: 'absolute',
    right: 20,
    top: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  metadataText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingIconContainer: {
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  settingSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ownerBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownerBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  footerSpacer: {
    height: 60,
  },
});
