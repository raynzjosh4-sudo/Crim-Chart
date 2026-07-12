import { useStyles } from '@/core/hooks/useStyles';
import { Check, Grid, Image as ImageIcon, Music, Play } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AlbumDropdownPopoverProps {
  visible: boolean;
  onClose: () => void;
  activeTabKey: string;
  onSelectRecents: () => void;
  onSelectAllAlbums: () => void;
  isRecentsSelected: boolean;
}

export const AlbumDropdownPopover: React.FC<AlbumDropdownPopoverProps> = ({
  visible,
  onClose,
  activeTabKey,
  onSelectRecents,
  onSelectAllAlbums,
  isRecentsSelected
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const styles = useStyles((colors, scale) => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0)', // Invisible overlay to catch clicks outside
    },
    popover: {
      position: 'absolute',
      left: 16 * scale,
      backgroundColor: colors.surface,
      borderRadius: 12 * scale,
      minWidth: '50%',
      maxWidth: '80%',
      paddingVertical: 8 * scale,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 * scale },
      shadowOpacity: 0.3,
      shadowRadius: 8 * scale,
      elevation: 5,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14 * scale,
      paddingHorizontal: 16 * scale,
    },
    iconContainer: {
      marginRight: 16 * scale,
    },
    text: {
      color: colors.text,
      fontSize: 16 * scale,
      fontWeight: '500',
      flex: 1,
    },
    checkContainer: {
      marginLeft: 'auto',
    }
  }));

  // Determine text and icon based on active tab
  let MainIcon = ImageIcon;
  let mainText = t('common.photos', 'Photos');
  
  if (activeTabKey === 'videos') {
    MainIcon = Play;
    mainText = t('common.videos', 'Videos');
  } else if (activeTabKey === 'music') {
    MainIcon = Music;
    mainText = t('common.music', 'Music');
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.popover, { top: Math.max(16, insets.top) + 72 }]}>
              <TouchableOpacity style={styles.row} onPress={onSelectRecents} activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <MainIcon color={styles.text.color} size={20} />
                </View>
                <Text style={styles.text}>{mainText}</Text>
                {isRecentsSelected && (
                  <View style={styles.checkContainer}>
                    <Check color={styles.text.color} size={16} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.row} onPress={onSelectAllAlbums} activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <Grid color={styles.text.color} size={20} />
                </View>
                <Text style={styles.text}>{t('common.allAlbums', 'All albums')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
