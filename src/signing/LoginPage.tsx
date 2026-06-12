import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export default function LoginPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();
    const authStore = useAuthStore();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [obscureText, setObscureText] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        const trimmedIdentifier = identifier.trim();
        const trimmedPassword = password.trim();

        if (!trimmedIdentifier || !trimmedPassword) {
            ChartToast.showError(null, {
                title: tr('error_title'),
                message: tr('login_error_empty') || 'Please fill in all fields',
            });
            return;
        }

        setIsLoading(true);

        try {
            // Mock login since real login endpoint depends on the backend
            await new Promise(resolve => setTimeout(resolve, 800));
            // Assuming successful
            router.replace('/(tabs)' as any);
        } catch (error: any) {
            ChartToast.showError(null, {
                title: tr('error_title'),
                message: error.message || 'Login failed',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            router.replace('/(tabs)' as any);
        } catch (error: any) {
            ChartToast.showError(null, {
                title: tr('error_title'),
                message: error.message || tr('google_error_reading'),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderInputField = ({
        value,
        onChangeText,
        hint,
        isPassword = false,
    }: {
        value: string;
        onChangeText: (text: string) => void;
        hint: string;
        isPassword?: boolean;
    }) => {
        return (
            <View style={[styles.inputContainer, { 
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
            }]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={hint}
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    secureTextEntry={isPassword && obscureText}
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                {isPassword && (
                    <TouchableOpacity 
                        onPress={() => setObscureText(!obscureText)}
                        style={styles.eyeIcon}
                    >
                        {obscureText ? (
                            <Eye color="rgba(255, 255, 255, 0.3)" size={18} />
                        ) : (
                            <EyeOff color="rgba(255, 255, 255, 0.3)" size={18} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChartAppBar 
                title="" 
                showBorder={false} 
                backgroundColor={colors.background}
            />
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <View style={styles.contentWrapper}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.space20} />

                        {/* Chart Logo */}
                        <View style={styles.logoContainer}>
                            <View style={[styles.logoGlow, { shadowColor: colors.primary }]} />
                            <Image 
                                source={require('../../../assets/images/react-logo.png')} // Replace with actual logo
                                style={styles.logo}
                            />
                        </View>

                        <View style={styles.space54} />

                        {/* Identifier Input */}
                        {renderInputField({
                            value: identifier,
                            onChangeText: setIdentifier,
                            hint: tr('login_identifier_hint') || 'Email or Phone',
                        })}

                        <View style={styles.space16} />

                        {/* Password Input */}
                        {renderInputField({
                            value: password,
                            onChangeText: setPassword,
                            hint: tr('login_password_hint') || 'Password',
                            isPassword: true,
                        })}

                        <View style={styles.space20} />

                        {/* Login Button */}
                        <TouchableOpacity 
                            style={[
                                styles.loginButton, 
                                { backgroundColor: colors.primary },
                                isLoading && styles.loginButtonDisabled
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.surface} />
                            ) : (
                                <Text style={[styles.loginButtonText, { color: colors.surface }]}>
                                    {tr('log_in')}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.space24} />

                        {/* Forgot Password */}
                        <TouchableOpacity onPress={() => {}}>
                            <Text style={[styles.forgotPassword, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                                {tr('login_forgot_password') || 'Forgot password?'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.space32} />

                        {/* OR Separator */}
                        <View style={styles.separatorRow}>
                            <View style={[styles.separatorLine, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} />
                            <Text style={[styles.separatorText, { color: 'rgba(255, 255, 255, 0.4)' }]}>
                                OR
                            </Text>
                            <View style={[styles.separatorLine, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} />
                        </View>

                        <View style={styles.space32} />

                        {/* Login with Google */}
                        <TouchableOpacity 
                            style={styles.googleButton}
                            onPress={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            <Image 
                                source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }} 
                                style={styles.googleIcon} 
                            />
                            <Text style={[styles.googleText, { color: colors.primary }]}>
                                {tr('try_with_google')}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Bottom Footer: Create New Account */}
                    <View style={[styles.footer, { borderTopColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        <Text style={[styles.footerText, { color: 'rgba(255, 255, 255, 0.5)' }]}>
                            {tr('login_no_account')}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/landing' as any)}>
                            <Text style={[styles.signupAction, { color: colors.primary }]}>
                                {tr('login_signup')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    contentWrapper: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    space16: { height: 16 },
    space20: { height: 20 },
    space24: { height: 24 },
    space32: { height: 32 },
    space54: { height: 54 },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        height: 100,
        alignSelf: 'center',
        borderRadius: 50,
    },
    logoGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 50,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 40,
        elevation: 10,
    },
    logo: {
        width: 75,
        height: 75,
        resizeMode: 'contain',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingHorizontal: 16,
        height: '100%',
    },
    eyeIcon: {
        paddingHorizontal: 16,
        justifyContent: 'center',
        height: '100%',
    },
    loginButton: {
        width: '100%',
        height: 52,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    forgotPassword: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    separatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    separatorLine: {
        flex: 1,
        height: 1,
    },
    separatorText: {
        paddingHorizontal: 16,
        fontSize: 13,
        fontWeight: 'bold',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        width: 18,
        height: 18,
        marginRight: 10,
    },
    googleText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 0.5,
    },
    footerText: {
        fontSize: 12,
        marginRight: 4,
    },
    signupAction: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingVertical: 4,
    },
});
