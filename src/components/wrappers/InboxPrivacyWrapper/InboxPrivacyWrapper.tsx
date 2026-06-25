import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useChatStore } from '@/features/messaging/application/useChatStore';

export interface InboxPrivacyWrapperProps {
  children: React.ReactNode;
  participantId?: string;
  isPending: boolean;
  isSender: boolean;
}

export const InboxPrivacyWrapper: React.FC<InboxPrivacyWrapperProps> = ({ 
  children, 
  participantId, 
  isPending, 
  isSender 
}) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const checkInboxPrivacy = useChatStore(state => state.checkInboxPrivacy);

  useEffect(() => {
    const fetchPrivacy = async () => {
      if (!participantId) {
        return;
      }
      
      const privacy = await checkInboxPrivacy(participantId);
      setIsBlocked(privacy.isBlocked);
      setIsLocked(privacy.isLocked);
    };

    fetchPrivacy();
  }, [participantId, checkInboxPrivacy]);

  // If the user is blocked, we don't show the inbox at all.
  if (isBlocked) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>User not found or unavailable.</Text>
      </View>
    );
  }

  // If the target user has locked their intents, and the current user is the sender of a pending request
  // (meaning the request is not yet accepted), we should block access or restrict messaging.
  if (isLocked && isPending && isSender) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockedText}>This user has locked their connection intents.</Text>
        <Text style={styles.lockedSubText}>They must accept your request before you can interact.</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    textAlign: 'center',
  },
  lockedText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedSubText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  }
});
