import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import { colors } from '@/core/theme/colors';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Moon, Sun } from 'lucide-react-native';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode, updateThemeMode } = useThemeSettings();
    const authStore = useAuthStore();

    const isDark = themeMode === 'dark';

    const handleGoogleLogin = async () => {
        try {
            const success = await authStore.loginWithGoogle();
            if (success) {
                if (useAuthStore.getState().pendingGoogleOnboarding) {
                    router.push('/username' as any);
                } else {
                    router.push('/(tabs)' as any);
                }
            } else {
                const errorMsg = useAuthStore.getState().errorMessage;
                console.error('Google Login Error (authStore):', errorMsg);
                ChartToast.showError(null, {
                    title: tr('error_title') || 'Error',
                    message: errorMsg || tr('google_error_reading') || 'Google login failed',
                });
            }
        } catch (error: any) {
            console.error('Google Login Error (catch):', error);
            ChartToast.showError(null, {
                title: tr('error_title') || 'Error',
                message: error.message || tr('google_error_reading') || 'Google login failed',
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <View style={styles.spacer} />
                        <View style={styles.topRightActions}>
                            <TouchableOpacity activeOpacity={1}
                                onPress={() => updateThemeMode(isDark ? 'light' : 'dark')}
                                style={styles.iconButton}
                            >
                                {isDark ? (
                                    <Sun color="rgba(255, 255, 255, 0.7)" size={20} />
                                ) : (
                                    <Moon color="rgba(255, 255, 255, 0.7)" size={20} />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1}
                                onPress={() => router.push('/accountSelector' as any)}
                            >
                                <Text style={[styles.loginText, { color: colors.primary }]}>
                                    {tr('log_in')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.space40} />

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            // TODO: Replace with require('@/assets/icons/playstore.png') when added
                            source={require('../../../assets/images/react-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.space32} />

                    {/* Language Selector */}
                    <TouchableOpacity activeOpacity={1}
                        style={styles.languageSelector}
                        onPress={() => router.push('/language' as any)}
                    >
                        <Text style={[styles.languageText, { color: 'rgba(255, 255, 255, 0.5)' }]}>
                            {tr('language')}
                        </Text>
                        <MaterialIcons
                            name="keyboard-arrow-down"
                            size={20}
                            color="rgba(255, 255, 255, 0.5)"
                        />
                    </TouchableOpacity>

                    <View style={styles.space60} />

                    {/* Main Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity activeOpacity={0.8}
                            style={[styles.signupButton, { backgroundColor: colors.primary }]}
                            onPress={() => router.push('/signupCountry' as any)}
                        >
                            <Text style={[styles.signupText, { color: colors.surface }]}>
                                {tr('sign_up')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.space24} />

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={[styles.dividerLine, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
                        <Text style={[styles.dividerText, { color: 'rgba(255, 255, 255, 0.5)' }]}>
                            {tr('or')}
                        </Text>
                        <View style={[styles.dividerLine, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
                    </View>

                    <View style={styles.space24} />

                    {/* Try with Google */}
                    <View style={styles.googleButtonContainer}>
                        <TouchableOpacity activeOpacity={1}
                            style={styles.googleButton}
                            onPress={handleGoogleLogin}
                        >
                            <Image
                                source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }}
                                style={styles.googleIcon}
                                resizeMode="contain"
                            />
                            <Text style={[styles.googleText, { color: colors.text }]}>
                                {tr('try_with_google')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.space40} />

                    {/* Footer / Terms */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: 'rgba(255, 255, 255, 0.4)' }]}>
                            By continuing, you agree to our{' '}
                            <Text style={[styles.footerLink, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                                Terms of Service
                            </Text>
                            {' '}and{' '}
                            <Text style={[styles.footerLink, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                                Privacy Policy
                            </Text>
                            .
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    spacer: {
        width: 40,
    },
    topRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginRight: 8,
    },
    loginText: {
        fontSize: 14,
        fontWeight: 'bold',
        padding: 8,
    },
    space40: { height: 40 },
    space32: { height: 32 },
    space60: { height: 60 },
    space24: { height: 24 },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150, // Added explicit height to avoid 0 size on some rn versions
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    languageText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
    buttonContainer: {
        paddingHorizontal: 24,
    },
    signupButton: {
        width: '100%',
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signupText: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 16,
    },
    googleButtonContainer: {
        alignItems: 'center',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    googleText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    footer: {
        paddingHorizontal: 40,
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 11,
        lineHeight: 15.4,
        textAlign: 'center',
    },
    footerLink: {
        fontWeight: '600',
    },
});
