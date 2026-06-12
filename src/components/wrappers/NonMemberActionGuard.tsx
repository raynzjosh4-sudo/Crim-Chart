import React from 'react';

interface NonMemberActionGuardProps {
  channelId: string;
  isOwnChannel: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const NonMemberActionGuard: React.FC<NonMemberActionGuardProps> = ({
  channelId: _channelId,
  isOwnChannel,
  children,
  fallback = null,
}) => {
  // TODO: replace with real useChannelMember hook when available
  const isMember = true;
  const isLoading = false;

  if (isOwnChannel) return <>{fallback}</>;
  if (isLoading || isMember) return <>{fallback}</>;
  return <>{children}</>;
};
