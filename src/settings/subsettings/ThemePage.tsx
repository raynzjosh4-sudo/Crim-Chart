import { Monitor, Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const ThemePage: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [themeMode, setThemeMode] = React.useState('dark' as 'light' | 'dark' | 'system');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title={t('theme')} />
      <View style={styles.list}>
        <ThemeOptionItem
          title={t('light')}
          icon={<Sun size={20} color={colors.text} />}
          value="light"
          selectedValue={themeMode}
          onSelect={setThemeMode}
          colors={colors}
        />
        <ThemeOptionItem
          title={t('dark')}
          icon={<Moon size={20} color={colors.text} />}
          value="dark"
          selectedValue={themeMode}
          onSelect={setThemeMode}
          colors={colors}
        />
        <ThemeOptionItem
          title={t('system_default')}
          icon={<Monitor size={20} color={colors.text} />}
          value="system"
          selectedValue={themeMode}
          onSelect={setThemeMode}
          colors={colors}
        />
      </View>
    </View>
  );
};

interface ThemeOptionItemProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  selectedValue: string;
  onSelect: (value: any) => void;
  colors: any;
}

const ThemeOptionItem: React.FC<ThemeOptionItemProps> = ({
  title, icon, value, selectedValue, onSelect, colors,
}) => {
  const isSelected = selectedValue === value;
  return (
    <TouchableOpacity
      style={styles.option}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={[styles.optionText, { color: colors.text }]}>{title}</Text>
      <View style={[styles.radio, { borderColor: isSelected ? colors.primary : 'rgba(255,255,255,0.2)' }]}>
        {isSelected && (
          <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingTop: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconWrap: { marginRight: 16, opacity: 0.7 },
  optionText: { flex: 1, fontSize: 16 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default ThemePage;
