import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mic } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface MicrophonePermissionDialogProps {
  onAllow: () => void;
  onDeny: () => void;
}

export const MicrophonePermissionDialog: React.FC<MicrophonePermissionDialogProps> = ({
  onAllow,
  onDeny,
}) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <View style={styles.iconWrapper}>
          <Mic size={40} color={colors.primary} />
        </View>

        <Text style={styles.title}>Record Voice Notes</Text>
        
        <Text style={styles.description}>
          Crown needs access to your microphone so you can record and send voice messages directly to the channel.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onDeny} style={styles.notNowBtn}>
            <Text style={styles.notNowText}>Not Now</Text>
          </TouchableOpacity>

          <View style={{ width: 12 }} />

          <TouchableOpacity onPress={onAllow} style={styles.allowBtn}>
            <Text style={styles.allowText}>Allow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
  },
  dialog: {
    backgroundColor: '#2A2A2A', // surfaceContainerHighest
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  iconWrapper: {
    padding: 20,
    backgroundColor: 'rgba(250, 205, 17, 0.1)',
    borderRadius: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  notNowBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  notNowText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '600',
  },
  allowBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  allowText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
