import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface TypingStatusIndicatorProps {
  channelId: string;
  userId: string;
  isActive: boolean;
}

export const TypingStatusIndicator: React.FC<TypingStatusIndicatorProps> = ({
  channelId,
  userId,
  isActive,
}) => {
  const { colors } = useTheme();
  // In a real app, subscribe to Supabase realtime presence or your database stream here
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(isActive);

  useEffect(() => {
    // Mock effect to update online status
    setIsOnline(isActive);
  }, [isActive]);

  if (isTyping) {
    return (
      <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '500' }}>
        Typing...
      </Text>
    );
  }

  if (isOnline) {
    return (
      <Text style={{ fontSize: 12, color: '#4CAF50', fontWeight: '500' }}>
        Online
      </Text>
    );
  }

  return null;
};
