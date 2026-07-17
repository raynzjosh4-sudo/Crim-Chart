import { ChannelRestrictionWrapper } from '@/components/wrappers/ChannelRestrictionWrapper';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { colors } from '@/core/theme/colors';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bell, ChevronLeft, Clock, LogOut, Plus, Search, Share as ShareIcon, Shield, ThumbsDown, Trash2, UserPlus } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Share, StyleSheet, Switch, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SelectUsersBottomSheet } from '@/channel/components/bottom_sheets/SelectUsersBottomSheet';
import { channelRepository } from '@/channel/data/channelRepository';
import { useChannelData } from '@/channel/hooks/useChannelData';
import { useChannelPermissions } from '@/channel/hooks/useChannelPermissions';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { OfflineNoDataWidget, OfflineStaleDataBanner, SlowConnectionBanner } from '@/components/offlineIndicators';
import { useNetworkState } from '@/components/offlineIndicators/useNetworkState';
import { ChannelShareCard } from '@/components/share_widgets/ChannelShareCard';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { captureRef } from 'react-native-view-shot';

export default function ChannelDetailsPage({ channelIdOverride }: { channelIdOverride?: string }) {
  const router = useRouter();
  const { id: routeId } = useLocalSearchParams();
  const id = channelIdOverride || routeId;
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const theme = useCurrentTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { needsLeaveRequest, canLeave, canDelete, canReport, role } = useChannelPermissions(id as string);
  const { channel, loading } = useChannelData(id as string);
  const user = useAuthStore(s => s.user);

  const shareCardRef = useRef<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [inviteFollowersVisible, setInviteFollowersVisible] = useState(false);
  const [inviteAdminsVisible, setInviteAdminsVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { startLoading, stopLoading } = useGlobalProgress();
  const networkState = useNetworkState();
  const isOffline = networkState === 'offline';
  const styles = useStyles(useStylesHook);

  React.useEffect(() => {
    if (!loading) {
      stopLoading();
    }
  }, [loading, stopLoading]);

  const handleDeleteChannel = () => {
    setDeleteConfirmVisible(true);
  };

  const performDelete = async () => {
    startLoading();
    try {
      await channelRepository.deleteChannel(id as string);
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Failed to delete channel:', e);
      if (Platform.OS === 'web') {
        window.alert('Failed to delete channel');
      } else {
        Alert.alert('Error', 'Failed to delete channel');
      }
    } finally {
      stopLoading();
    }
  };

  if (isOffline && !channel && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={1} onPress={() => {
            if (isDesktop && channelIdOverride) {
              router.setParams({ desktopChannelView: '' });
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(`/channel/${id}` as any);
            }
          }} style={styles.headerButton}>
            <ChevronLeft size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Channel Details</Text>
          <View style={{ width: 44 }} />
        </View>
        <OfflineNoDataWidget onRetry={() => { }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineStaleDataBanner />
      <SlowConnectionBanner />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => {
          if (isDesktop && channelIdOverride) {
            router.setParams({ desktopChannelView: '' });
          } else if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(`/channel/${id}` as any);
          }
        }} style={styles.headerButton}>
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
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
            <TouchableOpacity disabled={isSharing} activeOpacity={0.8} onPress={async () => {
              if (isSharing) return;
              setIsSharing(true);
              const url = `https://crimchart.com/channel/${id}`;
              const inviterName = user?.displayName || user?.username || 'I';
              const channelName = channel?.title || 'this channel';
              const shareText = `${inviterName} invites you to join ${channelName} on CrimChart. Let's have some fun together while we share our favourite music, albums, and videos. Join now!`;

              const doFallbackShare = async () => {
                if (Platform.OS === 'web') {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: channel?.title || 'Channel',
                        text: shareText,
                        url,
                      });
                    } catch (err) {
                      console.log('Share error or cancelled');
                    }
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                  }
                } else {
                  Share.share({
                    message: `${shareText}\n\n${url}`,
                    url
                  });
                }
              };

              try {
                if (Platform.OS !== 'web' && shareCardRef.current) {
                  const localUri = await captureRef(shareCardRef as any, {
                    format: 'png',
                    quality: 1,
                  });

                  const isAvailable = await Sharing.isAvailableAsync();
                  if (isAvailable) {
                    await Sharing.shareAsync(localUri, {
                      dialogTitle: 'Share Channel',
                      mimeType: 'image/png',
                    });
                  } else {
                    await doFallbackShare();
                  }
                } else {
                  await doFallbackShare();
                }
              } catch (e) {
                console.warn('Screenshot share failed, falling back', e);
                await doFallbackShare();
              } finally {
                setIsSharing(false);
              }
            }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, opacity: isSharing ? 0.5 : 1 }}>
              <ShareIcon size={14} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{isSharing ? 'Preparing...' : 'Share'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ position: 'absolute', top: -10000, left: -10000 }} pointerEvents="none">
            <View ref={shareCardRef} collapsable={false}>
              <ChannelShareCard channel={channel} />
            </View>
          </View>

          <ChannelRestrictionWrapper channelId={id as string} requiredAction="edit_settings" fallback={null}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.editButton}
              onPress={() => {
                if (isDesktop && channelIdOverride) {
                  router.setParams({ desktopChannelView: 'edit' });
                } else {
                  router.push(`/channel/settings/edit/${id}` as any);
                }
              }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </ChannelRestrictionWrapper>
        </View>

        {/* Metadata */}
        <View style={styles.metadataRow}>
          <Clock size={16} color={theme.colors.textSecondary} />
          <Text style={styles.metadataText}>
            Created on {channel?.createdAt ? new Date(channel.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
          </Text>
        </View>

        {/* Control Center */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTROL CENTER</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Bell size={22} color={theme.colors.text} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>Custom sounds and visual alerts</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary + '66' }}
              thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>

          <ChannelRestrictionWrapper channelId={id as string} requiredAction="edit_settings" fallback={null}>
            <TouchableOpacity activeOpacity={1}
              style={styles.settingItem}
              onPress={() => {
                if (isDesktop && channelIdOverride) {
                  router.setParams({ desktopChannelView: 'privacy' });
                } else {
                  router.push(`/channel/settings/privacy/${id}` as any);
                }
              }}
            >
              <View style={styles.settingIconContainer}>
                <Shield size={22} color={theme.colors.text} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Privacy and Permissions</Text>
                <Text style={styles.settingSubtitle}>Who can join and see content</Text>
              </View>
              <ChevronLeft size={20} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
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
            <Search size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <ChannelRestrictionWrapper channelId={id as string} requiredAction="invite_users" fallback={null}>
            <TouchableOpacity activeOpacity={1}
              style={styles.settingItem}
              onPress={() => setInviteFollowersVisible(true)}
            >
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
                <UserPlus size={20} color={theme.colors.onPrimary} />
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
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
                <Plus size={20} color={theme.colors.onPrimary} />
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

            {canLeave && (
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isLeaving}
                style={styles.settingItem}
                onPress={() => {
                  if (needsLeaveRequest) {
                    // Submit a leave_request so admin can approve
                    Alert.alert(
                      'Request to Leave',
                      'Your request to leave this channel will be sent to the admins for approval.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Send Request',
                          style: 'default',
                          onPress: async () => {
                            if (!user) return;
                            try {
                              setIsLeaving(true);
                              await channelRepository.createChannelRequest(
                                id as string,
                                user.id,
                                'leave_request',
                                user.id
                              );
                              Alert.alert('Request Sent', 'Your leave request has been sent to the channel admins.');
                            } catch (e) {
                              Alert.alert('Error', 'Could not send leave request. Please try again.');
                            } finally {
                              setIsLeaving(false);
                            }
                          },
                        },
                      ]
                    );
                  } else {
                    Alert.alert(
                      'Leave Channel',
                      'Are you sure you want to leave this channel? You will lose access to its content.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Leave',
                          style: 'destructive',
                          onPress: async () => {
                            if (!user) return;
                            try {
                              setIsLeaving(true);
                              await channelRepository.leaveChannel(id as string, user.id);
                              // Navigate away — replace so user can't go back into the channel
                              if (router.canGoBack()) {
                                router.back();
                              } else {
                                router.replace('/(tabs)/explore' as any);
                              }
                            } catch (e) {
                              Alert.alert('Error', 'Could not leave the channel. Please try again.');
                              setIsLeaving(false);
                            }
                          },
                        },
                      ]
                    );
                  }
                }}
              >
                <View style={styles.settingIconContainer}>
                  <LogOut size={22} color={isLeaving ? theme.colors.textSecondary : colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: isLeaving ? theme.colors.textSecondary : colors.primary }]}>
                    {isLeaving ? 'Leaving...' : (needsLeaveRequest ? 'Request to leave' : 'Leave Channel')}
                  </Text>
                </View>
                <ChevronLeft size={20} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            )}

            <ChannelRestrictionWrapper channelId={id as string} requiredAction="delete_channel" fallback={null}>
              <TouchableOpacity activeOpacity={1} style={styles.settingItem} onPress={handleDeleteChannel}>
                <View style={styles.settingIconContainer}>
                  <Trash2 size={22} color="#FF5252" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: '#FF5252' }]}>Delete channel</Text>
                </View>
                <ChevronLeft size={20} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
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
                <ChevronLeft size={20} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
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
          try {
            await channelRepository.createChannelRequest(id as string, targetId, 'member_invite', user.id);
          } catch (e: any) {
            if (e.code === '23505' || e.message?.includes('unique_pending_request_idx')) {
              // Ignore duplicate requests to let the button show "Sent"
              return;
            }
            throw e;
          }
        }}
      />

      <SelectUsersBottomSheet
        visible={inviteAdminsVisible}
        onClose={() => setInviteAdminsVisible(false)}
        title="Invite admins"
        channelIdForMembers={id as string}
        onSendRequest={async (targetId) => {
          if (!user) return;
          try {
            await channelRepository.createChannelRequest(id as string, targetId, 'admin_invite', user.id);
          } catch (e: any) {
            if (e.code === '23505' || e.message?.includes('unique_pending_request_idx')) {
              // Ignore duplicate requests to let the button show "Sent"
              return;
            }
            throw e;
          }
        }}
      />

      <Modal visible={deleteConfirmVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Channel</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete this channel? This action cannot be undone.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setDeleteConfirmVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteButton} onPress={() => { setDeleteConfirmVisible(false); performDelete(); }}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const useStylesHook = (colors: any, scale: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    height: 60,
    paddingHorizontal: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900' as const,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center' as const,
    paddingVertical: 20,
    position: 'relative' as const,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.surfaceVariant,
    marginBottom: 16,
  },
  channelName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900' as const,
    textAlign: 'center' as const,
  },
  channelSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  editButton: {
    position: 'absolute' as const,
    right: 20,
    top: 80,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800' as const,
  },
  metadataRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  metadataText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900' as const,
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceVariant,
  },
  settingIconContainer: {
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  settingSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
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
    fontWeight: '900' as const,
  },
  footerSpacer: {
    height: 60,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0D0D0D',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  modalMessage: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row' as const,
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center' as const,
  },
  modalCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF5252',
    alignItems: 'center' as const,
  },
  modalDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  }
});
