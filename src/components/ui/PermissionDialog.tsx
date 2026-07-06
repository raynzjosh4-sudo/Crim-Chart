import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '@/core/theme/colors';
export interface PermissionDialogProps {
  visible: boolean;
  icon?: React.ReactNode;
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}
export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  visible,
  icon,
  title,
  description,
  cancelText = 'Not Now',
  confirmText = 'Continue',
  onCancel,
  onConfirm
}) => {
  const styles = useStyles(colors => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24
    },
    dialog: {
      backgroundColor: '#1E1E1E',
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 280,
      alignItems: 'center',
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 10
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 179, 0, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center'
    },
    description: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 24
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 8,
      width: '100%'
    },
    button: {
      flex: 1,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center'
    },
    cancelButton: {
      backgroundColor: 'rgba(255,255,255,0.08)'
    },
    confirmButton: {
      backgroundColor: colors.primary
    },
    cancelText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600'
    },
    confirmText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: 'bold'
    }
  }));
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm} activeOpacity={0.7}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>;
};