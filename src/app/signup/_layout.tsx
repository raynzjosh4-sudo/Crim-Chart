import { Stack } from 'expo-router';
import React from 'react';

export default function SignupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }} />
  );
}
