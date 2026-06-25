import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { useCurrentTheme, useThemeStore } from '@/core/store/useThemeStore';
import { THEMES } from '@/core/theme/themes';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { Check } from 'lucide-react-native';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ThemeSettingsPage() {
  const { t } = useTranslation();
  const { themeId, setThemeId } = useThemeStore();
  const styles = useStyles(themeStyles);
  const currentTheme = useCurrentTheme();

  const themeOptions = Object.values(THEMES);

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('theme' as any, { defaultValue: 'Theme' })} showBack />

      <View style={styles.content}>
        <FlatList
          data={themeOptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = item.id === themeId;
            return (
              <TouchableOpacity activeOpacity={0.8}
                style={[
                  styles.optionItem,
                  { backgroundColor: item.colors.surface }
                ]}
                onPress={() => setThemeId(item.id)}
              >
                <View style={styles.leftRow}>
                  <View style={styles.palettePreview}>
                    <View style={[styles.colorDot, { backgroundColor: item.colors.primary }]} />
                    <View style={[styles.colorDot, { backgroundColor: item.colors.background }]} />
                    <View style={[styles.colorDot, { backgroundColor: item.colors.accent }]} />
                    <View style={[styles.colorDot, { backgroundColor: item.colors.error }]} />
                  </View>
                  <Text style={[styles.optionTitle, { color: item.colors.text }]}>
                    {item.name}
                  </Text>
                </View>
                {isSelected && (
                  <Check size={20} color={item.colors.primary} />
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ padding: 16, gap: 12 }}
        />
      </View>
    </SafeAreaView>
  );
}

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16 * scale,
    paddingVertical: 16 * scale,
    borderRadius: 12 * scale,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  leftRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16 * scale,
  },
  palettePreview: {
    flexDirection: 'row' as const,
    gap: -4 * scale,
  },
  colorDot: {
    width: 24 * scale,
    height: 24 * scale,
    borderRadius: 12 * scale,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionTitle: {
    fontSize: 16 * scale,
    fontWeight: '600' as const,
  },
});
