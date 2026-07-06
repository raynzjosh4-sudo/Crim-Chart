import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { useThemeStore } from '@/core/store/useThemeStore';
import { colors } from '@/core/theme/colors';
import Slider from '@react-native-community/slider';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
export default function DisplaySettingsPage() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      padding: 24,
      flex: 1
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: 24,
      borderRadius: 16,
      marginBottom: 40,
      minHeight: 120,
      justifyContent: 'center'
    },
    previewText: {
      color: colors.text,
      textAlign: 'center',
      lineHeight: 24
    },
    sliderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16
    },
    slider: {
      flex: 1,
      height: 40,
      marginHorizontal: 16
    },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold'
    },
    largeLabel: {
      fontSize: 24
    },
    infoText: {
      color: 'rgba(255, 255, 255, 0.5)',
      textAlign: 'center',
      marginTop: 24,
      fontSize: 14
    }
  }));
  const {
    t
  } = useTranslation();
  const {
    scale,
    setScale
  } = useThemeStore();
  return <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('display_text_size' as any, {
      defaultValue: 'Text Size'
    })} showBack />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={[styles.previewText, {
          fontSize: 16 * scale
        }]}>
            {t('text_size_preview' as any, {
            defaultValue: 'This is a preview of the text size. Drag the slider below to adjust the scale of the entire application.'
          })}
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>A</Text>
          <Slider style={styles.slider} minimumValue={0.8} maximumValue={1.5} step={0.1} value={scale} onValueChange={setScale} minimumTrackTintColor={colors.primary} maximumTrackTintColor="rgba(255,255,255,0.2)" thumbTintColor={colors.primary} />
          <Text style={[styles.label, styles.largeLabel]}>A</Text>
        </View>

        <Text style={styles.infoText}>
          {t('scale_multiplier_info' as any, {
          defaultValue: `Current scale: ${scale.toFixed(1)}x`
        })}
        </Text>
      </View>
    </SafeAreaView>;
}