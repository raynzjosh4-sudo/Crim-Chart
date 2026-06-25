import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useEffect, useState } from 'react';
import { ChannelModel } from '../models/ChannelModel';
import { useChannelData } from './useChannelData';

export type UserChannelRole = 'owner' | 'admin' | 'member' | 'follower' | 'none';

const useCurrentUserRole = (channel: ChannelModel | null): { role: UserChannelRole, memberCanChat: boolean } => {
  const { user } = useAuthStore();
  const [roleInfo, setRoleInfo] = useState<{ role: UserChannelRole, memberCanChat: boolean }>({ role: 'none', memberCanChat: false });

  useEffect(() => {
    if (!channel || !user?.id) {
      setRoleInfo({ role: 'none', memberCanChat: false });
      return;
    }

    let isMounted = true;

    const checkRole = async () => {
      // 1. Are they the creator?
      if (channel.creatorId === user.id || channel.creatorUser?.id === user.id) {
        if (isMounted) setRoleInfo({ role: 'owner', memberCanChat: true });
        return;
      }

      // 2. Are they a member/admin?
      const { data: memberData } = await supabase
        .from('channel_members')
        .select('role, can_chat')
        .eq('channel_id', channel.id)
        .eq('user_id', user.id)
        .single();

      if (isMounted) {
        if (memberData) {
          setRoleInfo({ role: memberData.role as UserChannelRole, memberCanChat: memberData.can_chat ?? true });
        } else {
          setRoleInfo({ role: 'none', memberCanChat: false });
        }
      }
    };

    checkRole();

    return () => { isMounted = false; };
  }, [channel, user?.id]);

  return roleInfo;
};

