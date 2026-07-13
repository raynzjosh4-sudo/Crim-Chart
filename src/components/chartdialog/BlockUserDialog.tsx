import { useStyles } from "@/core/hooks/useStyles";
import { colors } from "@/core/theme/colors";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { TriangleAlert } from "lucide-react-native";

interface BlockUserDialogProps {
  visible: boolean;
  username: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const BlockUserDialog: React.FC<BlockUserDialogProps> = ({
  visible,
  username,
  onCancel,
  onConfirm
}) => {
  const styles = useStyles(() => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    dialogBox: {
      backgroundColor: '#000000',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: 24,
      width: '100%',
      maxWidth: 340,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 82, 82, 0.1)', // Use error color with opacity
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      fontSize: 15,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: 'row',
      width: '100%',
      gap: 12,
    },
    button: {
      flex: 1,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    confirmButton: {
      backgroundColor: colors.error,
    },
    cancelButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    confirmButtonText: {
      color: '#000000', // Keep contrast with error background
      fontSize: 16,
      fontWeight: '700',
    },
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialogBox}>
          <View style={styles.iconContainer}>
            <TriangleAlert size={28} color={colors.error as string} />
          </View>
          <Text style={styles.title}>Block {username}?</Text>
          <Text style={styles.description}>
            They won't be able to see your charts or interact with your posts.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Block</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
