import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Key } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordPage() {
  const router = useRouter();
  const { setPassword, completeSignUp } = useAuthStore();
  const [password, setPasswordText] = useState('');
  const [obscureText, setObscureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const isPasswordValid = password.length >= 8;

  const handleNext = async () => {
    if (!isPasswordValid) return;
    setIsLoading(true);
    setPassword(password);
    const success = await completeSignUp();
    setIsLoading(false);
    if (success) {
      router.push('/signup/birthday' as any);
    }
  };

  const generateStrongPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*~';
    let generated = '';
    for (let i = 0; i < 16; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordText(generated);
    setObscureText(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title="" showBorder isLoading={isLoading} />

      <View style={styles.content}>
        <Text style={styles.title}>Create a password</Text>
        <Text style={styles.subtitle}>
          Your password must be at least 8 characters long. Use a mix of letters, numbers, and symbols for better security.
        </Text>

        <View style={styles.spacerLarge} />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255, 255, 255, 0.2)"
            secureTextEntry={obscureText}
            value={password}
            onChangeText={setPasswordText}
            autoFocus
          />
          <TouchableOpacity activeOpacity={1} onPress={() => setObscureText(!obscureText)}>
            {obscureText ? <Eye size={20} color="rgba(255, 255, 255, 0.5)" /> : <EyeOff size={20} color="rgba(255, 255, 255, 0.5)" />}
          </TouchableOpacity>
        </View>

        <View style={styles.spacerSmall} />

        <TouchableOpacity activeOpacity={1}
          style={styles.autoGenerate}
          onPress={generateStrongPassword}
        >
          <Key size={16} color={colors.primary} />
          <Text style={styles.autoGenerateText}>Auto-generate strong password</Text>
        </TouchableOpacity>

        <View style={styles.flexOne} />

        <TouchableOpacity activeOpacity={1}
          style={[styles.nextButton, !isPasswordValid && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isPasswordValid || isLoading}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        <View style={styles.spacerLarge} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  spacerLarge: {
    height: 32,
  },
  spacerSmall: {
    height: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  autoGenerate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  autoGenerateText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  flexOne: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

