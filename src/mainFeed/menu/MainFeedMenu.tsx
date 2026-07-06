import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { Settings, Info, LogOut, X } from 'lucide-react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
}

interface MainFeedMenuProps {
  visible: boolean;
  onClose: () => void;
  onSettings?: () => void;
  onAbout?: () => void;
  onLogout?: () => void;
}

export const MainFeedMenu: React.FC<MainFeedMenuProps> = ({
  visible,
  onClose,
  onSettings,
  onAbout,
  onLogout,
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);

  const actions: MenuAction[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings color={theme.colors.text} size={20} />,
      onPress: () => { onClose(); onSettings?.(); },
    },
    {
      id: 'about',
      label: 'About CrimChart',
      icon: <Info color={theme.colors.text} size={20} />,
      onPress: () => { onClose(); onAbout?.(); },
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: <LogOut color="#FF5252" size={20} />,
      onPress: () => { onClose(); onLogout?.(); },
      destructive: true,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.menu}>
          <View style={styles.header}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity activeOpacity={1} onPress={onClose}>
              <X color="rgba(255,255,255,0.5)" size={22} />
            </TouchableOpacity>
          </View>
          {actions.map(action => (
            <TouchableOpacity activeOpacity={1}
              key={action.id}
              style={styles.item}
              onPress={action.onPress}
            >
              {action.icon}
              <Text style={[styles.itemLabel, action.destructive && styles.destructive]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  itemLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  destructive: { color: colors.error },
});
