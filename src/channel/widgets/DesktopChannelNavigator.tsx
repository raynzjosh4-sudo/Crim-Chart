import React from 'react';
import { useGlobalSearchParams } from 'expo-router';
import ChannelPage from '@/app/channel/channelpage';
import ChannelDetailsPage from '@/app/channel/settings/[id]';
import ChannelEditPage from '@/app/channel/settings/edit/[id]';
import PrivacyPermissionsPage from '@/app/channel/settings/privacy/[id]';

interface Props {
  channelId: string;
}

export function DesktopChannelNavigator({ channelId }: Props) {
  const { desktopChannelView } = useGlobalSearchParams<{ desktopChannelView?: string }>();

  switch (desktopChannelView) {
    case 'settings':
      return <ChannelDetailsPage channelIdOverride={channelId} />;
    case 'edit':
      return <ChannelEditPage channelIdOverride={channelId} />;
    case 'privacy':
      return <PrivacyPermissionsPage channelIdOverride={channelId} />;
    default:
      return <ChannelPage channelIdOverride={channelId} />;
  }
}
