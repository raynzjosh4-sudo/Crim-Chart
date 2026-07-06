import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function RecoverAccountPage() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    desktopWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.02)'
    },
    desktopModal: {
      width: '100%',
      maxWidth: 600,
      backgroundColor: '#16181c',
      borderRadius: 16,
      paddingVertical: 40,
      paddingHorizontal: 40,
      flex: 0,
      minHeight: 350,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    content: {
      flex: 1,
      paddingHorizontal: 24
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      letterSpacing: -0.5,
      marginTop: 10
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 14,
      lineHeight: 20,
      marginTop: 12
    },
    spacerLarge: {
      height: 32
    },
    spacerMedium: {
      height: 24
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
      backgroundColor: colors.surface
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 1.2,
      paddingHorizontal: 16,
      paddingVertical: 14
    },
    searchButton: {
      backgroundColor: colors.primary,
      height: 54,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center'
    },
    searchButtonDisabled: {
      opacity: 0.5
    },
    searchButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: 0.5
    },
    flexOne: {
      flex: 1
    }
  }));
  const router = useRouter();
  const {
    t
  } = useTranslation();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  const handleSearch = async () => {
    if (input.length < 5 || isLoading) return;
    setIsLoading(true);
    startLoading();

    // Simulated network request for account recovery
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    stopLoading();

    // For now, navigate back to login after "search"
    router.push('/login' as any);
  };
  return <SafeAreaView style={styles.container}>
      {!isDesktop && <ChartAppBar title="" showBorder isLoading={isLoading} />}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={[styles.content, isDesktop && styles.desktopModal]}>
          <Text style={[styles.title, isDesktop && {
          textAlign: 'center',
          marginBottom: 12,
          fontSize: 28
        }]}>
            Find your Crimchart account
          </Text>

          <Text style={styles.subtitle}>
            Enter your email, phone number, or username.
          </Text>

          <View style={styles.spacerLarge} />

          {/* Input Area */}
          <View style={styles.inputWrapper}>
            <TextInput style={[styles.input, Platform.OS === 'web' ? {
            outlineStyle: 'none'
          } as any : {}]} placeholder="Email, phone, or username" placeholderTextColor="rgba(255, 255, 255, 0.2)" autoCapitalize="none" value={input} onChangeText={setInput} autoFocus />
          </View>

          <View style={styles.spacerMedium} />

          {/* Search Button */}
          <TouchableOpacity activeOpacity={1} style={[styles.searchButton, input.length < 5 && styles.searchButtonDisabled]} onPress={handleSearch} disabled={input.length < 5 || isLoading}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>;
}