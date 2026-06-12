import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutPage() {
  const { t } = useTranslation();

  const ABOUT_ITEMS = [
    { id: 'privacy', title: t('privacy_policy') },
    { id: 'terms', title: t('terms_of_use') },
    { id: 'opensource', title: t('open_source_libs') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('about')} showBack />

      <View style={styles.content}>
        <FlatList
          data={ABOUT_ITEMS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => { }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <ChevronRight size={18} color="rgba(255, 255, 255, 0.3)" />
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.versionText}>{t('version')} 1.0.0</Text>
            </View>
          }
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
  },
});
