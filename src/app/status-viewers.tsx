import React from 'react';
import { Stack } from 'expo-router';
import { ViewersPage } from '@/features/viewers_page/pages/ViewersPage';

export default function StatusViewersScreen() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Viewers',
        headerShown: true,
      }} />
      <ViewersPage />
    </>
  );
}
