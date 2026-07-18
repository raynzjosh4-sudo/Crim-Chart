import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import * as Clipboard from 'expo-clipboard';
import { Link2, Settings, Share as ShareIcon, X } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onShareProfile: () => void;
  onSettings?: () => void;
  showSettings: boolean;
  anchorPosition?: { x: number; y: number } | null;
  profileUrl: string;
}

export const ProfileOptionsSheet: React.FC<ProfileOptionsSheetProps> = ({ 
  visible, 
  onClose, 
  onShareProfile, 
  onSettings,
  showSettings,
  anchorPosition,
  profileUrl
}) => {
  const insets = useSafeAreaInsets();
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const handleShare = () => {
    onShareProfile();
    onClose();
  };

  const handleSettings = () => {
    if (onSettings) onSettings();
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(profileUrl);
      ChartToast.showSuccess(null, { title: 'Link Copied', message: 'Profile link copied to clipboard.' });
      onClose();
    } catch (error) {
      console.error('Failed to copy link', error);
    }
  };

  const getDesktopStyle = () => {
    let left = anchorPosition ? anchorPosition.x - 200 : width - 260;
    let top = anchorPosition ? anchorPosition.y + 10 : 60;
    
    if (left + 250 > width) {
      left = width - 260;
    }
    if (left < 10) left = 10;

    return {
      position: 'absolute' as const,
      top: top,
      left: left,
      width: 250,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      shadowColor: theme.isDark ? '#FFFFFF' : '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.isDark ? 0.15 : 0.15,
      shadowRadius: 24,
      elevation: 10,
      paddingTop: 8,
      paddingBottom: 8,
      overflow: 'hidden' as const,
    };
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? 'fade' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      <View style={isDesktop ? styles.desktopOverlay : styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={isDesktop ? getDesktopStyle() : [styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          {!isDesktop && (
            <View style={styles.header}>
              <View style={{ width: 24 }} />
              <Text style={styles.title}>Profile Options</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionRow} onPress={handleShare} activeOpacity={0.8}>
              <ShareIcon size={24} color={theme.colors.text} />
              <Text style={styles.optionText}>Share Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={handleCopyLink} activeOpacity={0.8}>
              <Link2 size={24} color={theme.colors.text} />
              <Text style={styles.optionText}>Copy Link</Text>
            </TouchableOpacity>

            {showSettings && (
              <TouchableOpacity style={styles.optionRow} onPress={handleSettings} activeOpacity={0.8}>
                <Settings size={24} color={theme.colors.text} />
                <Text style={styles.optionText}>Settings</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  desktopOverlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden' as const,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  closeBtn: {
    padding: 4,
  },
  optionsContainer: {
    paddingTop: 8,
  },
  optionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
