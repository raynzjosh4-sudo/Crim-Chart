import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { CategoryPickerWidget } from '@/components/compose/CategoryPickerWidget';

export default function MusicCategoryPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();
    const authStore = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);

    const handleSelectCategory = async (categoryId: string) => {
        setIsLoading(true);

        if (authStore.pendingGoogleOnboarding) {
            authStore.setMusicCategory(categoryId);
            
            const success = await authStore.completeGoogleOnboarding();
            setIsLoading(false);
            
            if (success) {
                router.push('/profilePicture' as any);
            } else {
                ChartToast.showError(null, {
                    title: tr('error') || 'Error',
                    message: authStore.errorMessage || 'Failed to create profile',
                });
            }
        } else {
            const success = await authStore.updateProfile({
                music_category: categoryId,
            });
            setIsLoading(false);

            if (success) {
                router.push('/profilePicture' as any);
            } else {
                ChartToast.showError(null, {
                    title: tr('error') || 'Error',
                    message: authStore.errorMessage || 'Failed to update profile',
                });
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChartAppBar 
                title="" 
                showBorder={true} 
                isLoading={isLoading} 
                backgroundColor={colors.background} 
            />
            
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {tr('music_category_title') || 'Select your favorite music category'}
                </Text>
                
                <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                    {tr('music_category_subtitle') || 'This will be your default category when posting music.'}
                </Text>

                <View style={styles.pickerContainer}>
                    <CategoryPickerWidget onSelectCategory={handleSelectCategory} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        lineHeight: 24,
    },
    pickerContainer: {
        flex: 1,
    },
});
