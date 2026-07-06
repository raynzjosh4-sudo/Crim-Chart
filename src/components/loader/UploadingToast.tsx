import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
interface UploadingToastProps {
  visible: boolean;
  message?: string;
}
export function UploadingToast({
  visible,
  message = 'Uploading...'
}: UploadingToastProps) {
  const styles = useStyles(colors => ({
    overlay: {
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(25, 25, 25, 0.95)',
      zIndex: 100,
      padding: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    text: {
      color: colors.text,
      fontWeight: 'bold',
      marginLeft: 12
    }
  }));
  if (!visible) return null;
  return <View style={styles.overlay}>
      <ActivityIndicator size="small" color="#FACD11" />
      <Text style={styles.text}>{message}</Text>
    </View>;
}