import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { LanguageCode } from '@/core/localization/translations';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LANGUAGES = [
  { native: 'English', english: 'English (en) - Baseline', code: 'en' },
  { native: 'Español', english: 'Spanish (es) - Latin America & US', code: 'es' },
  { native: 'Kiswahili', english: 'Swahili (sw) - East Africa', code: 'sw' },
  { native: 'Luganda', english: 'Luganda', code: 'lg' },
];

export default function LocalizationSettingsPage() {
  const router = useRouter();
  const { t, lang, setLanguage } = useTranslation();

  const handleLanguageSelect = (code: string) => {
    setLanguage(code as LanguageCode);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('language')} showBack />

      <View style={styles.content}>
        <Text style={styles.title}>{t('select_language')}</Text>

        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const isSelected = item.code === lang;
            return (
              <TouchableOpacity
                style={styles.languageItem}
                onPress={() => handleLanguageSelect(item.code)}
              >
                <View>
                  <Text style={styles.nativeName}>{item.native}</Text>
                  <Text style={styles.englishName}>{item.english}</Text>
                </View>
                {isSelected && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  nativeName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  englishName: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
