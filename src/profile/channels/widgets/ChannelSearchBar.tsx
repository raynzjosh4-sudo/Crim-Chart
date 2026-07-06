import { useStyles } from "@/core/hooks/useStyles";
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { Search } from 'lucide-react-native';
import React from 'react';
import { TextInput, View } from 'react-native';
interface ChannelSearchBarProps {
  onChanged?: (value: string) => void;
}
export const ChannelSearchBar: React.FC<ChannelSearchBarProps> = ({
  onChanged
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    searchContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 24,
      paddingHorizontal: 16,
      height: 48
    },
    icon: {
      marginRight: 12
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      outlineStyle: 'none',
    } as any
  }));
  return <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={theme.colors.textSecondary} style={styles.icon} />
        <TextInput style={styles.input} placeholder="Search anything" placeholderTextColor={theme.colors.textSecondary} onChangeText={onChanged} />
      </View>
    </View>;
};