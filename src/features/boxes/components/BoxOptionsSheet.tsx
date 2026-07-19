import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { RequireAuthWrapper } from '@/components/wrappers/RequireAuthWrapper';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useBlockUser } from '@/features/profile/hooks/useBlockUser';
import * as Clipboard from 'expo-clipboard';
import { Flag, Link2, Share as ShareIcon, UserX, X } from 'lucide-react-native';
import {
  Dimensions,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BoxOptionsSheetProps {
  boxId: string;
  boxTitle?: string;
  authorId?: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  visible: boolean;
  onClose: () => void;
  anchorPosition?: { x: number; y: number };
}

export const BoxOptionsSheet: React.FC<BoxOptionsSheetProps> = ({ boxId, boxTitle, authorId, authorName, authorAvatarUrl, visible, onClose, anchorPosition }) => {
  const insets = useSafeAreaInsets();
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const { blockUser } = useBlockUser();
  const currentUser = useAuthStore(state => state.user);

  const handleBlockUser = async () => {
    if (!authorId) return;
    const success = await blockUser(authorId, authorName ?? undefined, authorAvatarUrl ?? undefined);
    if (success) {
      onClose();
    }
  };

  const handleReportBox = async () => {
    if (!boxId) return;
    ChartToast.showSuccess(null, { title: 'Report Submitted', message: 'Thank you for reporting this box. We will review it shortly.' });
    onClose();
  };

  const handleShare = async () => {
    if (!boxId) return;
    try {
      const url = `https://crimchart.com/music-box/${boxId}`;
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(url);
        ChartToast.showSuccess(null, { title: 'Link Copied', message: 'Box link copied to clipboard.' });
      } else {
        await Share.share({
          message: `Listen to this Music Box on Crimchart: ${url}`,
          url: url,
        });
      }
      onClose();
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleCopyLink = async () => {
    if (!boxId) return;
    try {
      const url = `https://crimchart.com/music-box/${boxId}`;
      await Clipboard.setStringAsync(url);
      ChartToast.showSuccess(null, { title: 'Link Copied', message: 'Box link copied to clipboard.' });
      onClose();
    } catch (error) {
      console.error('Failed to copy link', error);
    }
  };

  const getDesktopStyle = () => {
    if (!anchorPosition) return {};

    let left = anchorPosition.x - 200;
    if (left + 250 > width) {
      left = width - 260;
    }
    if (left < 10) left = 10;

    let top = anchorPosition.y + 10;

    return {
      position: 'absolute' as const,
      top,
      left,
      width: 250,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      shadowColor: '#FFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    };
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                isDesktop ? getDesktopStyle() : styles.bottomSheet,
                !isDesktop && { paddingBottom: insets.bottom + 20 },
              ]}
            >
              {!isDesktop && (
                <View style={styles.sheetHeader}>
                  <View style={styles.dragHandle} />
                </View>
              )}

              <View style={isDesktop ? styles.desktopMenuContainer : styles.mobileMenuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
                  <ShareIcon size={24} color={theme.colors.text} />
                  <Text style={styles.menuItemText}>Share via...</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={handleCopyLink}>
                  <Link2 size={24} color={theme.colors.text} />
                  <Text style={styles.menuItemText}>Copy Link</Text>
                </TouchableOpacity>

                <RequireAuthWrapper>
                  {({ checkAuth }) => (
                    <>
                      {authorId && currentUser?.id !== authorId && (
                        <TouchableOpacity style={styles.menuItem} onPress={(e) => checkAuth(handleBlockUser, e)} activeOpacity={0.8}>
                          <UserX size={24} color={theme.colors.error} />
                          <Text style={[styles.menuItemText, { color: theme.colors.error }]}>
                            Block {authorName || 'User'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity style={styles.menuItem} onPress={(e) => checkAuth(handleReportBox, e)} activeOpacity={0.8}>
                        <Flag size={24} color={theme.colors.error} />
                        <Text style={[styles.menuItemText, { color: theme.colors.error }]}>Report Box</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </RequireAuthWrapper>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const themeStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: Platform.OS === 'web' && Dimensions.get('window').width >= 768 ? 'transparent' : 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    bottomSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 16,
      paddingBottom: 20,
    },
    sheetHeader: {
      alignItems: 'center',
      marginBottom: 10,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 2,
    },
    mobileMenuContainer: {
      paddingTop: 8,
    },
    desktopMenuContainer: {
      paddingVertical: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 16,
    },
    menuItemText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
