import React from 'react';

interface OnlyAdminGuardProps {
  channelId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const OnlyAdminGuard: React.FC<OnlyAdminGuardProps> = ({
  channelId: _channelId,
  children,
  fallback = null,
}) => {
  // TODO: replace with real useChannelAdmin hook when available
  const isAdmin = true;
  const isLoading = false;

  if (isLoading || !isAdmin) return <>{fallback}</>;
  return <>{children}</>;
};
