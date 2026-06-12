import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function UsernamePage() {
  const router = useRouter();
  const { pendingSignUp, updateProfile } = useAuthStore();
  const [username, setUsername] = useState(pendingSignUp?.username || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!username && pendingSignUp?.email) {
      const extracted = pendingSignUp.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      setUsername(extracted);
    }
  }, []);

  const handleNext = async () => {
    if (username.length < 3) return;
    setIsLoading(true);

    // Check username availability logic would go here
    await new Promise(resolve => setTimeout(resolve, 600));

    updateProfile({ username, displayName: username }); // Using username as display name placeholder
    setIsLoading(false);
    router.push('/signup/password' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title="" showBorder isLoading={isLoading} />

      <View style={styles.content}>
        <Text style={styles.title}>Pick a username</Text>
        <Text style={styles.subtitle}>
          Your username is how people find you on CrimChart. You can change it later.
        </Text>

        <View style={styles.spacerLarge} />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="username"
            placeholderTextColor="rgba(255, 255, 255, 0.2)"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={(text) => setUsername(text.toLowerCase())}
            autoFocus
          />
        </View>

        <View style={styles.flexOne} />

        <TouchableOpacity
          style={[styles.nextButton, username.length < 3 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={username.length < 3 || isLoading}
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
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
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

