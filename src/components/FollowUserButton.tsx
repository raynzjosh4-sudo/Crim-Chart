import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { UserPlus, UserCheck } from 'lucide-react-native';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';

export interface FollowUserButtonProps {
  targetUserId: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const FollowUserButton: React.FC<FollowUserButtonProps> = ({ targetUserId, size = 'medium', style }) => {
  const currentUser = useAuthStore(state => state.user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!currentUser?.id || !targetUserId || currentUser.id === targetUserId) {
      setIsLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUserId)
          .single();

        if (data) {
          setIsFollowing(true);
        }
      } catch (err) {
        console.log('Follow check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkFollowStatus();
  }, [currentUser?.id, targetUserId]);

  const handleToggleFollow = async () => {
    if (!currentUser?.id || isToggling || currentUser.id === targetUserId) return;
    
    setIsToggling(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUserId);
        setIsFollowing(false);
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: targetUserId,
          });
        setIsFollowing(true);
      }
    } catch (err) {
      console.log('Toggle follow error:', err);
    } finally {
      setIsToggling(false);
    }
  };

  if (!currentUser?.id || currentUser.id === targetUserId) {
    return null; // Don't show follow button for self or unauthenticated
  }

  // Adjust styles based on size
  const buttonHeight = size === 'small' ? 36 : size === 'large' ? 56 : 50;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 18;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[
        styles.button,
        { height: buttonHeight },
        isFollowing ? styles.followingBtn : styles.followBtn,
        style
      ]}
      onPress={handleToggleFollow}
      disabled={isLoading || isToggling}
    >
      {isLoading || isToggling ? (
        <ActivityIndicator size="small" color={isFollowing ? '#FFF' : '#000'} />
      ) : (
        <>
          {isFollowing ? (
            <UserCheck size={iconSize} color="#FFF" />
          ) : (
            <UserPlus size={iconSize} color="#000" />
          )}
          <Text
            style={[
              styles.text,
              { fontSize },
              isFollowing ? styles.followingText : styles.followText
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  followBtn: {
    backgroundColor: '#FFC400',
  },
  followingBtn: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  text: {
    fontWeight: '700',
  },
  followText: {
    color: '#000',
  },
  followingText: {
    color: '#FFF',
  },
});
