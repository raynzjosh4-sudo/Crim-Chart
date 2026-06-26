import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hash, Plus } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';

export default function ChannelIntroPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();

    const handleSkip = () => {
        router.push('/channelSuggestions' as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChartAppBar 
                title="" 
                showBorder={false} 
                backgroundColor={colors.background}
                actions={[
                    <TouchableOpacity activeOpacity={1} key="skip" onPress={handleSkip}>
                        <Text style={[styles.skipText, { color: 'rgba(255, 255, 255, 0.5)' }]}>
                            {tr('skip')}
                        </Text>
                    </TouchableOpacity>
                ]}
            />
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}1A` }]}>
                        <Hash size={64} color={colors.primary} />
                    </View>
                    
                    <Text style={[styles.title, { color: colors.text }]}>
                        {tr('onboarding_channel_intro_title')}
                    </Text>
                    
                    <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                        {tr('onboarding_channel_intro_subtitle')}
                    </Text>

                    <View style={styles.spacer} />

                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/channelSuggestions' as any)}
                        activeOpacity={0.8}
                    >
                        <Plus size={20} color={colors.surface} />
                        <Text style={[styles.primaryButtonText, { color: colors.surface }]}>
                            {tr('onboarding_channel_intro_button')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={1} 
                        style={styles.secondaryButton}
                        onPress={() => router.push('/channelSuggestions' as any)}
                    >
                        <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                            {tr('onboarding_channel_intro_later')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    skipText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
        padding: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    iconContainer: {
        padding: 24,
        borderRadius: 100,
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 60,
    },
    spacer: {
        height: 40,
    },
    primaryButton: {
        flexDirection: 'row',
        width: '100%',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    secondaryButton: {
        padding: 12,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
