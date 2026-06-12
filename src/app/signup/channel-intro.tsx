import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { Hash, Plus } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChannelIntroPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar
        title=""
        showBorder={false}
        actions={[
          <TouchableOpacity
            key="skip"
            onPress={() => router.push('/signup/channel-suggestions' as any)}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ]}
      />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Hash size={64} color={colors.primary} />
        </View>

        <View style={styles.spacerLarge} />

        <Text style={styles.title}>Join your first channel</Text>
        <Text style={styles.subtitle}>
          Channels are where the magic happens. Discover communities, share content, and stay updated with what matters to you.
        </Text>

        <View style={styles.spacerExtraLarge} />

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push('/signup/channel-suggestions' as any)}
        >
          <Plus size={20} color="#000" />
          <Text style={styles.nextButtonText}>Find Channels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.laterButton}
          onPress={() => router.push('/signup/channel-suggestions' as any)}
        >
          <Text style={styles.laterButtonText}>I'll do this later</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  spacerLarge: {
    height: 32,
  },
  spacerExtraLarge: {
    height: 60,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 56,
    width: '100%',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  laterButton: {
    marginTop: 16,
    padding: 8,
  },
  laterButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

