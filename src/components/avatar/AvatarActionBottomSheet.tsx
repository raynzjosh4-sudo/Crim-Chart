import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, useWindowDimensions, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
interface AvatarActionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onViewStatuses: () => void;
  onViewProfilePage: () => void;
  avatarUrl?: string | null;
  name?: string;
  anchorPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}
export const AvatarActionBottomSheet: React.FC<AvatarActionBottomSheetProps> = ({
  visible,
  onClose,
  onViewStatuses,
  onViewProfilePage,
  avatarUrl,
  name,
  anchorPosition
}) => {
  const styles = useStyles(colors => ({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    overlayDesktop: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    container: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 40,
      backgroundColor: '#0D0D0D',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32
    },
    containerDesktop: {
      width: 320,
      borderRadius: 24,
      paddingBottom: 24,
      paddingTop: 24
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 2,
      marginBottom: 24,
      alignSelf: 'center'
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 16
    },
    name: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text
    },
    actionsContainer: {
      gap: 16
    },
    actionButton: {
      paddingVertical: 8
    },
    actionText: {
      fontSize: 16,
      fontWeight: '600'
    }
  }));
  const {
    width,
    height
  } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  let customContainerStyle: any = {};
  if (isDesktop && anchorPosition) {
    const MENU_WIDTH = 320;
    const MENU_HEIGHT = 200; // approximate height
    let top = anchorPosition.y + anchorPosition.height + 8;
    let left = anchorPosition.x;
    if (left + MENU_WIDTH > width) {
      left = anchorPosition.x + anchorPosition.width - MENU_WIDTH;
    }
    if (top + MENU_HEIGHT > height) {
      top = anchorPosition.y - MENU_HEIGHT - 8;
    }
    customContainerStyle = {
      position: 'absolute',
      top,
      left
    };
  }
  return <Modal visible={visible} transparent animationType={isDesktop ? "fade" : "slide"} onRequestClose={onClose}>
      <View style={[styles.overlay, isDesktop && !anchorPosition && styles.overlayDesktop]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.container, isDesktop && styles.containerDesktop, customContainerStyle]}>
          {!isDesktop && <View style={styles.dragHandle} />}

          <View style={styles.header}>
            <ExpoImage source={{
            uri: avatarUrl || 'https://via.placeholder.com/60'
          }} style={styles.avatar} contentFit="cover" />
            <Text style={styles.name}>{name || '-'}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity activeOpacity={1} style={styles.actionButton} onPress={() => {
            onClose();
            onViewStatuses();
          }}>
              <Text style={[styles.actionText, {
              color: '#FACD11'
            }]}>View Statuses</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={1} style={styles.actionButton} onPress={() => {
            onClose();
            onViewProfilePage();
          }}>
              <Text style={[styles.actionText, {
              color: 'rgba(255,255,255,0.7)'
            }]}>View Profile Page</Text>
            </TouchableOpacity>
          </View>

          <View style={{
          height: 24
        }} />
        </View>
      </View>
    </Modal>;
};