import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FollowersListPage } from '@/profile/pages/FollowersListPage';

export default function FollowersScreen() {
  const { userId, tab } = useLocalSearchParams<{ userId: string; tab?: 'followers' | 'following' }>();
  return (
    <FollowersListPage
      targetUserId={userId ?? ''}
      initialTab={tab === 'following' ? 'following' : 'followers'}
    />
  );
}
