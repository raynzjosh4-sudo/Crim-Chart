import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

// Reusing design components and utilities built in prior steps
import AppAvatar from '@/components/avatar/AppAvatar';
import { useThemeSettings } from '@/core/theme/theme_provider';

// Mocks for components/functions not provided in your snippet
// Replace these with your actual navigation and localization system paths
import { useNavigation } from '@react-navigation/native';
const t = (key: string, args?: Record<string, string>) => {
    if (key === 'block_user') return `Block ${args?.username}`;
    if (key === 'report_user') return `Report ${args?.username}`;
    if (key === 'his_User') return 'User';
    if (key === 'select_channel_to_Chart') return 'Select a channel to Chart';
    if (key === 'report_post') return 'Report Post';
    if (key === 'view_profile') return 'View Profile';
    if (key === 'share_status') return 'Share Status';
    return key;
};

// Placeholder stub for your custom sub-component
function ChannelSelectorRow({ title, selectedIndex, onChannelSelect, onChartConfirm, onBrowseAll }: any) {
    return <View style={{ padding: 16, backgroundColor: '#1C1919', borderRadius: 12, marginHorizontal: 16 }}><Text style={{ color: 'white' }}>{title}</Text></View>;
}

interface ChartOptionsDialogProps {
    visible: boolean;
    onClose: () => void;
    username: string;
    userProfileImageUrl: string;
    statusImageUrl: string;
    isChartable: boolean;
    themeColor: string;
    onChartTap: () => void;
}

export default function ChartOptionsDialog({
    visible,
    onClose,
    username,
    userProfileImageUrl,
    statusImageUrl,
    isChartable,
    themeColor,
    onChartTap,
}: ChartOptionsDialogProps) {
    const { height: screenHeight } = useWindowDimensions();
    const navigation = useNavigation();
    const { currentColor } = useThemeSettings();

    const [showChannels, setShowChannels] = useState(false);
    const [selectedChannelIndex, setSelectedChannelIndex] = useState(-1);

    // Replaces Theme.of(context).colorScheme
    const themeColors = {
        surface: '#121010',
        surfaceContainerHigh: '#242121',
        surfaceContainerHighest: '#1C1919',
        onSurface: '#ECECEC',
        primary: currentColor,
        scaffoldBackground: '#0A0808',
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            {/* 1. Transparent Backdrop Click-to-Dismiss Layer */}
            <Pressable style={styles.backdrop} onPress={onClose} />

            {/* 2. Main Sheet Container */}
            <View
                style={[
                    styles.sheetContainer,
                    {
                        backgroundColor: themeColors.surface,
                        maxHeight: screenHeight * 0.85 // Replicates Flutter's ConstrainedBox
                    }
                ]}
            >
                <SafeAreaView style={styles.safeArea}>

                    {/* Top Handle Bar */}
                    <View style={styles.handleBarCenterer}>
                        <View style={[styles.handleBar, { backgroundColor: 'rgba(236, 236, 236, 0.2)' }]} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Top Level: User Attribution Row */}
                        <View style={styles.headerRow}>
                            <AppAvatar
                                imageUrl={userProfileImageUrl}
                                size={32}
                                hasStatus
                                isOnline={false}
                                onTap={() => {
                                    onClose();
                                    navigation.navigate('ProfilePage'); // Replaces Navigator.push
                                }}
                            />
                            <View style={styles.userInfo}>
                                <Text style={[styles.usernameText, { color: themeColors.onSurface }]}>
                                    {username}
                                </Text>
                                <Text style={[styles.roleText, { color: themeColors.primary }]}>
                                    {t('his_User')}
                                </Text>
                            </View>
                        </View>

                        {/* Second Level: Content Identity & Sync Section */}
                        <View style={styles.identityRow}>
                            <View style={styles.avatarSpacer} />

                            {/* Status Thumbnail */}
                            <Image
                                source={{ uri: statusImageUrl }}
                                style={styles.statusThumbnail}
                                contentFit="cover"
                            />

                            {/* Expansion Toggle Button */}
                            <View style={styles.toggleContainer}>
                                <Pressable
                                    onPress={() => setShowChannels(!showChannels)}
                                    style={({ pressed }) => [
                                        styles.toggleButton,
                                        {
                                            backgroundColor: showChannels
                                                ? `${themeColors.primary}1A` // Hex code append with 10% Alpha
                                                : 'rgba(28, 25, 25, 0.3)',
                                            opacity: pressed ? 0.8 : 1
                                        }
                                    ]}
                                >
                                    <MaterialIcons
                                        name={showChannels ? 'cached' : 'sync'}
                                        size={26}
                                        color={showChannels ? themeColors.primary : 'rgba(236, 236, 236, 0.6)'}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Conditional Channel Selector Block */}
                        {showChannels && (
                            <View style={styles.channelWrapper}>
                                <ChannelSelectorRow
                                    title={t('select_channel_to_Chart')}
                                    selectedIndex={selectedChannelIndex}
                                    onChannelSelect={(index: number) => setSelectedChannelIndex(index)}
                                    onChartConfirm={(index: number) => {
                                        onClose();
                                        navigation.navigate('ChannelPage', { channelId: `channel_${index}` });
                                    }}
                                    onBrowseAll={() => {
                                        onClose();
                                        navigation.navigate('ChannelsPage');
                                    }}
                                />
                            </View>
                        )}

                        {/* Safety Actions Stack */}
                        <View style={styles.actionsStack}>
                            {renderActionItem(t('block_user', { username }), true, () => {
                                onClose();
                                // Handle block action logic here
                            }, themeColors)}

                            {renderActionItem(t('report_post'), true, () => {
                                onClose();
                                // TODO: Implement report post logic
                            }, themeColors)}

                            {renderActionItem(t('report_user', { username }), true, () => {
                                onClose();
                            }, themeColors)}

                            {renderActionItem(t('view_profile'), false, () => {
                                onClose();
                                navigation.navigate('ProfilePage');
                            }, themeColors)}

                            {renderActionItem(t('share_status'), false, () => {
                                onClose();
                            }, themeColors)}
                        </View>

                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

