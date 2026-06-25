import { useChannelPermissions } from '@/channel/hooks/useChannelPermissions';

export type ChannelAction = 'view_channel' | 'join_channel' | 'post_comment' | 'post_feed' | 'invite_users' | 'invite_admins' | 'post_moment' | 'leave_channel' | 'edit_settings' | 'delete_channel' | 'report_channel' | 'participate_in_chat';

interface ChannelRestrictionWrapperProps {
  channelId?: string; // Expect channelId instead of the whole channel object
  requiredAction: ChannelAction;
  fallback: React.ReactNode | ((reason: string | null) => React.ReactNode);
  children: React.ReactNode;
}

export const ChannelRestrictionWrapper: React.FC<ChannelRestrictionWrapperProps> = ({
  channelId,
  requiredAction,
  fallback,
  children,
}) => {
  const { canView, canJoin, canComment, canPostFeed, canPostStatus, canChat, canInvite, canInviteAdmins, canLeave, canDelete, canReport, role, loading, viewBlockReason } = useChannelPermissions(channelId);

  if (!channelId) {
    return null;
  }

  // While loading, optimistically show children to prevent blocking flash.
  // Once permissions resolve, if access is denied we'll switch to the fallback.
  if (loading) {
    return <>{children}</>;
  }

  let hasPermission = true;

  if (requiredAction === 'view_channel' && !canView) {
    hasPermission = false;
  }

  if (requiredAction === 'join_channel' && !canJoin) {
    hasPermission = false;
  }

  if (requiredAction === 'post_comment' && !canComment) {
    hasPermission = false;
  }

  if (requiredAction === 'post_feed' && !canPostFeed) {
    hasPermission = false;
  }

  if (requiredAction === 'post_moment' && !canPostStatus) {
    hasPermission = false;
  }

  if (requiredAction === 'participate_in_chat' && !canChat) {
    hasPermission = false;
  }

  if (requiredAction === 'invite_users' && !canInvite) {
    hasPermission = false;
  }

  if (requiredAction === 'invite_admins' && !canInviteAdmins) {
    hasPermission = false;
  }

  if (requiredAction === 'leave_channel' && !canLeave) {
    hasPermission = false;
  }

  if (requiredAction === 'delete_channel' && !canDelete) {
    hasPermission = false;
  }

  if (requiredAction === 'report_channel' && !canReport) {
    hasPermission = false;
  }

  if (requiredAction === 'edit_settings' && role !== 'owner' && role !== 'admin') {
    hasPermission = false;
  }

  if (!hasPermission) {
    let reasonToPass: string | null = null;
    if (requiredAction === 'view_channel') {
      reasonToPass = viewBlockReason || null;
    }

    if (typeof fallback === 'function') {
      return <>{fallback(reasonToPass)}</>;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
