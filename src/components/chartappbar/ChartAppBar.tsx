import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { SafeAreaView } from 'react-native-safe-area-context';

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

    return (
        <View style={[styles.container, { backgroundColor: backgroundColor ?? colors.background }]}>
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

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        paddingHorizontal: 8,
    },
    side: {
        minWidth: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        padding: 6,
    },
    backText: {
        fontSize: 28,
        color: colors.text,
        lineHeight: 28,
    },
    placeholder: {
        width: 24,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontWeight: '700',
        fontSize: 17,
        color: colors.text,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    border: {
        borderBottomWidth: 0.8,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    loaderContainer: {
        height: 2,
        width: '100%',
        backgroundColor: 'transparent',
    },
    loaderBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
});
