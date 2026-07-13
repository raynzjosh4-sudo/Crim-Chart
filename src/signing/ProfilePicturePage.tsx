import { useStyles } from "@/core/hooks/useStyles";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Camera } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
export default function ProfilePicturePage() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1
    },
    safeArea: {
      flex: 1
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24
    },
    actionButton: {
      paddingHorizontal: 16,
      justifyContent: 'center'
    },
    skipText: {
      fontSize: 16,
      fontWeight: 'bold'
    },
    space20: {
      height: 20
    },
    space40: {
      height: 40
    },
    space60: {
      height: 60
    },
    space80: {
      height: 80
    },
    errorContainer: {
      padding: 16,
      marginBottom: 16,
      borderRadius: 8,
      borderWidth: 1
    },
    errorText: {
      color: '#FF4B4B',
      fontSize: 14,
      textAlign: 'center'
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 12
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 19.6,
      textAlign: 'center'
    },
    avatarWrapper: {
      alignSelf: 'center',
      alignItems: 'flex-end',
      justifyContent: 'flex-end'
    },
    avatarPlaceholder: {
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 4,
      alignItems: 'center',
      justifyContent: 'center'
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      padding: 12,
      borderRadius: 30,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.26,
      shadowRadius: 10,
      elevation: 8
    },
    addButton: {
      width: '100%',
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center'
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  }));
  const router = useRouter();
  const {
    tr
  } = useLocalization();
  const {
    themeMode
  } = useThemeSettings();
  const authStore = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const handleAddPhoto = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    router.push('/photoEdit?fromSignup=true' as any);
  };
  return <View style={[styles.container, {
    backgroundColor: colors.background
  }]}>
            <ChartAppBar title="" showBorder={true} isLoading={isLoading} backgroundColor={colors.background} actions={[]} />
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.space20} />

                    {authStore.errorMessage ? <View style={[styles.errorContainer, {
          backgroundColor: 'rgba(255, 75, 75, 0.1)',
          borderColor: 'rgba(255, 75, 75, 0.3)'
        }]}>
                            <Text style={styles.errorText}>
                                {authStore.errorMessage}
                            </Text>
                        </View> : null}

                    <Text style={[styles.title, {
          color: colors.text
        }]}>
                        {tr('profile_picture_title') || 'Add a profile picture'}
                    </Text>
                    <Text style={[styles.subtitle, {
          color: 'rgba(255, 255, 255, 0.6)'
        }]}>
                        {tr('profile_picture_subtitle') || 'Add a photo so your friends know it\'s you.'}
                    </Text>

                    <View style={styles.space60} />

                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarPlaceholder, {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 165, 0, 0.3)' // Approximating primary 0.3
          }]}>
                            <User color="rgba(255, 255, 255, 0.1)" size={80} />
                        </View>
                        
                        <TouchableOpacity style={[styles.cameraBadge, {
            backgroundColor: colors.primary
          }]} onPress={handleAddPhoto} disabled={isLoading} activeOpacity={0.8}>
                            <Camera color={colors.text || colors.surface} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.space80} />

                    <TouchableOpacity activeOpacity={1} style={[styles.addButton, {
          backgroundColor: colors.primary
        }]} onPress={handleAddPhoto} disabled={isLoading}>
                        <Text style={[styles.addButtonText, {
            color: colors.surface
          }]}>
                            {tr('add_photo') || 'Add photo'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.space40} />
                </ScrollView>
            </SafeAreaView>
        </View>;
}