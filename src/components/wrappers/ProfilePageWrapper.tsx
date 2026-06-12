import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { supabase } from '@/core/supabase/client';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ProfilePage } from '@/profile/pages/ProfilePage';
import { FollowUserButton } from '@/components/FollowUserButton';
import { InboxUserButton } from '@/components/InboxUserButton';
import { useRouter } from 'expo-router';

interface ProfilePageWrapperProps {
  targetUserId?: string;
}

export const ProfilePageWrapper: React.FC<ProfilePageWrapperProps> = ({ targetUserId }) => {
  const currentUser = useAuthStore(s => s.user);
  const router = useRouter();
  
  const [userData, setUserData] = useState<CrimChartUserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isCurrentUser = !targetUserId || targetUserId === currentUser?.id;
  const activeUserId = targetUserId || currentUser?.id;

  useEffect(() => {
    if (!activeUserId) {
      setIsLoading(false);
      return;
    }

    if (isCurrentUser && currentUser) {
      // It's the current user, we already have their data in the auth store
      setUserData(currentUser);
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
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
            crownTitle: data.crown_title,
          } as CrimChartUserModel);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [activeUserId, isCurrentUser, currentUser]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC400" />
      </View>
    );
  }

  // Define the actions dynamically based on the wrapper logic rather than inside ProfilePage
  const renderActions = () => {
    if (isCurrentUser) {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={() => router.push('/edit-profile')}
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
          style={[styles.actionBtn, styles.secondaryBtn]}
          textStyle={styles.secondaryBtnText}
        />
      </View>
    );
  };

  return (
    <ProfilePage 
      userId={activeUserId} 
      userData={userData || undefined} 
      customActions={renderActions()} 
    />
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
    flex: 1,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: { 
    backgroundColor: '#FACD11', 
    flex: 2 
  },
  secondaryBtn: { 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    flex: 1 
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
