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
import { Flag, Link2, Share, X } from 'lucide-react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

interface PostOptionsSheetProps {
  postId: string;
  visible: boolean;
  onClose: () => void;
}

export const PostOptionsSheet: React.FC<PostOptionsSheetProps> = ({ postId, visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.title}>Post Options</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionRow} onPress={() => { /* TODO */ }}>
              <Share size={24} color={theme.colors.text} />
              <Text style={styles.optionText}>Share via...</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionRow} onPress={() => { /* TODO */ }}>
              <Link2 size={24} color={theme.colors.text} />
              <Text style={styles.optionText}>Copy Link</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionRow} onPress={() => { /* TODO */ }}>
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
