import { Send } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { sp, w } from './../../core/utils/responsive_size';

interface CrimchartColorChangerButtonProps {
    onTap: () => void;
    currentColor: string; // Expects a Hex string, e.g., '#FFC107'
}

export default function CrimchartColorChangerButton({
    onTap,
    currentColor,
}: CrimchartColorChangerButtonProps) {
    const buttonSize = w(44);

    return (
        <Pressable
            onPress={onTap}
            style={({ pressed }) => [
                styles.button,
                {
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: buttonSize / 2,
                    backgroundColor: currentColor,

                    // Smooth gesture response replacing standard opacity animations
                    opacity: pressed ? 0.85 : 1,

                    // 🌟 The Colored Glow Effect
                    shadowColor: currentColor,
                    shadowOpacity: 0.3, // Replicates .withValues(alpha: 0.3)
                    shadowRadius: 15,   // Replicates blurRadius: 15
                    shadowOffset: { width: 0, height: 4 },

                    // Android cross-platform shadow fallback handling
                    ...Platform.select({
                        android: {
                            elevation: 8,
                        },
                    }),
                },
            ]}
        >
            <Send size={sp(20)} color="#FFFFFF" />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});