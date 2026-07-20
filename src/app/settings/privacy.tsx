import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, View, Pressable, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacySettingsPage() {
  const { t } = useTranslation();
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('account_privacy')} showBack />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('private_account')}</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#333', true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        <Text style={styles.description}>
          {t('private_account_desc')}
        </Text>
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
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
  },
});
