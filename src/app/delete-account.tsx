import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Platform, useWindowDimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/core/theme/colors';
import { supabase } from '@/core/db/database';
import { AlertTriangle, Lock, Trash2, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const isWeb = Platform.OS === 'web';

export default function DeleteAccountPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();

  const [step, setStep] = useState<'auth' | 'confirm' | 'done'>('auth');
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  // Confirmation state
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }
    
    setIsAuthenticating(true);
    setAuthError('');
    
    try {
      // Force sign-in to verify credentials, even if already logged in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        setAuthError(error.message);
      } else if (data.session) {
        setStep('confirm');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDelete = async () => {
    if (confirmation !== 'delete my account') {
      setDeleteError('Please type exactly "delete my account"');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      // Call the RPC function we created in delete_user_account.sql
      const { error } = await supabase.rpc('delete_own_account', {
        confirmation_text: confirmation
      });

      if (error) {
        setDeleteError(error.message);
      } else {
        // Clear local auth store
        useAuthStore.getState().logout();
        setStep('done');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderAuthStep = () => (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Lock color={colors.text} size={32} />
      </View>
      <Text style={styles.title}>Verify it's you</Text>
      <Text style={styles.subtitle}>
        To protect your data, please confirm your credentials before we can proceed with account deletion.
      </Text>

      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="rgba(255,255,255,0.4)"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor="rgba(255,255,255,0.4)"
          secureTextEntry
        />
      </View>

      <Pressable 
        onPress={handleAuth}
        style={({ pressed }) => [styles.buttonPrimary, pressed && { opacity: 0.8 }]}
        disabled={isAuthenticating}
      >
        {isAuthenticating ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonPrimaryText}>Continue</Text>
        )}
      </Pressable>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 60, 60, 0.1)' }]}>
        <AlertTriangle color="#FF3B30" size={32} />
      </View>
      <Text style={styles.title}>Delete Account</Text>
      <Text style={styles.subtitle}>
        This action is permanent and cannot be undone. All your data, posts, channels, and interactions will be permanently erased.
      </Text>

      {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>To confirm, type "delete my account" below:</Text>
        <TextInput
          style={[styles.input, { borderColor: confirmation === 'delete my account' ? '#34C759' : 'rgba(255,255,255,0.2)' }]}
          value={confirmation}
          onChangeText={setConfirmation}
          placeholder="delete my account"
          placeholderTextColor="rgba(255,255,255,0.3)"
          autoCapitalize="none"
        />
      </View>

      <Pressable 
        onPress={handleDelete}
        style={({ pressed }) => [
          styles.buttonDanger, 
          (!confirmation || confirmation !== 'delete my account') && { opacity: 0.5 },
          pressed && { opacity: 0.8 }
        ]}
        disabled={isDeleting || confirmation !== 'delete my account'}
      >
        {isDeleting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonDangerText}>Permanently Delete Account</Text>
        )}
      </Pressable>
    </View>
  );

  const renderDoneStep = () => (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
        <CheckCircle2 color="#34C759" size={48} />
      </View>
      <Text style={styles.title}>Account Deleted</Text>
      <Text style={styles.subtitle}>
        Your account and all associated data have been permanently removed from our servers.
      </Text>

      <Pressable 
        onPress={() => router.replace('/welcome' as any)}
        style={({ pressed }) => [styles.buttonPrimary, { marginTop: 24 }, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.buttonPrimaryText}>Back to Home</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {!isDesktop && <ChartAppBar title="Delete Account" showBack />}
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, isDesktop && { paddingVertical: 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {step === 'auth' && renderAuthStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'done' && renderDoneStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#151515', // premium dark material look
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(isWeb && {
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)' as any,
    }),
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 16,
    ...(isWeb && { outlineStyle: 'none' as any }),
  },
  buttonPrimary: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    ...(isWeb && { cursor: 'pointer' as any }),
  },
  buttonPrimaryText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDanger: {
    height: 52,
    backgroundColor: '#FF3B30',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    ...(isWeb && { cursor: 'pointer' as any }),
  },
  buttonDangerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
