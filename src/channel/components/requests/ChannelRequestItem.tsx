import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AppAvatar from '@/components/avatar/AppAvatar';
import { colors } from '@/core/theme/colors';

interface ChannelRequestItemProps {
  requestId: string;
  targetUser: any;
  requestedBy: any;
  requestType: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const ChannelRequestItem: React.FC<ChannelRequestItemProps> = ({
  requestId,
  targetUser,
  requestedBy,
  requestType,
  onApprove,
  onReject
}) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (loading) return;
    setLoading(true);
    try {
      if (action === 'approve') await onApprove(requestId);
      else await onReject(requestId);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  // Determine who to show in the UI based on the request type
  // For join_request, we show who is requesting to join.
  // For invites, we show who was invited.
  const displayUser = requestType === 'join_request' ? requestedBy : targetUser;
  
  let subtitle = '';
  switch (requestType) {
    case 'join_request':
      subtitle = 'Requested to join';
      break;
    case 'admin_invite':
      subtitle = 'Invited as admin';
      break;
    case 'member_invite':
      subtitle = 'Invited as member';
      break;
    default:
      subtitle = 'Pending request';
  }

  if (!displayUser) return null;

  return (
    <View style={styles.container}>
      <AppAvatar url={displayUser.profile_image_url} size={48} />
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{displayUser.display_name || displayUser.username}</Text>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.approveButton]} 
            onPress={() => handleAction('approve')}
          >
            <Text style={styles.approveText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.rejectButton]} 
            onPress={() => handleAction('reject')}
          >
            <Text style={styles.rejectText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: colors.primary,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  approveText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  rejectText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  loadingContainer: {
    width: 148, // approximate width of the two buttons
    alignItems: 'center',
    justifyContent: 'center',
  }
});
