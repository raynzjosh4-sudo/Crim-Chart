import { FollowUserButton } from '@/components/FollowUserButton';
import { InboxUserButton } from '@/components/InboxUserButton';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { FollowersListPage } from '@/profile/pages/FollowersListPage';
import { ProfilePage } from '@/profile/pages/ProfilePage';
import { EditProfilePage } from '@/profile/profileeditpages/EditProfilePage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import { ProfilePageShimmer } from '@/components/shimmers/ProfilePageShimmer';

interface ProfilePageWrapperProps {
  targetUserId?: string;
}

export const ProfilePageWrapper: React.FC<ProfilePageWrapperProps> = ({ targetUserId }) => {
  const currentUser = useAuthStore(s => s.user);
  const router = useRouter();
  const { startLoading } = useGlobalProgress();

  const [userData, setUserData] = useState<CrimChartUserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [connectionsPanel, setConnectionsPanel] = useState<{ tab: 'followers' | 'following'; userId: string } | null>(null);

  const openConnections = useCallback((tab: 'followers' | 'following', targetId: string) => {
    const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
    startLoading();
    if (isDesktop) {
      setConnectionsPanel({ tab, userId: targetId });
    } else {
      router.push({ pathname: '/followers', params: { userId: targetId, tab } } as any);
    }
  }, [startLoading, router]);

  const isCurrentUser = !targetUserId || targetUserId === currentUser?.id;
  const activeUserId = targetUserId || currentUser?.id;

  useFocusEffect(
    useCallback(() => {
      if (!activeUserId) {
        setIsLoading(false);
        return;
      }

      const fetchUser = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', activeUserId)
            .single();

          if (data) {
            setUserData({
              id: data.id,
              username: data.display_name,
              profileImageUrl: data.profile_image_url,
              bio: data.bio,
              followersCount: data.followers_count || 0,
              followingCount: data.following_count || 0,
              channelCount: data.channels_created_count || 0,
              boxesCount: data.boxes_count || 0,
              boxSubmissionsCount: data.box_submissions_count || 0,
              postsCount: data.posts_count || 0,
              inboxCount: data.inbox_count || 0,
              crownTitle: data.crown_title,
            } as CrimChartUserModel);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        } finally {
          setIsLoading(false);
        }
      };

      if (isCurrentUser && currentUser) {
        setUserData(currentUser);
        setIsLoading(false);
        fetchUser(); // still fetch to update stats in background
      } else {
        setIsLoading(true);
        fetchUser();
      }
    }, [activeUserId, isCurrentUser, currentUser])
  );

  if (isLoading) {
    return <ProfilePageShimmer />;
  }

  // Define the actions dynamically based on the wrapper logic rather than inside ProfilePage
  const renderActions = () => {
    if (isCurrentUser) {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={() => {
              const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
              if (isDesktop) {
                setIsEditProfileOpen(true);
              } else {
                router.push('/edit-profile');
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TouchableOpacity
            onPress={() => router.push('/inbox')}
            style={[styles.actionBtn, styles.secondaryBtn]}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Inbox</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.actionRow}>
        <FollowUserButton targetUserId={activeUserId!} size="medium" style={styles.actionBtn} />
        <View style={{ width: 10 }} />
        <InboxUserButton
          targetUserId={activeUserId!}
          targetUserName={userData?.displayName || userData?.username || ''}
          targetUserAvatar={userData?.profileImageUrl || undefined}
          style={[styles.actionBtn, styles.secondaryBtn]}
          textStyle={styles.secondaryBtnText}
        />
      </View>
    );
  };

  return (
    <>
      <ProfilePage
        userId={activeUserId}
        userData={userData || undefined}
        customActions={renderActions()}
        isLoading={isLoading}
        onEditProfile={() => {
          const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
          if (isDesktop) {
            setIsEditProfileOpen(true);
          } else {
            router.push('/edit-profile');
          }
        }}
        onOpenConnections={openConnections}
      />
      <EditProfilePage isModal={true} visible={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      {connectionsPanel && (
        <FollowersListPage
          targetUserId={connectionsPanel.userId}
          initialTab={connectionsPanel.tab}
          isPanel={true}
          onClose={() => setConnectionsPanel(null)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row'
  },
  actionBtn: {
    minWidth: 100,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#FACD11',
    flexGrow: 2
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexGrow: 1
  },
  primaryBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13
  },
  secondaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13
  },
});
