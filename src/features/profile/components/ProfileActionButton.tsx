import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/core/theme/colors';
interface ProfileActionButtonProps {
  label: string;
  isPrimary?: boolean;
  onPress: () => void;
  flex?: number;
}
export const ProfileActionButton: React.FC<ProfileActionButtonProps> = ({
  label,
  isPrimary = false,
  onPress,
  flex = 1
}) => {
  const styles = useStyles(colors => ({
    container: {
      height: 34,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    containerPrimary: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 4
    },
    containerSecondary: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)'
    },
    label: {
      fontWeight: '800',
      fontSize: 12,
      letterSpacing: 0.2
    },
    labelPrimary: {
      color: colors.background
    },
    labelSecondary: {
      color: colors.text
    }
  }));
  return <TouchableOpacity style={[styles.container, isPrimary ? styles.containerPrimary : styles.containerSecondary, {
    flex
  }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
        {label}
      </Text>
    </TouchableOpacity>;
};