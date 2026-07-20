import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { Stack, useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const isWeb = Platform.OS === 'web';

export default function NotFoundScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />

      {!isDesktop && <ChartAppBar title={''} />}

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <AlertCircle color={colors.primary} size={64} />
          </View>

          <Text style={styles.title}>404</Text>
          <Text style={styles.subtitle}>Page Not Found</Text>

          <Text style={styles.description}>
            The page you're looking for doesn't exist or has been moved.
          </Text>

          <Pressable
            onPress={handleGoHome}
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.8 }
            ]}
          >
            <Text style={styles.buttonText}>Return Home</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#0D0D0D', // darker card background
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...(isWeb && {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' as any,
    }),
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 9999,
    width: '100%',
    alignItems: 'center',
    ...(isWeb && { cursor: 'pointer' as any }),
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
