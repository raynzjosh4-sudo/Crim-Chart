import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';
import { CategoryPickerWidget } from '@/components/compose/CategoryPickerWidget';
export default function MusicCategoryPage() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    flexOne: {
      flex: 1
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 24
    },
    desktopWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    desktopModal: {
      width: 480,
      backgroundColor: '#1E1E1E',
      borderRadius: 24,
      padding: 40,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 12
      },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)'
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.6)',
      lineHeight: 24,
      marginTop: 8
    },
    spacerLarge: {
      height: 40
    }
  }));
  const router = useRouter();
  const {
    t
  } = useTranslation();
  const {
    pendingSignUp,
    updateProfile,
    setMusicCategory
  } = useAuthStore();
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isLoading, setIsLoading] = useState(false);
  const handleSelectCategory = async (categoryId: string) => {
    setIsLoading(true);
    startLoading();
    setMusicCategory(categoryId);
    const success = await updateProfile({
      music_category: categoryId
    });
    stopLoading();
    if (success) {
      router.push('/signup/bio' as any);
    } else {
      ChartToast.showError(null, {
        title: 'Error',
        message: 'Failed to update profile'
      });
    }
    setTimeout(() => setIsLoading(false), 1000);
  };
  return <SafeAreaView style={styles.container}>
      {!isDesktop && <ChartAppBar title="" showBorder isLoading={isLoading} />}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={isDesktop ? styles.desktopModal : styles.content}>
          <Text style={[styles.title, isDesktop && {
          textAlign: 'center',
          marginBottom: 12,
          fontSize: 28
        }]}>
            Favorite Music
          </Text>
          <Text style={styles.subtitle}>
            Select your favorite music category. This will be used as a default when you post music.
          </Text>

          <View style={styles.spacerLarge} />

          <View style={{
          flex: 1,
          minHeight: 400
        }}>
            <CategoryPickerWidget onSelectCategory={handleSelectCategory} />
          </View>
        </View>
      </View>
    </SafeAreaView>;
}