import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';

interface ChartLinearLoaderProps {
    isLoading?: boolean;
    value?: number; // 0 to 1
    color?: string;
    height?: number;
}

const CHART_GOLD = '#FFB800';

export const ChartLinearLoader: React.FC<ChartLinearLoaderProps> = ({
    isLoading = false,
    value,
    color = CHART_GOLD,
    height = 3.2,
}) => {
    const animatedHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: isLoading ? height : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isLoading, height, animatedHeight]);

    return (
        <Animated.View style={[styles.container, { height: animatedHeight }]}>
            {isLoading ? (
                <ProgressBar
                    progress={typeof value === 'number' ? value : undefined}
                    indeterminate={typeof value !== 'number'}
                    color={color}
                    style={styles.progressBar}
                />
            ) : null}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'transparent',
    },
});

export default ChartLinearLoader;
