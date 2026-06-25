import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Flag, UserMinus, Copy, EyeOff, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

interface InfoSheetProps {
  title: string;
  themeColor: string;
  isAuthor?: boolean;
  onDelete?: () => void;
  onClose?: () => void;
}

export const InfoSheet: React.FC<InfoSheetProps> = ({
  title,
  themeColor,
  isAuthor = false,
  onDelete,
  onClose,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const ActionItem = ({ icon: Icon, label, color, onTap }: any) => (
    <TouchableOpacity activeOpacity={1}
      style={styles.actionItem}
      onPress={() => {
        onClose?.();
        onTap?.();
      }}
    >
      <Icon size={20} color={color || colors.text} style={{ opacity: color ? 1 : 0.7 }} />
      <Text style={[styles.actionText, { color: color || colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <Text style={[styles.title, { color: themeColor }]}>{title}</Text>
      
      <ActionItem icon={Flag} label={t('report_post')} color="#FF5252" />
      <ActionItem icon={UserMinus} label={t('unfollow_member')} />
      <ActionItem icon={Copy} label={t('copy_text')} />
      <ActionItem icon={EyeOff} label={t('hide_this_post')} />

      {isAuthor && (
        <>
          <View style={styles.divider} />
          <ActionItem icon={Trash2} label={t('delete_post')} color="#FF5252" onTap={onDelete} />
        </>
      )}

      <TouchableOpacity activeOpacity={1}
        style={[styles.closeButton, { backgroundColor: colors.card }]}
        onPress={onClose}
      >
        <Text style={[styles.closeText, { color: colors.text }]}>{t('close')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  closeButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  closeText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
