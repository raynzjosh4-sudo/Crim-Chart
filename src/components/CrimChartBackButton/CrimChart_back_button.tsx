import { useAppTheme } from '@/core/theme/app_theme';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

interface CrimchartBackButtonProps {
    onPress: () => void;
    color?: string;
    size?: number;
}

export default function CrimchartBackButton({
    onPress,
    color,
    size = 24,
}: CrimchartBackButtonProps) {
    const theme = useAppTheme();

    // Replicates: color ?? Theme.of(context).colorScheme.onSurface
    const resolvedColor = color || theme.colors.text;

    return (
        <Pressable
            onPress={onPress}
            // 🎯 Fixes tap-target usability issues caused by zero padding
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => [
                styles.button,
                { opacity: Platform.OS === 'ios' && pressed ? 0.5 : 1 }
            ]}
            // Replicates: splashRadius: 24
            android_ripple={{
                color: 'rgba(0, 0, 0, 0.1)',
                borderless: true,
                radius: 24,
            }}
        >
            <ChevronLeft size={size} color={resolvedColor} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});