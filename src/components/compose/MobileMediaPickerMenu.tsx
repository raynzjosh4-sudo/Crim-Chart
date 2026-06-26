import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { Camera, Image as ImageIcon, Video, X } from 'lucide-react-native';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';

interface MobileMediaPickerMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (source: 'camera' | 'library', mediaType: 'image' | 'video') => void;
}

export const MobileMediaPickerMenu: React.FC<MobileMediaPickerMenuProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const { colors } = theme;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.menuContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Attach Media</Text>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.optionRow} onPress={() => onSelectOption('camera', 'image')}>
            <View style={styles.iconContainer}>
              <Camera size={24} color={colors.text} />
            </View>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} onPress={() => onSelectOption('camera', 'video')}>
            <View style={styles.iconContainer}>
              <Video size={24} color={colors.text} />
            </View>
            <Text style={styles.optionText}>Record Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} onPress={() => onSelectOption('library', 'image')}>
            <View style={styles.iconContainer}>
              <ImageIcon size={24} color={colors.text} />
            </View>
            <Text style={styles.optionText}>Choose Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} onPress={() => onSelectOption('library', 'video')}>
            <View style={styles.iconContainer}>
              <Video size={24} color={colors.text} />
            </View>
            <Text style={styles.optionText}>Choose Video</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
