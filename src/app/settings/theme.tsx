import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { Moon, Settings, Sun } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

export default function ThemeSettingsPage() {
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState<ThemeMode>('dark');

  const THEME_OPTIONS = [
    { id: 'light', title: t('light'), icon: Sun },
    { id: 'dark', title: t('dark'), icon: Moon },
    { id: 'system', title: t('system_default'), icon: Settings },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('theme')} showBack />

      <View style={styles.content}>
        <FlatList
          data={THEME_OPTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedMode;
            const Icon = item.icon;
            return (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => setSelectedMode(item.id as ThemeMode)}
              >
                <View style={styles.leftRow}>
                  <Icon size={22} color={colors.text} />
                  <Text style={styles.optionTitle}>{item.title}</Text>
                </View>
                <View style={[
                  styles.radio,
                  isSelected && styles.radioSelected
                ]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
