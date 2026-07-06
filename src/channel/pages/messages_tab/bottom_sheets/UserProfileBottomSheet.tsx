import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, useWindowDimensions, ScrollView } from 'react-native';
import { MessageModel } from '../models/MessageModel';
import { Image as ExpoImage } from 'expo-image';
import { UserPlus, UserCircle, X } from 'lucide-react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useRouter } from 'expo-router';
import AppAvatar from '@/components/avatar/AppAvatar';
import { FollowUserButton } from '@/components/FollowUserButton';

interface UserProfileBottomSheetProps {
  user: MessageModel;
  visible: boolean;
  onClose: () => void;
}

import { supabase } from '@/core/supabase/client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

import { Platform } from 'react-native';

export const UserProfileBottomSheet: React.FC<UserProfileBottomSheetProps> = ({ user, visible, onClose }) => {
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    overlay: { flex: 1, justifyContent: 'flex-end' as const },
    backdrop: { ...require('react-native').StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    container: {
      paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40,
      backgroundColor: colors.background,
      borderTopLeftRadius: 32, borderTopRightRadius: 32, alignItems: 'center' as const,
    },
    dragHandle: { width: 40, height: 4, backgroundColor: colors.muted, borderRadius: 2, marginBottom: 24 },
    avatar: {
      width: 100, height: 100, borderRadius: 50,
      borderWidth: 3, borderColor: 'rgba(250, 205, 17, 0.3)', marginBottom: 12,
    },
    name: { fontSize: 20, fontWeight: '900' as const, color: colors.text, marginBottom: 16 },
    statsRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 24 },
    statCol: { alignItems: 'center' as const },
    statValue: { fontSize: 18, fontWeight: '900' as const, color: colors.text },
    statLabel: { fontSize: 12, fontWeight: '500' as const, color: colors.textSecondary },
    divider: { width: 1, height: 24, backgroundColor: colors.muted, marginHorizontal: 24 },
    actionsRow: { flexDirection: 'row' as const, width: '100%' as any, gap: 12 },
    btn: {
      flex: 1, height: 50, borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center' as const, alignItems: 'center' as const,
      flexDirection: 'row' as const, gap: 8,
    },
    primaryBtn: { backgroundColor: colors.primary },
    btnText: { color: colors.text, fontSize: 14, fontWeight: '700' as const },
    primaryBtnText: { color: colors.onPrimary, fontSize: 14, fontWeight: '700' as const },
    sectionTitle: { fontSize: 16, fontWeight: '800' as const, color: colors.text, textAlign: 'left' as const },
  }));
  
  const [stats, setStats] = useState({ followers: 0, channels: 0 });
  const [commonChannels, setCommonChannels] = useState<any[]>([]);

  useEffect(() => {
    if (visible && user.user.id && user.user.id !== 'temp-id') {
      const fetchProfileStats = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('followers_count, channels_created_count')
          .eq('id', user.user.id)
          .single();
          
        if (data) {
          setStats({
            followers: data.followers_count || 0,
            channels: data.channels_created_count || 0
          });
        }
      };

      const fetchCommonChannels = async () => {
        if (!currentUser?.id) return;
        const { data } = await supabase.rpc('get_user_channels', {
          p_user_id: currentUser.id,
          p_target_user_id: user.user.id,
          p_filter_type: 'similar',
          p_page_offset: 0,
          p_page_limit: 10
        });
        if (data) {
          setCommonChannels(data);
        }
      };

      fetchProfileStats();
      fetchCommonChannels();
    }
  }, [visible, user.user.id, currentUser?.id]);

  const handleViewAccount = () => {
    onClose();
    if (user.user.id && user.user.id !== 'temp-id') {
      router.push(`/profile/${user.user.id}` as any);
    }
  };

  const displayName = user.user.name || 'User';
  const displayAvatar = user.user.avatarUrl || '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? "fade" : "slide"}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, isDesktop && { justifyContent: 'center', alignItems: 'center' }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.container, isDesktop && { 
          width: 400, 
          borderRadius: 32, 
          paddingBottom: 24,
          paddingTop: 24,
          maxHeight: height * 0.9,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)'
        }]}>
          {!isDesktop && <View style={styles.dragHandle} />}
          
          {isDesktop && (
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={onClose} 
              style={{ position: 'absolute', top: 20, right: 20, padding: 8, zIndex: 10 }}
            >
              <X size={24} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}

          <ExpoImage
            source={{ uri: displayAvatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          
          <Text style={styles.name}>{displayName}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{stats.channels}</Text>
              <Text style={styles.statLabel}>Channels</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <FollowUserButton targetUserId={user.user.id} size="medium" style={styles.btn} />
            <TouchableOpacity activeOpacity={1} style={styles.btn} onPress={handleViewAccount}>
              <UserCircle size={18} color="#FFF" />
              <Text style={styles.btnText}>View Account</Text>
            </TouchableOpacity>
          </View>

          {/* Common Channels Section */}
          <View style={{ width: '100%', marginTop: 32 }}>
            <Text style={styles.sectionTitle}>Common Channels</Text>
            {commonChannels.length === 0 ? (
              <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>No common channels</Text>
            ) : (
              <View style={{ marginHorizontal: -24 }}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={{ marginTop: 16 }}
                  contentContainerStyle={{ paddingHorizontal: 24 }}
                >
                {commonChannels.map((channel) => (
                  <View key={channel.id} style={{ marginRight: 16, alignItems: 'center' }}>
                    <AppAvatar 
                      url={channel.avatar_url || 'https://via.placeholder.com/60'} 
                      size={60} 
                      showStatusRing={false}
                      showActiveDot={false}
                    />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 8, maxWidth: 64 }} numberOfLines={1}>
                      {channel.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              </View>
            )}
          </View>

          {/* Spacer for bottom padding */}
          <View style={{ height: 24 }} />
        </View>
      </View>
    </Modal>
  );
};
