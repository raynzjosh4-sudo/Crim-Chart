import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useBlockUser } from '@/features/profile/hooks/useBlockUser';
import { useReportPost } from '@/features/profile/hooks/useReportPost';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import * as Clipboard from 'expo-clipboard';
import { Flag, Link2, Share as ShareIcon, UserX, X } from 'lucide-react-native';
import {
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

interface PostOptionsSheetProps {
  postId: string;
  authorId?: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  visible: boolean;
  onClose: () => void;
  anchorPosition?: { x: number; y: number };
}

export const PostOptionsSheet: React.FC<PostOptionsSheetProps> = ({ postId, authorId, authorName, authorAvatarUrl, visible, onClose, anchorPosition }) => {
  const insets = useSafeAreaInsets();
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const { blockUser } = useBlockUser();
  const { reportPost } = useReportPost();
  const currentUser = useAuthStore(state => state.user);
  const { startLoading, stopLoading } = useGlobalProgress();

  const handleBlockUser = async () => {
    if (!authorId) return;
    startLoading();
    // Simulate a brief delay for a premium UI feel (as per AGENTS.md rule)
    await new Promise(res => setTimeout(res, 400));
    const success = await blockUser(authorId, authorName ?? undefined, authorAvatarUrl ?? undefined);
    stopLoading();
    if (success) {
      onClose();
    }
  };

  const handleShare = async () => {
    if (!postId) return;
    try {
      const url = `https://crimchart.com/post/${postId}`;
      await Share.share({
        message: url,
        url: url, // iOS specific
      });
      onClose();
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleCopyLink = async () => {
    if (!postId) return;
    try {
      const url = `https://crimchart.com/post/${postId}`;
      await Clipboard.setStringAsync(url);
      ChartToast.showSuccess(null, { title: 'Link Copied', message: 'Post link copied to clipboard.' });
      onClose();
    } catch (error) {
      console.error('Failed to copy link', error);
    }
  };

  const handleReportPost = async () => {
    if (!postId) return;
    const success = await reportPost(postId);
    if (success) {
      onClose();
    }
  };

  const getDesktopStyle = () => {
    if (!anchorPosition) return {};

    let left = anchorPosition.x - 200;
    if (left + 250 > width) {
      left = width - 260;
    }
    if (left < 10) left = 10;

    return {
      position: 'absolute' as const,
      top: anchorPosition.y + 10,
      left: left,
      width: 250,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      shadowColor: theme.isDark ? '#FFFFFF' : '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.isDark ? 0.15 : 0.15,
      shadowRadius: 24,
      elevation: 10,
      paddingTop: 16,
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
              <Text style={styles.title}>Post Options</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionRow} onPress={handleShare} activeOpacity={0.8}>
              <ShareIcon size={24} color={theme.colors.text} />
              <Text style={styles.optionText}>Share via...</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={handleCopyLink} activeOpacity={0.8}>
              <Link2 size={24} color={theme.colors.text} />
              <Text style={styles.optionText}>Copy Link</Text>
            </TouchableOpacity>

            {authorId && currentUser?.id !== authorId && (
              <TouchableOpacity style={styles.optionRow} onPress={handleBlockUser} activeOpacity={0.8}>
                <UserX size={24} color={theme.colors.error} />
                <Text style={[styles.optionText, { color: theme.colors.error }]}>
                  Block {authorName || 'User'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.optionRow} onPress={handleReportPost} activeOpacity={0.8}>
              <Flag size={24} color={theme.colors.error} />
              <Text style={[styles.optionText, { color: theme.colors.error }]}>Report Post</Text>
            </TouchableOpacity>
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
