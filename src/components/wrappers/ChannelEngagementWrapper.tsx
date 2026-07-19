import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useEffect, useState } from 'react';
import { ChannelEngagementButton, EngagementUiState } from './ChannelEngagementButton';
import { RequireAuthWrapper } from './RequireAuthWrapper';

interface ChannelEngagementWrapperProps {
  channelId: string;
  joinMethod: string;
  creatorId: string;
}

export const ChannelEngagementWrapper: React.FC<ChannelEngagementWrapperProps> = ({
  channelId,
  joinMethod,
  creatorId,
}) => {
  const user = (useAuthStore as any).getState?.()?.user ?? null;
  const [isLocalProcessing, setIsLocalProcessing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || creatorId === user.id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchMembership = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_members')
          .select('is_following')
          .eq('channel_id', channelId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (isMounted) {
          if (data) {
            setIsFollowing(true);
          } else {
            setIsFollowing(false);
          }
        }

        if (joinMethod === 'request' && !data && isMounted) {
          const { data: reqData } = await supabase
            .from('invitation_requests')
            .select('status')
            .eq('channel_id', channelId)
            .eq('user_id', user.id)
            .maybeSingle();
          if (reqData && isMounted) {
            setRequestStatus(reqData.status);
          }
        }
      } catch (err) {
        // ignore
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMembership();
    return () => { isMounted = false; };
  }, [channelId, user?.id, creatorId]);

  const followChannel = async () => {
    if (!user) return;
    try {
      const { error: rpcError } = await supabase.rpc('follow_channel', { channel_id: channelId });
      if (rpcError) throw rpcError;
      setIsFollowing(true);
      return;
    } catch (rpcErr: any) {
      console.error('[ChannelEngagement] RPC follow_channel failed:', JSON.stringify(rpcErr, null, 2));
      console.log('[ChannelEngagement] Trying to INSERT (instead of upsert) into channel_members...');
      const { error } = await supabase.from('channel_members').insert({
        channel_id: channelId,
        user_id: user.id,
        role: 'follower',
        is_following: true,
      });
      if (error) {
        console.error('[ChannelEngagement] Supabase error in followChannel INSERT:', JSON.stringify(error, null, 2));
        throw error;
      }
      setIsFollowing(true);
    }
  };

  const unfollowChannel = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', user.id);
    if (error) throw error;
    setIsFollowing(false);
  };

  const requestJoin = async () => {
    if (!user) return;
    const { error } = await supabase.from('invitation_requests').insert({
      channel_id: channelId,
      user_id: user.id,
      status: 'pending'
    });
    if (error) {
      console.error('[ChannelEngagement] Supabase error in requestJoin:', JSON.stringify(error, null, 2));
      throw error;
    }
    setRequestStatus('pending');
  };

  if (!user) {
    return (
      <RequireAuthWrapper>
        {({ checkAuth }) => (
          <ChannelEngagementButton uiState={EngagementUiState.OpenNotJoined} onTap={() => { checkAuth(() => {}); }} />
        )}
      </RequireAuthWrapper>
    );
  }

  if (creatorId === user.id) {
    return <ChannelEngagementButton uiState={EngagementUiState.Creator} onTap={() => { }} />;
  }

  if (isLocalProcessing || isLoading) {
    return <ChannelEngagementButton uiState={EngagementUiState.Processing} onTap={() => { }} />;
  }

  let computedState: EngagementUiState;
  if (isFollowing) {
    computedState = EngagementUiState.FullyJoined;
  } else if (requestStatus === 'pending') {
    computedState = EngagementUiState.Requested;
  } else {
    computedState = joinMethod === 'request' ? EngagementUiState.RestrictedNotRequested : EngagementUiState.OpenNotJoined;
  }

  const executeAction = async () => {
    setIsLocalProcessing(true);
    try {
      if (computedState === EngagementUiState.FullyJoined) {
        await unfollowChannel();
        ChartToast.showSuccess(null, { title: 'Unfollowed', message: 'Left channel.' });
      } else if (joinMethod === 'request') {
        await requestJoin();
        ChartToast.showSuccess(null, { title: 'Requested', message: 'Join request sent!' });
      } else {
        await followChannel();
        ChartToast.showSuccess(null, { title: 'Joined', message: 'Successfully joined channel!' });
      }
    } catch (e: any) {
      ChartToast.showError(null, { title: 'Action failed', message: e.message });
    } finally {
      setIsLocalProcessing(false);
    }
  };

  return <ChannelEngagementButton uiState={computedState} onTap={executeAction} />;
};
