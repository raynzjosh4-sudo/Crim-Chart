import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ban, BellOff, Trash2 } from 'lucide-react-native';
interface InboxThreadOptionsDialogProps {
  visible: boolean;
  onClose: () => void;
  onBlockPress: () => void;
  onMutePress: () => void;
  onDeletePress: () => void;
  anchor?: {
    x: number;
    y: number;
  } | null;
  widgetSize?: number;
}
const {
  width: screenWidth
} = Dimensions.get('window');
export const InboxThreadOptionsDialog: React.FC<InboxThreadOptionsDialogProps> = ({
  visible,
  onClose,
  onBlockPress,
  onMutePress,
  onDeletePress,
  anchor,
  widgetSize = 50
}) => {
  const styles = useStyles(colors => ({
    overlay: {
      flex: 1,
      backgroundColor: 'transparent'
    },
    menu: {
      position: 'absolute',
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 8
      },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 2
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      flex: 1
    },
    icon: {
      marginRight: 12,
      opacity: 0.9
    },
    menuText: {
      fontSize: 15,
      fontWeight: '600'
    },
    divider: {
      height: 1,
      width: '100%',
      opacity: 0.2
    }
  }));
  const {
    colors
  } = useTheme();
  const menuWidth = 180;
  const menuHeight = 150;
  const arrowHeight = 10;
  const arrowWidth = 10;
  let menuTop = 90;
  let menuLeft = 20;
  let arrowLeft = 0;
  let arrowTop = 0;
  if (anchor) {
    menuTop = anchor.y - menuHeight - arrowHeight;
    if (menuTop < 50) {
      menuTop = anchor.y + widgetSize + arrowHeight;
    }
    menuLeft = anchor.x + widgetSize / 2 - menuWidth / 2;
    menuLeft = Math.max(10, Math.min(screenWidth - menuWidth - 10, menuLeft));
    arrowLeft = anchor.x + widgetSize / 2 - arrowWidth;
    arrowTop = menuTop < anchor.y ? menuTop + menuHeight - 1 : menuTop - arrowHeight + 1;
  }
  const isPointingDown = anchor && menuTop < anchor.y;
  return <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Arrow Border */}
          {anchor && <View style={{
          position: 'absolute',
          top: arrowTop + (isPointingDown ? 1 : -1),
          left: arrowLeft,
          width: 0,
          height: 0,
          borderLeftWidth: arrowWidth,
          borderRightWidth: arrowWidth,
          borderTopWidth: isPointingDown ? arrowHeight : 0,
          borderBottomWidth: isPointingDown ? 0 : arrowHeight,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: isPointingDown ? colors.border : 'transparent',
          borderBottomColor: isPointingDown ? 'transparent' : colors.border,
          zIndex: 1
        }} />}

          {/* Arrow Fill */}
          {anchor && <View style={{
          position: 'absolute',
          top: arrowTop + (isPointingDown ? 0 : 0),
          left: arrowLeft,
          width: 0,
          height: 0,
          borderLeftWidth: arrowWidth,
          borderRightWidth: arrowWidth,
          borderTopWidth: isPointingDown ? arrowHeight : 0,
          borderBottomWidth: isPointingDown ? 0 : arrowHeight,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: isPointingDown ? colors.card : 'transparent',
          borderBottomColor: isPointingDown ? 'transparent' : colors.card,
          zIndex: 3
        }} />}

          {/* Menu Box */}
          <View style={[styles.menu, {
          backgroundColor: colors.card,
          borderColor: colors.border,
          top: anchor ? menuTop : 90,
          left: anchor ? menuLeft : 20,
          height: menuHeight,
          width: menuWidth
        }]}>
            <TouchableOpacity activeOpacity={1} style={styles.menuItem} onPress={onBlockPress}>
              <Ban size={18} color="#FF3B30" style={styles.icon} />
              <Text style={[styles.menuText, {
              color: '#FF3B30'
            }]}>Block User</Text>
            </TouchableOpacity>
            
            <View style={[styles.divider, {
            backgroundColor: colors.border
          }]} />
            
            <TouchableOpacity activeOpacity={1} style={styles.menuItem} onPress={onMutePress}>
              <BellOff size={18} color="#FF9500" style={styles.icon} />
              <Text style={[styles.menuText, {
              color: '#FF9500'
            }]}>Mute Chat</Text>
            </TouchableOpacity>

            <View style={[styles.divider, {
            backgroundColor: colors.border
          }]} />

            <TouchableOpacity activeOpacity={1} style={styles.menuItem} onPress={onDeletePress}>
              <Trash2 size={18} color="#FF3B30" style={styles.icon} />
              <Text style={[styles.menuText, {
              color: '#FF3B30'
            }]}>Delete Thread</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>;
};