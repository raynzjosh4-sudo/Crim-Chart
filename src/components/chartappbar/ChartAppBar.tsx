import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ChartAppBarProps = {
    title: string;
    actions?: React.ReactNode[];
    showBack?: boolean;
    backgroundColor?: string;
    titleStyle?: any;
    titleWidget?: React.ReactNode;
    leading?: React.ReactNode;
    centerTitle?: boolean;
    showBorder?: boolean;
    isLoading?: boolean;
    loadingProgress?: number; // 0..1
    onTapTitle?: () => void;
    onBack?: () => void;
    useSafeArea?: boolean;
};

export default function ChartAppBar({
    title,
    actions,
    showBack = true,
    backgroundColor,
    titleStyle,
    titleWidget,
    leading,
    centerTitle = true,
    showBorder = true,
    isLoading = false,
    loadingProgress,
    onTapTitle,
    onBack,
    useSafeArea = true,
}: ChartAppBarProps) {
    const router = useRouter();
    const styles = useStyles(themeStyles);

    const [isNavigating, setIsNavigating] = React.useState(false);
    const handleBack = () => {
        if (isNavigating) return;
        setIsNavigating(true);
        if (onBack) onBack();
        else router.back();
        setTimeout(() => setIsNavigating(false), 1000);
    };

    const { activeRequests } = useGlobalProgress();
    const progress = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (activeRequests > 0) {
            opacity.value = withTiming(1, { duration: 150 });
            progress.value = withTiming(0.85, {
                duration: 3000,
                easing: Easing.out(Easing.cubic)
            });
        } else if (activeRequests === 0 && progress.value > 0) {
            progress.value = withSequence(
                withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 200 }),
                withTiming(1, undefined, (finished?: boolean) => {
                    if (finished) {
                        opacity.value = withTiming(0, { duration: 200 });
                        progress.value = withDelay(250, withTiming(0, { duration: 0 }));
                    }
                })
            );
        }
    }, [activeRequests, progress, opacity]);

    const animatedBarStyle = useAnimatedStyle(() => ({
        width: SCREEN_WIDTH * progress.value,
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.container, backgroundColor ? { backgroundColor } : undefined]}>
            <SafeAreaView edges={useSafeArea ? ['top'] : []}>
                <View style={[styles.row, showBorder && !isLoading ? styles.border : null]}>
                    {/* Leading / Back */}
                    <View style={styles.side}>
                        {leading ? (
                            leading
                        ) : showBack ? (
                            <CrimchartBackButton onPress={handleBack} />
                        ) : (
                            <View style={styles.placeholder} />
                        )}
                    </View>

                    {/* Title */}
                    <View style={styles.titleContainer} pointerEvents={onTapTitle ? 'auto' : 'none'}>
                        <TouchableOpacity activeOpacity={onTapTitle ? 0.7 : 1} onPress={onTapTitle} style={{ flex: 1 }}>
                            {titleWidget ? (
                                titleWidget
                            ) : (
                                <Text numberOfLines={1} style={[styles.title, titleStyle, centerTitle ? { textAlign: 'center' } : {}]}>
                                    {title}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Actions */}
                    <View style={styles.side}>
                        {actions && actions.length > 0 ? <View style={styles.actionsRow}>{actions}</View> : <View style={styles.placeholder} />}
                    </View>
                </View>
            </SafeAreaView>

            {/* Loading bar */}
            <View style={styles.loaderContainer}>
                <Animated.View style={[styles.progressBarContainer, animatedBarStyle]}>
                    <LinearGradient
                        colors={['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientFill}
                    />
                </Animated.View>
                {isLoading && (
                    <View style={[styles.loaderBar, { width: `${Math.min(Math.max(loadingProgress ?? 0.15, 0.01), 100) * 100}%` }]} />
                )}
            </View>
        </View>
    );
}

const themeStyles = (colors: ThemeTokens, scale: number) => ({
    container: {
        width: '100%' as const,
        backgroundColor: colors.background,
        zIndex: 999,
        elevation: 999,
    },
    row: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        minHeight: 40 * scale,
        paddingHorizontal: 4 * scale,
    },
    side: {
        minWidth: 40 * scale,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    backButton: {
        padding: 6 * scale,
    },
    backText: {
        fontSize: 28 * scale,
        color: colors.text,
        lineHeight: 28 * scale,
    },
    placeholder: {
        width: 24 * scale,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center' as const,
    },
    title: {
        fontWeight: '700' as const,
        fontSize: 17 * scale,
        color: colors.text,
    },
    actionsRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 8 * scale,
    },
    border: {
        borderBottomWidth: 0.8,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    loaderContainer: {
        height: 3,
        width: '100%' as const,
        backgroundColor: 'transparent',
    },
    loaderBar: {
        height: '100%' as const,
        backgroundColor: colors.primary,
        position: 'absolute' as const,
        top: 0,
        left: 0,
    },
    progressBarContainer: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        height: '100%' as const,
        zIndex: 9999,
    },
    gradientFill: {
        flex: 1,
        width: '100%' as const,
        height: '100%' as const,
    },
});
