import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ChevronDown } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export default function MobileNumberPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();
    const authStore = useAuthStore();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const countryCode = authStore.pendingSignUp?.countryCode || '+1';

    useEffect(() => {
        if (authStore.pendingSignUp?.phoneNumber) {
            setPhoneNumber(authStore.pendingSignUp.phoneNumber);
        }
    }, []);

    const handleNext = async () => {
        const trimmedPhone = phoneNumber.trim();

        if (!trimmedPhone || trimmedPhone.length < 7) {
            ChartToast.showError(null, {
                title: tr('error_title'),
                message: tr('login_error_empty') || 'Please enter a valid phone number',
            });
            return;
        }

        setIsLoading(true);
        authStore.setPhoneNumber(trimmedPhone);

        // Mock loading
        await new Promise(resolve => setTimeout(resolve, 600));

        setIsLoading(false);
        router.push('/username' as any); // Assuming AppRoutes.username -> /username
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChartAppBar 
                title="" 
                showBorder={true} 
                isLoading={isLoading}
                backgroundColor={colors.background}
            />
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {tr('mobile_title') || 'What\'s your mobile number?'}
                    </Text>
                    <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                        {tr('mobile_subtitle') || 'Enter your mobile number to continue.'}
                    </Text>

                    <View style={styles.space32} />

                    <View style={[
                        styles.inputContainer, 
                        { 
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            backgroundColor: colors.surface 
                        }
                    ]}>
                        <TouchableOpacity 
                            style={styles.countryPicker}
                            onPress={() => router.push('/signupCountry' as any)} // Using the country picker route we created
                        >
                            <Text style={[styles.countryCodeText, { color: colors.text }]}>
                                {countryCode}
                            </Text>
                            <ChevronDown color="rgba(255, 255, 255, 0.4)" size={18} style={styles.chevron} />
                        </TouchableOpacity>

                        <View style={[styles.verticalDivider, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />

                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="000 000 0000"
                            placeholderTextColor="rgba(255, 255, 255, 0.2)"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.space24} />

                    <TouchableOpacity 
                        style={[
                            styles.nextButton, 
                            { backgroundColor: colors.primary },
                            isLoading && styles.nextButtonDisabled
                        ]}
                        onPress={handleNext}
                        disabled={isLoading}
                    >
                        <Text style={[styles.nextButtonText, { color: colors.surface }]}>
                            {tr('next')}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.spacer} />

                    <View style={styles.bottomSection}>
                        <View style={styles.socialRow}>
                            <TouchableOpacity 
                                style={styles.socialButton}
                                onPress={() => router.push('/emailSignup' as any)}
                            >
                                <Mail size={18} color="rgba(255, 255, 255, 0.7)" />
                                <Text style={[styles.socialButtonText, { color: colors.text }]}>
                                    {tr('email')}
                                </Text>
                            </TouchableOpacity>

                            <View style={[styles.dividerVertical, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />

                            <TouchableOpacity 
                                style={styles.socialButton}
                                onPress={() => router.push('/googleSignIn' as any)}
                            >
                                <Image 
                                    source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }} 
                                    style={styles.googleIcon} 
                                />
                                <Text style={[styles.socialButtonText, { color: colors.text }]}>
                                    {tr('google')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.dividerText, { color: 'rgba(255, 255, 255, 0.4)' }]}>
                            {tr('login_divider').toUpperCase()}
                        </Text>
                        <View style={[styles.dividerHorizontal, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />

                        <View style={styles.loginRow}>
                            <Text style={[styles.loginText, { color: 'rgba(255, 255, 255, 0.5)' }]}>
                                {tr('already_have_account')}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/login' as any)}>
                                <Text style={[styles.loginAction, { color: colors.primary }]}>
                                    {tr('login_action')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -0.5,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 19.6,
    },
    space32: { height: 32 },
    space24: { height: 24 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 12,
        height: 52,
    },
    countryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: '100%',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chevron: {
        marginLeft: 4,
    },
    verticalDivider: {
        width: 1.5,
        height: 24,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1.2,
        paddingHorizontal: 16,
        height: '100%',
    },
    nextButton: {
        width: '100%',
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonDisabled: {
        opacity: 0.7,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    spacer: {
        flex: 1,
    },
    bottomSection: {
        paddingBottom: 12,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 24,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    dividerVertical: {
        width: 1,
        height: 20,
        alignSelf: 'center',
    },
    googleIcon: {
        width: 18,
        height: 18,
    },
    dividerText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2.0,
        textAlign: 'center',
        marginBottom: 8,
    },
    dividerHorizontal: {
        height: 1,
        marginBottom: 20,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 13,
        marginRight: 4,
    },
    loginAction: {
        fontSize: 13,
        fontWeight: 'bold',
    },
});
