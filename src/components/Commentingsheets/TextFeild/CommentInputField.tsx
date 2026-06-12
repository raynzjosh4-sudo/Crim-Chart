import { w, h, r, sp } from '@/core/utils/responsive_size';
import { Camera, Send } from 'lucide-react-native';
import React from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Reusing your design configurations
import { useAppTheme } from '@/core/theme/app_theme'; // Assuming you have a theme provider set up

// Mock translation function - replace with your context.tr path
const t = (key: string) => (key === 'message' ? 'Message' : key);

// Stub matching your custom button component signature

interface CommentInputFieldProps {
    value: string; // Replaces Flutter's controller tracking
    onChangeText: (text: string) => void;
    onSend: (text: string) => void;
    onImageTap?: () => void;
    onLongPressStart?: () => void;
    onLongPressEnd?: () => void;
    userImageUrl?: string; // Declared in Flutter but layout left unused
    hasMedia?: boolean;
    showTextField?: boolean;
    isTikTokStyle?: boolean;
    autoFocus?: boolean;
    onTap?: () => void;
}

export default function CommentInputField({
    value,
    onChangeText,
    onSend,
    onImageTap,
    onLongPressStart,
    onLongPressEnd,
    userImageUrl,
    onTap,
    hasMedia = false,
    showTextField = true,
    isTikTokStyle = false,
    autoFocus = false,
}: CommentInputFieldProps) {
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();

    // Replicates: value.text.isNotEmpty || hasMedia
    const showSend = value.trim().length > 0 || hasMedia;

    return (
        <View
            style={[
                styles.outerContainer,
                {
                    backgroundColor: theme.colors.background, // theme.scaffoldBackgroundColor
                    paddingBottom: insets.bottom + h(16),   // Dynamic safe inset padding tracking
                },
            ]}
        >
            <View style={styles.innerRow}>
                {showTextField ? (
                    <View
                        style={[
                            styles.inputWrapper,
                            {
                                minHeight: isTikTokStyle ? h(42) : h(48),
                                maxHeight: h(120),
                                borderRadius: isTikTokStyle ? r(24) : r(28),
                                backgroundColor: isTikTokStyle
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : `${theme.colors.text}14`, // Replicates onSurface with 8% alpha
                            },
                        ]}
                    >
                        {/* Main Multi-line TextInput Field */}
                        <TextInput
                            value={value}
                            onChangeText={onChangeText}
                            autoFocus={autoFocus}
                            editable={!onTap}
                            onTouchStart={onTap}
                            multiline
                            placeholder={isTikTokStyle ? 'Add comment...' : t('message')}
                            placeholderTextColor="rgba(255, 255, 255, 0.38)"
                            style={[styles.textInput, { fontSize: sp(15) }]}
                        />

                        {isTikTokStyle && (
                            <Pressable onPress={onImageTap} style={styles.iconPadding}>
                                <Camera size={sp(22)} color="#FFFFFF" />
                            </Pressable>
                        )}
                    </View>
                ) : (
                    <View style={styles.spacer} />
                )}

                <View style={{ width: w(8) }} />

                {/* Dynamic Send Actions Section */}
                {isTikTokStyle ? (
                    <Pressable
                        onPress={showSend ? () => onSend(value) : undefined}
                        style={styles.tikTokSendPadding}
                    >
                        <Send
                            size={sp(28)}
                            color={showSend ? theme.colors.primary : 'rgba(255, 255, 255, 0.24)'}
                        />
                    </Pressable>
                ) : (
                    <View
                        style={[
                            styles.standardSendCircle,
                            {
                                width: r(48),
                                height: r(48),
                                borderRadius: r(48) / 2,
                                backgroundColor: showSend
                                    ? theme.colors.primary
                                    : theme.colors.surfaceVariant, // surfaceContainerHighest
                            },
                            showSend && {
                                // Glow effect styling matching colorScheme.primary.withValues(alpha: 0.3)
                                shadowColor: theme.colors.primary,
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 4,
                            },
                        ]}
                    >
                        <Pressable onPress={showSend ? () => onSend(value) : () => {}}
                            ><Send size={sp(22)} color={showSend ? '#FFFFFF' : `${theme.colors.text}80`} /></Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}

// --- STYLES ---

const styles = StyleSheet.create({
    outerContainer: {
        paddingLeft: w(20),
        paddingRight: w(20),
        paddingTop: h(16),
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: -5 },
            },
            android: {
                elevation: 5,
            },
        }),
    },
    innerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: w(14),
    },
    textInput: {
        flex: 1,
        color: '#FFFFFF',
        fontWeight: '400',
        paddingVertical: h(10),
        textAlignVertical: 'center',
        ...Platform.select({
            android: { padding: 0 }, // Strip Android native container padding artifacts
        }),
    },
    iconPadding: {
        paddingLeft: w(8),
    },
    spacer: {
        flex: 1,
    },
    tikTokSendPadding: {
        paddingHorizontal: w(4),
        paddingVertical: h(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    standardSendCircle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});