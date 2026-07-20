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

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerDesc}>
            Permanently delete your account and all of your data. This action cannot be undone.
          </Text>
          <Pressable 
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.open('https://crimchart.com/delete-account', '_blank');
              } else {
                Linking.openURL('https://crimchart.com/delete-account');
              }
            }}
          >
            <Text style={styles.deleteBtnText}>Delete Account Data</Text>
          </Pressable>
        </View>
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
  dangerZone: {
    marginTop: 48,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  dangerTitle: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  dangerDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any }),
  },
  deleteBtnText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
  },
});
