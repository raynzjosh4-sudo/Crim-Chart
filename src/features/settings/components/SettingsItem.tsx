import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';
interface SettingsItemProps {
  icon: LucideIcon;
  title: string;
  onTap: () => void;
  trailingText?: string;
  showChevron?: boolean;
}
export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon: Icon,
  title,
  onTap,
  trailingText,
  showChevron = true
}) => {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16
    },
    title: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '500'
    },
    rightContent: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    trailingText: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 14
    },
    chevron: {
      marginLeft: 8
    }
  }));
  return <TouchableOpacity activeOpacity={1} style={styles.container} onPress={onTap}>
      <View style={styles.leftContent}>
        <Icon size={22} color={colors.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.rightContent}>
        {trailingText && <Text style={styles.trailingText}>{trailingText}</Text>}
        {showChevron && <ChevronRight size={18} color="rgba(255, 255, 255, 0.3)" style={styles.chevron} />}
      </View>
    </TouchableOpacity>;
};