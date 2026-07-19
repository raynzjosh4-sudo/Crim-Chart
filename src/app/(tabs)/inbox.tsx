import React from 'react';
import { InboxFullPage } from '@/features/messaging/pages/InboxFullPage';
import { AuthPlaceholderPage } from '@/components/wrappers/AuthPlaceholderPage';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export default function InboxScreen() {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <AuthPlaceholderPage title="Chat" featureName="messages" />;
  }

  return <InboxFullPage />;
}
