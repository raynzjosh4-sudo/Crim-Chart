import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';

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

    return (
        <View style={[styles.container, backgroundColor ? { backgroundColor } : undefined]}>
            <SafeAreaView edges={useSafeArea ? ['top'] : []}>
                <View style={[styles.row, showBorder && !isLoading ? styles.border : null]}>
                    {/* Leading / Back */}
                    <View style={styles.side}>
                        {leading ? (
                            leading
                        ) : showBack ? (
                            <CrimchartBackButton onPress={() => (onBack ? onBack() : router.back())} />
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
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <View style={[styles.loaderBar, { width: `${Math.min(Math.max(loadingProgress ?? 0.15, 0.01), 100) * 100}%` }]} />
                </View>
            ) : null}
        </View>
    );
}

const themeStyles = (colors: ThemeTokens, scale: number) => ({
    container: {
        width: '100%',
        backgroundColor: colors.background,
    },
    row: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        minHeight: 48 * scale,
        paddingHorizontal: 8 * scale,
    },
    side: {
        minWidth: 48 * scale,
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
        height: 2 * scale,
        width: '100%',
        backgroundColor: 'transparent',
    },
    loaderBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
});