// --- HELPER RENDERING METHOD FOR ACTIONS (`_buildAction` equivalent) ---

function renderActionItem(
    title: string,
    isDestructive: boolean,
    onPress: () => void,
    themeColors: any
) {
    return (
        <View style={styles.actionPadding}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.actionItemBody,
                    {
                        backgroundColor: 'rgba(36, 33, 33, 0.5)',
                        opacity: pressed ? 0.8 : 1,
                    }
                ]}
            >
                <MaterialIcons
                    name={isDestructive ? 'report-problem' : 'person'}
                    size={18}
                    color={isDestructive ? '#FF5252' : 'rgba(236, 236, 236, 0.6)'}
                />
                <Text
                    style={[
                        styles.actionText,
                        { color: isDestructive ? '#FF5252' : 'rgba(236, 236, 236, 0.9)' }
                    ]}
                >
                    {title}
                </Text>
                <View style={styles.spacer} />
                <MaterialIcons
                    name="chevron-right"
                    size={16}
                    color="rgba(236, 236, 236, 0.3)"
                />
            </Pressable>
        </View>
    );
}

// --- STYLES ---

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 24,
            },
        }),
    },
    safeArea: {
        width: '100%',
    },
    handleBarCenterer: {
        alignItems: 'center',
        width: '100%',
    },
    handleBar: {
        marginTop: 12,
        marginBottom: 12,
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 12,
    },
    userInfo: {
        marginLeft: 10,
        justifyContent: 'center',
    },
    usernameText: {
        fontSize: 13,
        fontWeight: '900',
    },
    roleText: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
    },
    identityRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    avatarSpacer: {
        width: 42, // Keeps vertical alignment grid aligned matching avatar size layout
    },
    statusThumbnail: {
        width: 80,
        height: 110,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    toggleContainer: {
        marginLeft: 12,
        justifyContent: 'center',
    },
    toggleButton: {
        padding: 8,
        borderRadius: 99, // Circle shape
        alignItems: 'center',
        justifyContent: 'center',
    },
    channelWrapper: {
        marginTop: 10,
        marginBottom: 8,
    },
    actionsStack: {
        width: '100%',
    },
    actionPadding: {
        paddingHorizontal: 16,
        paddingVertical: 2,
    },
    actionItemBody: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    actionText: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 12,
    },
    spacer: {
        flex: 1,
    },
});