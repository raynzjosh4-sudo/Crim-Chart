import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';

const DUMMY_CHANNELS = Array.from({ length: 15 }).map((_, index) => ({
    id: index,
    name: `Channel ${index + 1}`,
    description: `Description for channel ${index + 1}`,
    members: `${(index + 1) * 123}`,
    icon: `https://i.pravatar.cc/150?u=channel${index}`,
}));

export default function ChannelSuggestionsPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();

    const [selectedChannels, setSelectedChannels] = useState<Set<number>>(new Set());

    useEffect(() => {
        // Automatically select the first 10
        const initialSelected = new Set<number>();
        for (let i = 0; i < 10 && i < DUMMY_CHANNELS.length; i++) {
            initialSelected.add(DUMMY_CHANNELS[i].id);
        }
        setSelectedChannels(initialSelected);
    }, []);

    const toggleChannel = (id: number) => {
        setSelectedChannels(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSkip = () => {
        router.replace('/(tabs)' as any);
    };

    const handleFinish = () => {
        // Finalize joins and go to feed
        router.replace('/(tabs)' as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChartAppBar 
                title="" 
                showBorder={true} 
                backgroundColor={colors.background}
                actions={[
                    <TouchableOpacity key="skip" onPress={handleSkip}>
                        <Text style={[styles.skipText, { color: 'rgba(255, 255, 255, 0.5)' }]}>
                            {tr('skip')}
                        </Text>
                    </TouchableOpacity>
                ]}
            />
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {tr('onboarding_channel_suggestions_title')}
                    </Text>
                    <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                        {tr('onboarding_channel_suggestions_subtitle')}
                    </Text>
                </View>

                <FlatList
                    data={DUMMY_CHANNELS}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => {
                        const isSelected = selectedChannels.has(item.id);
                        return (
                            <TouchableOpacity 
                                activeOpacity={0.7} 
                                onPress={() => toggleChannel(item.id)}
                                style={[
                                    styles.channelCard,
                                    {
                                        backgroundColor: isSelected ? `${colors.primary}0D` : 'rgba(255, 255, 255, 0.05)',
                                        borderColor: isSelected ? colors.primary : 'transparent',
                                    }
                                ]}
                            >
                                <Image source={{ uri: item.icon }} style={styles.channelIcon} />
                                <View style={styles.channelInfo}>
                                    <Text style={[styles.channelName, { color: colors.text }]}>
                                        {item.name}
                                    </Text>
                                    <Text style={[styles.channelMembers, { color: 'rgba(255, 255, 255, 0.5)' }]}>
                                        {item.members} members
                                    </Text>
                                </View>
                                <View style={[
                                    styles.checkbox,
                                    {
                                        backgroundColor: isSelected ? colors.primary : 'transparent',
                                        borderColor: isSelected ? colors.primary : 'rgba(255, 255, 255, 0.3)',
                                    }
                                ]}>
                                    {isSelected && <Check size={14} color={colors.surface} />}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.finishButton, { backgroundColor: colors.primary }]}
                        onPress={handleFinish}
                    >
                        <Text style={[styles.finishButtonText, { color: colors.surface }]}>
                            {tr('onboarding_channel_suggestions_finish')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    skipText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
        padding: 4,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    channelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    channelIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    channelInfo: {
        flex: 1,
        marginLeft: 16,
    },
    channelName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    channelMembers: {
        fontSize: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        padding: 24,
    },
    finishButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    finishButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
