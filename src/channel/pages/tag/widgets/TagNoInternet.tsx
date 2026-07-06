import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
interface TagNoInternetProps {
  onRetry: () => void;
}
export const TagNoInternet: React.FC<TagNoInternetProps> = ({
  onRetry
}) => {
  const styles = useStyles(colors => ({
    container: {
      width: '100%',
      padding: 40,
      alignItems: 'center'
    },
    iconWrapper: {
      padding: 20,
      borderRadius: 999,
      backgroundColor: 'rgba(207,102,121,0.1)'
    },
    title: {
      color: 'rgba(255,255,255,0.95)',
      fontSize: 18,
      fontWeight: '900',
      textAlign: 'center'
    },
    subtitle: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center'
    },
    button: {
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.text
    },
    buttonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '900'
    }
  }));
  return <View style={styles.container}>
    <View style={styles.iconWrapper}>
      <WifiOff color="#CF6679" size={40} />
    </View>
    <View style={{
      height: 20
    }} />
    <Text style={styles.title}>No Internet Connection</Text>
    <View style={{
      height: 8
    }} />
    <Text style={styles.subtitle}>
      Please check your connection and try again.
    </Text>
    <View style={{
      height: 24
    }} />
    <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
      <Text style={styles.buttonText}>Retry</Text>
    </TouchableOpacity>
  </View>;
};