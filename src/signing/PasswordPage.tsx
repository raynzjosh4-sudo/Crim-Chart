import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Key } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

// Simple strength calculator to replace password_strength_checker
const calculateStrength = (pwd: string) => {
    if (!pwd || pwd.length === 0) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    
    // Scale 0-4 (0=none, 1=weak, 2=fair, 3=good, 4=strong/secure)
    if (strength <= 2) return 1;
    if (strength <= 4) return 2;
    if (strength <= 5) return 3;
    return 4; 
};

export default function PasswordPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();
    const authStore = useAuthStore();

    const [password, setPassword] = useState('');
    const [obscureText, setObscureText] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        const savedPwd = authStore.pendingSignUp?.password || '';
        if (savedPwd) {
            setPassword(savedPwd);
            setStrength(calculateStrength(savedPwd));
        }
    }, []);

    const handlePasswordChange = (val: string) => {
        setPassword(val);
        setStrength(calculateStrength(val));
    };

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$&*~';
        let newPwd = '';
        for (let i = 0; i < 16; i++) {
            newPwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(newPwd);
        setObscureText(false);
        setStrength(calculateStrength(newPwd));

        ChartToast.showInfo(null, {
            title: tr('password_generated_title') || 'Password Generated',
            message: tr('password_generated_message') || 'We generated a secure password for you.',
        });
    };

    const isPasswordValid = strength >= 3; // Enforce Minimum Strength (good or strong)

    const handleNext = async () => {
        if (!isPasswordValid) return;

        setIsLoading(true);

        try {
            authStore.setPassword(password);
            
            // Trigger Official Signup in Supabase (Phase 2)
            const success = await authStore.completeSignUp();
            
            if (success) {
                // Phase 3
                router.push('/birthday' as any);
            } else {
                if (authStore.errorMessage === 'OTP_REQUIRED') {
                    authStore.clearError();
                    router.push('/otpVerification' as any);
                } else {
                    ChartToast.showError(null, {
                        title: tr('error_title'),
                        message: authStore.errorMessage || 'Unknown error',
                    });
                }
            }
        } catch (e: any) {
            ChartToast.showError(null, {
                title: tr('error_title'),
                message: e.message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Render Strength Bars
    const renderStrengthBars = () => {
        const bars = [];
        const colorsArr = ['#FF4B4B', '#FFA500', '#FFD700', '#4CAF50']; // weak, fair, good, strong
        const currentStrengthColor = strength > 0 ? colorsArr[strength - 1] : 'rgba(255, 255, 255, 0.1)';

        for (let i = 1; i <= 4; i++) {
            bars.push(
                <View 
                    key={i} 
                    style={[
                        styles.strengthBar, 
                        { backgroundColor: i <= strength ? currentStrengthColor : 'rgba(255, 255, 255, 0.1)' }
                    ]} 
                />
            );
        }
        return <View style={styles.strengthContainer}>{bars}</View>;
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
                        {tr('password_title') || 'Create a password'}
                    </Text>
                    <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                        {tr('password_subtitle') || 'Create a secure password to protect your account.'}
                    </Text>

                    <View style={styles.space24} />

                    <View style={[styles.inputContainer, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder={tr('password') || 'Password'}
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            secureTextEntry={obscureText}
                            value={password}
                            onChangeText={handlePasswordChange}
                            editable={!isLoading}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity activeOpacity={1} 
                            onPress={() => setObscureText(!obscureText)}
                            style={styles.eyeIcon}
                        >
                            {obscureText ? (
                                <Eye color="rgba(255, 255, 255, 0.5)" size={20} />
                            ) : (
                                <EyeOff color="rgba(255, 255, 255, 0.5)" size={20} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.space16} />

                    {renderStrengthBars()}

                    <View style={styles.space8} />
                    
                    <Text style={[styles.requirementText, { color: 'rgba(255, 255, 255, 0.4)' }]}>
                        {tr('password_requirement_strong') || 'Use at least 8 characters, with letters, numbers, and symbols.'}
                    </Text>

                    <View style={styles.space8} />

                    <TouchableOpacity activeOpacity={1} style={styles.autoGenerateBtn} onPress={generatePassword}>
                        <Key size={16} color={colors.primary} />
                        <Text style={[styles.autoGenerateText, { color: colors.primary }]}>
                            {tr('password_auto_generate') || 'Auto-generate strong password'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.spacer} />

                    <TouchableOpacity activeOpacity={1} 
                        style={[
                            styles.nextButton, 
                            { backgroundColor: (!isLoading && isPasswordValid) ? colors.primary : 'rgba(255, 255, 255, 0.1)' }
                        ]}
                        onPress={handleNext}
                        disabled={isLoading || !isPasswordValid}
                    >
                        <Text style={[
                            styles.nextButtonText, 
                            { color: (!isLoading && isPasswordValid) ? colors.surface : colors.text }
                        ]}>
                            {tr('next') || 'Next'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.space40} />
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
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
    },
    space24: { height: 24 },
    space16: { height: 16 },
    space8: { height: 8 },
    space40: { height: 40 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    eyeIcon: {
        padding: 8,
    },
    strengthContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 2,
    },
    requirementText: {
        fontSize: 12,
    },
    autoGenerateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingVertical: 8,
    },
    autoGenerateText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    spacer: { flex: 1 },
    nextButton: {
        width: '100%',
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
