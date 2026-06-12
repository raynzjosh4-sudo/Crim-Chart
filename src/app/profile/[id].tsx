import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ProfilePageWrapper } from '@/components/wrappers/ProfilePageWrapper';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id) return null;
  
  return <ProfilePageWrapper targetUserId={id} />;
}
