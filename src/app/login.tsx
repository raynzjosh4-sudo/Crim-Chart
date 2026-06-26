import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginPage() {
  const router = useRouter();
  const { isLoading, login, errorMessage } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [obscureText, setObscureText] = useState(true);

  const handleLogin = async () => {
    if (!identifier || !password) return;
    const success = await login({ identifier, password });
    if (success) {
      router.replace('/(tabs)/channels' as any);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const success = await useAuthStore.getState().loginWithGoogle();
      if (success) {
        if (useAuthStore.getState().pendingGoogleOnboarding) {
          router.push('/signup/username' as any);
        } else {
          router.replace('/(tabs)/channels' as any);
        }
      }
    } catch (error) {
      console.error('Google Login Error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title="" showBorder={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <Image
              source={require('@/assets/images/logo-glow.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.spacerExtraLarge} />

          {/* Identifier Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username, email or phone"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.spacerMedium} />

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              secureTextEntry={obscureText}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity activeOpacity={1} onPress={() => setObscureText(!obscureText)}>
              {obscureText ? <Eye size={18} color="rgba(255, 255, 255, 0.3)" /> : <EyeOff size={18} color="rgba(255, 255, 255, 0.3)" />}
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <Text style={{ color: 'red', marginTop: 10, fontSize: 14 }}>{errorMessage}</Text>
          ) : null}

          <View style={styles.spacerLarge} />

          {/* Login Button */}
          <TouchableOpacity activeOpacity={1}
            style={[styles.loginButton, (!identifier || !password) ? styles.loginButtonDisabled : null]}
            onPress={handleLogin}
            disabled={!identifier || !password || isLoading}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.spacerLarge} />

          <TouchableOpacity activeOpacity={1}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.spacerExtraLarge} />

          {/* OR Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.spacerExtraLarge} />

          {/* Google Login */}
          <TouchableOpacity activeOpacity={1} style={styles.googleButton} onPress={handleGoogleLogin}>
            <Image
              source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Try with Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity activeOpacity={1} onPress={() => router.push('/landing' as any)}>
          <Text style={styles.signUpText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
  },
  logo: {
    width: 75,
    height: 75,
  },
  spacerMedium: {
    height: 16,
  },
  spacerLarge: {
    height: 24,
  },
  spacerExtraLarge: {
    height: 40,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    outlineStyle: 'none' as any,
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  forgotText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  dividerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  orText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleIcon: {
    width: 18,
    height: 18,
  },
  googleButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  signUpText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});



