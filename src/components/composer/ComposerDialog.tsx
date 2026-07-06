import { useStyles } from "@/core/hooks/useStyles";
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ComposerWidget } from './ComposerWidget';
export const ComposerDialog = ({
  visible,
  onClose
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const styles = useStyles(colors => ({
    desktopOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    mobileOverlay: {
      flex: 1,
      backgroundColor: colors.background
    },
    desktopModal: {
      width: '90%',
      maxWidth: 600,
      minHeight: '30%',
      maxHeight: '85%',
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10
    },
    mobileModal: {
      flex: 1
    },
    desktopHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      padding: 16,
      paddingBottom: 0,
      zIndex: 10
    },
    mobileHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      padding: 16,
      paddingTop: 8,
      paddingBottom: 0,
      zIndex: 10
    }
  }));
  const theme = useCurrentTheme();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  return <Modal transparent={isDesktop} visible={visible} animationType={isDesktop ? "fade" : "slide"} onRequestClose={onClose}>
      <View style={isDesktop ? styles.desktopOverlay : styles.mobileOverlay}>
        {isDesktop ? <View style={[styles.desktopModal, {
        backgroundColor: theme.colors.background,
        borderColor: 'rgba(255,255,255,0.1)'
      }]}>
            <View style={styles.desktopHeader}>
              <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={{
            padding: 8,
            marginHorizontal: -8
          }}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ComposerWidget onPostSuccess={onClose} />
          </View> : <SafeAreaView style={[styles.mobileModal, {
        backgroundColor: theme.colors.background
      }]}>
            <View style={styles.mobileHeader}>
              <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={{
            padding: 8,
            marginHorizontal: -8
          }}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ComposerWidget onPostSuccess={onClose} />
          </SafeAreaView>}
      </View>
    </Modal>;
};