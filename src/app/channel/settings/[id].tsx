import { ChannelRestrictionWrapper } from '@/components/wrappers/ChannelRestrictionWrapper';
import { colors } from '@/core/theme/colors';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bell, ChevronLeft, Clock, LogOut, Plus, Search, Shield, ThumbsDown, Trash2, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChannelPermissions } from '@/channel/hooks/useChannelPermissions';
import { useChannelData } from '@/channel/hooks/useChannelData';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { SelectUsersBottomSheet } from '@/channel/components/bottom_sheets/SelectUsersBottomSheet';
import { channelRepository } from '@/channel/data/channelRepository';

export default function ChannelDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { needsLeaveRequest, canLeave, canDelete, canReport, role } = useChannelPermissions(id as string);
  const { channel } = useChannelData(id as string);
  const user = useAuthStore(s => s.user);

  const [inviteFollowersVisible, setInviteFollowersVisible] = useState(false);
  const [inviteAdminsVisible, setInviteAdminsVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Channel Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: channel?.imageUrl || 'https://picsum.photos/200/200?random=50' }}
            style={styles.avatar}
          />
          <Text style={styles.channelName}>{channel?.title || 'Unknown Channel'}</Text>
          <Text style={styles.channelSubtitle}>Channel • {channel?.membersCount || 0} members</Text>

          <ChannelRestrictionWrapper channelId={id as string} requiredAction="edit_settings" fallback={null}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.editButton}
              onPress={() => router.push(`/channel/settings/edit/${id}` as any)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </ChannelRestrictionWrapper>
        </View>

        {/* Metadata */}
        <View style={styles.metadataRow}>
          <Clock size={16} color="rgba(255,255,255,0.4)" />
          <Text style={styles.metadataText}>
            Created on {channel?.createdAt ? new Date(channel.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
          </Text>
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

          <ChannelRestrictionWrapper channelId={id as string} requiredAction="edit_settings" fallback={null}>
            <TouchableOpacity activeOpacity={1}
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
          </ChannelRestrictionWrapper>
        </View>

        {/* Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANAGEMENT</Text>

          <TouchableOpacity activeOpacity={1} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{channel?.followersCount || 0} followers</Text>
            </View>
            <Search size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <ChannelRestrictionWrapper channelId={id as string} requiredAction="invite_users" fallback={null}>
            <TouchableOpacity activeOpacity={1}
              style={styles.settingItem}
              onPress={() => setInviteFollowersVisible(true)}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                <UserPlus size={20} color="#000" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Invite members</Text>
              </View>
            </TouchableOpacity>

          </ChannelRestrictionWrapper>

          <ChannelRestrictionWrapper channelId={id as string} requiredAction="invite_admins" fallback={null}>
            <TouchableOpacity activeOpacity={1}
              style={styles.settingItem}
              onPress={() => setInviteAdminsVisible(true)}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                <Plus size={20} color="#000" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Invite admins</Text>
              </View>
            </TouchableOpacity>
          </ChannelRestrictionWrapper>

          <View style={styles.settingItem}>
            <Image
              source={{ uri: user?.profileImageUrl || 'https://i.pravatar.cc/150?img=11' }}
              style={styles.memberAvatar}
            />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>You</Text>
              <Text style={styles.settingSubtitle}>
                {channel?.visibleToFollowedUsers ? "You're visible to followers" : "You're not visible to followers"}
              </Text>
            </View>
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>
                {role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : role === 'member' ? 'Member' : 'Follower'}
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        {(canLeave || canDelete || canReport) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DANGER ZONE</Text>

            <ChannelRestrictionWrapper channelId={id as string} requiredAction="leave_channel" fallback={null}>
              <TouchableOpacity activeOpacity={1} style={styles.settingItem} onPress={() => {
                if (needsLeaveRequest) {
                  Alert.alert('Request Sent', 'Your request to leave this channel has been sent to the admins.');
                } else {
                  Alert.alert('Leave Channel', 'You are about to leave this channel.');
                }
              }}>
                <View style={styles.settingIconContainer}>
                  <LogOut size={22} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.primary }]}>
                    {needsLeaveRequest ? 'Request to leave' : 'Leave Channel'}
                  </Text>
                </View>
                <ChevronLeft size={20} color="rgba(255,255,255,0.4)" style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            </ChannelRestrictionWrapper>

            <ChannelRestrictionWrapper channelId={id as string} requiredAction="delete_channel" fallback={null}>
              <TouchableOpacity activeOpacity={1} style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Trash2 size={22} color="#FF5252" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: '#FF5252' }]}>Delete channel</Text>
                </View>
                <ChevronLeft size={20} color="rgba(255,255,255,0.4)" style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            </ChannelRestrictionWrapper>

            <ChannelRestrictionWrapper channelId={id as string} requiredAction="report_channel" fallback={null}>
              <TouchableOpacity activeOpacity={1} style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <ThumbsDown size={22} color="#FF5252" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: '#FF5252' }]}>Report channel</Text>
                </View>
                <ChevronLeft size={20} color="rgba(255,255,255,0.4)" style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            </ChannelRestrictionWrapper>
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      <SelectUsersBottomSheet
        visible={inviteFollowersVisible}
        onClose={() => setInviteFollowersVisible(false)}
        title="Invite members"
        onSendRequest={async (targetId) => {
          if (!user) return;
          await channelRepository.createChannelRequest(id as string, targetId, 'member_invite', user.id);
        }}
      />

      <SelectUsersBottomSheet
        visible={inviteAdminsVisible}
        onClose={() => setInviteAdminsVisible(false)}
        title="Invite admins"
        onSendRequest={async (targetId) => {
          if (!user) return;
          await channelRepository.createChannelRequest(id as string, targetId, 'admin_invite', user.id);
        }}
      />
    </SafeAreaView>
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
