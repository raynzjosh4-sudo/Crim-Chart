import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface InboxRequestWidgetProps {
  displayName: string;
  isReceiver: boolean;
  onAccept?: () => void;
}

export const InboxRequestWidget: React.FC<InboxRequestWidgetProps> = ({
  displayName,
  isReceiver,
  onAccept
}) => {
  if (!isReceiver) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Your messages will be delivered once {displayName} accepts your inbox request.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.receiverContainer}>
      <Text style={styles.receiverText}>
        {displayName} wants to connect with you in what kind of relation connection? Accept the request to find out!
      </Text>
      <TouchableOpacity style={styles.acceptButton} onPress={onAccept} activeOpacity={0.8}>
        <Text style={styles.acceptButtonText}>Accept Request</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  text: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
  },
  receiverContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  receiverText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  }
});
