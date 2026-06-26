import { colors } from '@/core/theme/colors';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useRouter } from 'expo-router';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

interface LoginModalWidgetProps {
  visible: boolean;
  onClose: () => void;
  initialUsername?: string;
  initialPassword?: string;
}

export function LoginModalWidget({ visible, onClose, initialUsername = '', initialPassword = '' }: LoginModalWidgetProps) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();

  const [view, setView] = useState<'login' | 'forgot'>('login');
  
  // Login State
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setUsername(initialUsername);
      setPassword(initialPassword);
      setView('login');
      setForgotInput('');
      setLocalError(null);
    }
  }, [visible, initialUsername, initialPassword]);

  const isContinueEnabled = username.length > 0 && password.length > 0;

  // Forgot Password State
  const [forgotInput, setForgotInput] = useState('');
  const [forgotFocused, setForgotFocused] = useState(false);
  const isForgotContinueEnabled = forgotInput.length > 0;

  // Responsive modal dimensions
  const modalWidth = isDesktop ? Math.min(width * 0.5, 600) : width;
  const modalHeight = isDesktop ? Math.min(height * 0.8, 650) : height;
  const modalBorderRadius = isDesktop ? 16 : 0;

  const handleBack = () => {
    if (view === 'forgot') {
      setView('login');
    } else {
      onClose();
    }
  };

  const handleLogin = async () => {
    if (!isContinueEnabled) return;

    setLocalError(null);
    const authStore = useAuthStore.getState();
    const success = await authStore.login({ identifier: username, password });

    if (success) {
      onClose();
      router.push('/(tabs)' as any);
    } else {
      const errorMsg = useAuthStore.getState().errorMessage;
      setLocalError(errorMsg || 'Invalid credentials');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleBack}>
      <View style={styles.overlay}>
        <View 
          style={[
            styles.modalContainer, 
            { 
              width: modalWidth, 
              height: modalHeight, 
              borderRadius: modalBorderRadius,
              backgroundColor: colors.background,
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/appicon/appicon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            {/* Empty view to balance the header flex */}
            <View style={styles.headerRightSpacer} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {view === 'login' ? (
              <>
                <Text style={[styles.title, { color: colors.text }]}>Login</Text>

                {/* Username Input */}
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: usernameFocused ? colors.primary : colors.textSecondary },
                    usernameFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textSecondary },
                      (usernameFocused || username.length > 0) && styles.inputLabelActive,
                      usernameFocused && { color: colors.primary },
                    ]}
                  >
                    Username or email
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                    autoCapitalize="none"
                  />
                </View>

                <View style={{ height: 24 }} />

                {/* Password Input */}
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: passwordFocused ? colors.primary : colors.textSecondary },
                    passwordFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textSecondary },
                      (passwordFocused || password.length > 0) && styles.inputLabelActive,
                      passwordFocused && { color: colors.primary },
                    ]}
                  >
                    Password
                  </Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, color: colors.text }]}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                      activeOpacity={0.7}
                    >
                      {showPassword ? (
                        <EyeOff color={colors.textSecondary} size={20} />
                      ) : (
                        <Eye color={colors.textSecondary} size={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ height: 16 }} />

                <TouchableOpacity activeOpacity={0.7} style={styles.forgotBtn} onPress={() => setView('forgot')}>
                  <Text style={[styles.forgotText, { color: colors.text }]}>Forgot password?</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                {localError && (
                  <Text style={{ color: colors.error, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
                    {localError}
                  </Text>
                )}

                {/* Continue Button */}
                <Pressable
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.continueBtn,
                    { backgroundColor: colors.text },
                    !isContinueEnabled && { backgroundColor: 'rgba(255,255,255,0.4)' },
                    pressed && isContinueEnabled && { opacity: 0.8 },
                  ]}
                  disabled={!isContinueEnabled || useAuthStore.getState().isLoading}
                >
                  <Text
                    style={[
                      styles.continueBtnText,
                      { color: colors.background },
                      !isContinueEnabled && { color: 'rgba(0,0,0,0.5)' },
                    ]}
                  >
                    Continue
                  </Text>
                </Pressable>

                <View style={{ height: 24 }} />

                {/* Footer */}
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  By continuing, you agree to our{' '}
                  <Text style={[styles.footerLink, { color: colors.text }]}>Terms of Service</Text>,{' '}
                  <Text style={[styles.footerLink, { color: colors.text }]}>Privacy Policy</Text> and{' '}
                  <Text style={[styles.footerLink, { color: colors.text }]}>Cookie Use</Text>.
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.title, { color: colors.text, marginBottom: 8 }]}>Find your account</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 32 }}>
                  Enter your email or username to reset your password.
                </Text>

                {/* Forgot Password Input */}
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: forgotFocused ? colors.primary : colors.textSecondary },
                    forgotFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textSecondary },
                      (forgotFocused || forgotInput.length > 0) && styles.inputLabelActive,
                      forgotFocused && { color: colors.primary },
                    ]}
                  >
                    Email or username
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={forgotInput}
                    onChangeText={setForgotInput}
                    onFocus={() => setForgotFocused(true)}
                    onBlur={() => setForgotFocused(false)}
                    autoCapitalize="none"
                  />
                </View>

                <View style={{ flex: 1 }} />

                {/* Continue Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.continueBtn,
                    { backgroundColor: colors.text },
                    !isForgotContinueEnabled && { backgroundColor: 'rgba(255,255,255,0.4)' },
                    pressed && isForgotContinueEnabled && { opacity: 0.8 },
                  ]}
                  disabled={!isForgotContinueEnabled}
                >
                  <Text
                    style={[
                      styles.continueBtnText,
                      { color: colors.background },
                      !isForgotContinueEnabled && { color: 'rgba(0,0,0,0.5)' },
                    ]}
                  >
                    Continue
                  </Text>
                </Pressable>
                
                <View style={{ height: 24 }} />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isWeb ? '2%' as any : 0, // Padding for web to not touch edges
  },
  modalContainer: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...(isWeb ? { boxShadow: '0 0 15px rgba(255,255,255,0.05)' as any } : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '4%',
    paddingVertical: '2%',
    minHeight: 50,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerRightSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: '8%',
    paddingTop: '6%',
    paddingBottom: '4%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: '8%',
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: '3%',
    paddingTop: '2%',
    paddingBottom: '1%',
    minHeight: 56,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  inputWrapperFocused: {
    borderWidth: 2,
    paddingHorizontal: '2.5%', // adjust for 2px border
    paddingTop: '1.5%',
    paddingBottom: '0.5%',
  },
  inputLabel: {
    position: 'absolute',
    left: '3%',
    top: 18,
    fontSize: 15,
    ...(isWeb ? { transition: '0.2s all ease-in-out' as any } : {}),
  },
  inputLabelActive: {
    top: 6,
    fontSize: 12,
  },
  input: {
    fontSize: 17,
    marginTop: 12,
    padding: 0,
    height: 24,
    backgroundColor: 'transparent',
    outlineStyle: 'none' as any,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-start',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '700',
  },
  continueBtn: {
    height: 52,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '6%',
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: '600',
  },
});
