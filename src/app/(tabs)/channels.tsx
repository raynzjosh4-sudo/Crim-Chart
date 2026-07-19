import React from 'react';
import ChannelsPage from '@/channel/pages/ChannelsPage';
import { AuthPlaceholderPage } from '@/components/wrappers/AuthPlaceholderPage';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export default function ChannelsTabScreen() {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <AuthPlaceholderPage title="Channels" featureName="channels" />;
  }

  return <ChannelsPage />;
}
