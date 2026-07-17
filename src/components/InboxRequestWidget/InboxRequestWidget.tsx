import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
export interface InboxRequestWidgetProps {
  displayName: string;
  isReceiver: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}
export const InboxRequestWidget: React.FC<InboxRequestWidgetProps> = ({
  displayName,
  isReceiver,
  onAccept,
  onDecline
}) => {
  const styles = useStyles(colors => ({
    container: {
      paddingHorizontal: 24,
      paddingBottom: 8,
      alignItems: 'center'
    },
    text: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: 13,
      textAlign: 'center'
    },
    receiverContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderTopWidth: 1,
      borderTopColor: '#333'
    },
    receiverText: {
      color: colors.text,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
      fontWeight: '500'
    },
    buttonsRow: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      gap: 12
    },
    acceptButton: {
      flex: 1,
      backgroundColor: colors.text,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      alignItems: 'center'
    },
    acceptButtonText: {
      color: colors.background,
      fontSize: 15,
      fontWeight: '700'
    },
    declineButton: {
      flex: 1,
      backgroundColor: colors.surfaceVariant,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      alignItems: 'center'
    },
    declineButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700'
    }
  }));
  if (!isReceiver) {
    return <View style={styles.container}>
        <Text style={styles.text}>
          Your messages will be delivered once {displayName} accepts your inbox request.
        </Text>
      </View>;
  }
  return <View style={styles.receiverContainer}>
      <Text style={styles.receiverText}>
        {displayName} wants to connect with you in what kind of relation connection? Accept the request to find out!
      </Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.declineButton} onPress={onDecline} activeOpacity={0.8}>
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept} activeOpacity={0.8}>
          <Text style={styles.acceptButtonText}>Accept Request</Text>
        </TouchableOpacity>
      </View>
    </View>;
};