export function useChannelPermissions(channelId: string | undefined) {
  const { user: realUser } = useAuthStore();
  const { channel, loading } = useChannelData(channelId);
  const { role: realRole, memberCanChat: realMemberCanChat } = useCurrentUserRole(channel);

  // ==========================================
  // 🐛 DEBUG OVERRIDES (FOR TESTING ONLY)
  // Toggle `ENABLE_DEBUG_USER` to true to test different restrictions!
  // ==========================================
  const ENABLE_DEBUG_USER = false;

  const debugUser = {
    ...realUser,
    id: realUser?.id || 'debug_user_id',
    birthday: new Date('2015-01-01'), // Change to test Age (e.g. 2015 = 11 years old)
    country: 'Canada',                // Change to test Country
  } as any;

  // Set to 'none', 'member', 'admin', or 'owner'
  const debugRole: UserChannelRole = 'admin';

  const user = ENABLE_DEBUG_USER ? debugUser : realUser;
  const role = ENABLE_DEBUG_USER ? debugRole : realRole;
  const memberCanChat = ENABLE_DEBUG_USER ? false : realMemberCanChat;
  // ==========================================

  if (loading || !channel) {
    return {
      canView: true,   // optimistic: assume viewable while loading to prevent block-page flash
      canJoin: false,
      canComment: false,
      canPostFeed: false,
      canPostStatus: false,
      canChat: false,
      canInvite: false,
      canInviteAdmins: false,
      canLeave: false,
      needsLeaveRequest: false,
      canDelete: false,
      canReport: false,
      meetsAgeRequirement: false,
      meetsCountryRequirement: false,
      role: 'none' as UserChannelRole,
      viewBlockReason: null,
      loading,
    };
  }

  const isOwnerOrAdmin = role === 'owner' || role === 'admin';
  const isMember = role === 'member' || isOwnerOrAdmin;
  const isFollower = role === 'follower' || isMember; // members conceptually include followers

  // Evaluate canComment
  let canComment = false;
  const commentingBy = channel.allowCommentingBy?.toLowerCase() || 'all';
  if (commentingBy === 'all') canComment = true;
  else if (commentingBy === 'followers') canComment = isFollower;
  else if (commentingBy === 'joined members') canComment = isMember;
  else if (commentingBy === 'none (only me)') canComment = isOwnerOrAdmin;

  // Evaluate canPostFeed
  let canPostFeed = false;
  const postingBy = channel.allowPostingBy?.toLowerCase() || 'all';
  if (postingBy === 'all') canPostFeed = true;
  else if (postingBy === 'followers') canPostFeed = isFollower;
  else if (postingBy === 'joined members') canPostFeed = isMember;
  else if (postingBy === 'none (only me)') canPostFeed = isOwnerOrAdmin;

  // Evaluate canPostStatus
  let canPostStatus = false;
  const statusBy = channel.allowStatusPostingBy?.toLowerCase() || 'all';
  if (statusBy === 'all') canPostStatus = true;
  else if (statusBy === 'joined members') canPostStatus = isMember;
  else if (statusBy === 'none (only me)' || statusBy === 'only me') canPostStatus = isOwnerOrAdmin;

  // console.log('DEBUG STATUS:', { statusBy, allowStatusPostingBy: channel.allowStatusPostingBy, canPostStatus, isOwnerOrAdmin, role });

  // Evaluate canChat
  let canChat = false;
  const chatBy = channel.allowChattingBy?.toLowerCase() || 'all';
  if (chatBy === 'all') canChat = true;
  else if (chatBy === 'joined members') canChat = isMember;
  else if (chatBy === 'none (only me)') canChat = isOwnerOrAdmin;
  else if (chatBy === 'selected members') canChat = isOwnerOrAdmin || (isMember && memberCanChat);

  // Evaluate canInvite (for "Invite followers" button)
  let canInvite = false;
  const inviteBy = channel.allowInvitationsBy?.toLowerCase() || 'all';
  if (inviteBy === 'all') canInvite = true;
  else if (inviteBy === 'joined members') canInvite = isMember;
  else if (inviteBy === 'none (only me)') canInvite = isOwnerOrAdmin;

  // Evaluate canInviteAdmins
  let canInviteAdmins = isOwnerOrAdmin;

  // Evaluate canLeave
  let canLeave = true;
  if (isOwnerOrAdmin) {
    canLeave = false;
  }

  const needsLeaveRequest = channel.preventLeaving && isMember && !isOwnerOrAdmin;

  // Evaluate canDelete
  const canDelete = role === 'owner';

  // Evaluate canReport
  const canReport = !isOwnerOrAdmin;

  // Evaluate age and country restrictions
  let meetsAgeRequirement = true;
  if (user?.birthday) {
    const ageDiffMs = Date.now() - new Date(user.birthday).getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (channel.ageRestriction === '18+' && age < 18) {
      meetsAgeRequirement = false;
    } else if (channel.ageRestriction === '21+' && age < 21) {
      meetsAgeRequirement = false;
    }
  }

  let meetsCountryRequirement = true;
  if (channel.countryRestrictions && channel.countryRestrictions.length > 0) {
    // If it's an array of strings, it might include 'Global'
    const isGlobal = channel.countryRestrictions.includes('Global' as any);
    if (!isGlobal) {
      if (!user?.country) {
        meetsCountryRequirement = false;
      } else {
        // Country restrictions might be an array of strings or array of country objects
        const allowedCountries = channel.countryRestrictions.map((c: any) => typeof c === 'string' ? c : c.name);
        if (!allowedCountries.includes(user.country)) {
          meetsCountryRequirement = false;
        }
      }
    }
  }

  // Evaluate canView
  let canView = true;
  let viewBlockReason: string | null = null;
  const joinMethod = channel.joinMethod || 'anyone';

  // console.log(`\n--- [DEBUG canView] ---`);
  // console.log(`Channel ID: ${channel.id}`);
  // console.log(`User ID: ${user?.id}`);
  // console.log(`Role: ${role}, isMember: ${isMember}`);
  // console.log(`Join Method: ${joinMethod}`);

  if ((joinMethod === 'invite' || joinMethod === 'request') && !isMember) {
    // console.log(`❌ BLOCKED: joinMethod is '${joinMethod}' and user is not a member.`);
    canView = false;
    viewBlockReason = "This channel is private. You must request to join to view its content and interact with members.";
  }
  if (!meetsAgeRequirement && !isOwnerOrAdmin) {
    // console.log(`❌ BLOCKED: Age restriction is '${channel.ageRestriction}'. User birthday is '${user?.birthday}'.`);
    canView = false;
    viewBlockReason = `You do not meet the age requirement of ${channel.ageRestriction} to view this channel.`;
  } else if (!meetsAgeRequirement && isOwnerOrAdmin) {
    // console.log(`✅ BYPASS: Age restriction failed but user is Owner/Admin.`);
  }

  if (!meetsCountryRequirement && !isOwnerOrAdmin) {
    // console.log(`❌ BLOCKED: Country restrictions are '${JSON.stringify(channel.countryRestrictions)}'. User country is '${user?.country}'.`);
    canView = false;
    viewBlockReason = "This channel is not available in your region.";
  } else if (!meetsCountryRequirement && isOwnerOrAdmin) {
    // console.log(`✅ BYPASS: Country restriction failed but user is Owner/Admin.`);
  }

  if (canView) {
    // console.log(`✅ GRANTED: User can view this channel.`);
  }
  // console.log(`-----------------------\n`);

  // Evaluate canJoin (for public channels or if they meet requirements)
  let canJoin = true;
  if (!meetsAgeRequirement || !meetsCountryRequirement) {
    canJoin = false;
  }
  // If already a member, they don't need to join. But if not, can they?
  // joinMethod 'invite' usually means they can't just 'join' clicking a button unless they have an invite token.
  // For the 'join_channel' wrapper on a button, if it's 'invite', we might hide the button.
  if (joinMethod === 'invite' && !isMember) {
    canJoin = false;
  }

  return {
    canView,
    canJoin,
    canComment,
    canPostFeed,
    canPostStatus,
    canChat,
    canInvite,
    canInviteAdmins,
    canLeave,
    needsLeaveRequest,
    canDelete,
    canReport,
    meetsAgeRequirement,
    meetsCountryRequirement,
    role,
    loading,
    viewBlockReason,
  };
}
