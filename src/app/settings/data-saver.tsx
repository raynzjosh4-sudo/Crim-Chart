import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function DataSaverPage() {
  const { t } = useTranslation();
  const [dataSaver, setDataSaver] = useState(false);
  const [highResKey, setHighResKey] = useState('wifi_only');
  const [showOptions, setShowOptions] = useState(false);

  const OPTIONS = [
    { key: 'never', label: t('never') },
    { key: 'wifi_only', label: t('wifi_only') },
    { key: 'cellular_wifi', label: t('cellular_wifi') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('data_saver')} showBack />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.label}>{t('data_saver')}</Text>
            <Text style={styles.description}>{t('data_saver_desc')}</Text>
          </View>
          <Switch
            value={dataSaver}
            onValueChange={setDataSaver}
            trackColor={{ false: '#333', true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity activeOpacity={1}
          style={styles.selectionRow}
          onPress={() => setShowOptions(!showOptions)}
        >
          <Text style={styles.label}>{t('high_res_media')}</Text>
          <Text style={styles.activeValue}>{t(highResKey as any)}</Text>
        </TouchableOpacity>

        {showOptions && (
          <View style={styles.optionsContainer}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity activeOpacity={1}
                key={opt.key}
                style={styles.optionItem}
                onPress={() => {
                  setHighResKey(opt.key);
                  setShowOptions(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  highResKey === opt.key && styles.optionTextSelected
                ]}>{opt.label}</Text>
                {highResKey === opt.key && <Check size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 10,
  },
  selectionRow: {
    paddingVertical: 16,
  },
  activeValue: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
