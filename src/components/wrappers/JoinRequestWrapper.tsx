import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { channelRepository } from '@/channel/data/channelRepository';

interface JoinRequestWrapperProps {
  channelId?: string;
  children: (props: {
    hasRequested: boolean;
    handleJoinRequest: () => Promise<void>;
  }) => React.ReactNode;
}

export const JoinRequestWrapper: React.FC<JoinRequestWrapperProps> = ({
  channelId,
  children,
}) => {
  const user = useAuthStore((s) => s.user);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkExistingRequest = async () => {
      if (!user || !channelId) return;
      
      const { data, error } = await supabase
        .from('channel_requests')
        .select('id')
        .eq('channel_id', channelId)
        .eq('requested_by_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (isMounted && data) {
        setHasRequested(true);
      }
    };
    checkExistingRequest();

    return () => {
      isMounted = false;
    };
  }, [channelId, user?.id]);

  const handleJoinRequest = async () => {
    if (!user || !channelId) return;
    try {
      await channelRepository.createChannelRequest(
        channelId,
        user.id,
        'join_request',
        user.id
      );
      setHasRequested(true);
      Alert.alert('Success', 'Your join request has been sent successfully.');
    } catch (e: any) {
      if (
        e.code === '23505' ||
        e.message?.includes('unique_pending_request_idx')
      ) {
        setHasRequested(true);
        Alert.alert(
          'Request Pending',
          'You have already sent a join request to this channel.'
        );
      } else {
        Alert.alert('Error', e.message || 'Failed to send join request');
      }
    }
  };

  return <>{children({ hasRequested, handleJoinRequest })}</>;
};
