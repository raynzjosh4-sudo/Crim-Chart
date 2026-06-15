import { LucideIcon, Mic } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface AnimatedSendButtonProps {
    onTap: () => void;
    onLongPressStart?: () => void;
    onLongPressEnd?: () => void;
    color: string;
    size?: number;
    icon: LucideIcon; // Expects a Lucide icon component type directly
}

export default function AnimatedSendButton({
    onTap,
    onLongPressStart,
    onLongPressEnd,
    color,
    size = 20,
    icon: SendIcon,
}: AnimatedSendButtonProps) {
    const [isLongPressed, setIsLongPressed] = useState(false);
    const isInteracting = useRef(false);
    const step = useRef(0);
    const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reanimating Shared Layout Values
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(1);

    // --- ANIMATION SEQUENCE EXECUTION FUNCTIONS ---

    const runShakeSequence = () => {
        if (isInteracting.current) return;

        // Matches Flutter's 600ms linear sine oscillation curves over 3 complete cycles
        translateX.value = withSequence(
            withTiming(-4, { duration: 50, easing: Easing.linear }),
            withTiming(4, { duration: 100, easing: Easing.linear }),
            withTiming(-4, { duration: 100, easing: Easing.linear }),
            withTiming(4, { duration: 100, easing: Easing.linear }),
            withTiming(-4, { duration: 100, easing: Easing.linear }),
            withTiming(4, { duration: 100, easing: Easing.linear }),
            withTiming(0, { duration: 50, easing: Easing.linear })
        );

        rotation.value = withSequence(
            withTiming(-0.1, { duration: 50, easing: Easing.linear }),
            withTiming(0.1, { duration: 100, easing: Easing.linear }),
            withTiming(-0.1, { duration: 100, easing: Easing.linear }),
            withTiming(0.1, { duration: 100, easing: Easing.linear }),
            withTiming(-0.1, { duration: 100, easing: Easing.linear }),
            withTiming(0.1, { duration: 100, easing: Easing.linear }),
            withTiming(0, { duration: 50, easing: Easing.linear })
        );
    };

    const runRocketSequence = () => {
        if (isInteracting.current) return;

        // Total Duration: 1200ms mapped across exact Flutter Interval weights (40% / 20% / 40%)
        translateX.value = withSequence(
            withTiming(60, { duration: 480, easing: Easing.in(Easing.ease) }), // Fly Out
            withTiming(-60, { duration: 240, easing: Easing.linear }),         // Teleport Hidden
            withTiming(0, { duration: 480, easing: Easing.out(Easing.back()) }) // Fly In
        );

        translateY.value = withSequence(
            withTiming(-60, { duration: 480, easing: Easing.in(Easing.ease) }),
            withTiming(60, { duration: 240, easing: Easing.linear }),
            withTiming(0, { duration: 480, easing: Easing.out(Easing.back()) })
        );

        opacity.value = withSequence(
            withTiming(0, { duration: 480, easing: Easing.linear }),
            withTiming(0, { duration: 240, easing: Easing.linear }),
            withTiming(1, { duration: 480, easing: Easing.linear })
        );
    };

    const stopAnimations = () => {
        isInteracting.current = true;
        cancelAnimation(translateX);
        cancelAnimation(translateY);
        cancelAnimation(rotation);
        cancelAnimation(opacity);

        // Reset back to base alignment vectors instantly
        translateX.value = 0;
        translateY.value = 0;
        rotation.value = 0;
        opacity.value = 1;
    };

    const resumeAnimations = () => {
        isInteracting.current = false;
    };

    // --- LIFECYCLE TIMERS MANAGEMENT ---

    useEffect(() => {
        // 1. Trigger Initial Shake Sequence after 2 Seconds
        const initialTimeout = setTimeout(() => {
            runShakeSequence();
        }, 2000);

        // 2. Start Cyclical Timing Evaluation Loop (Alternating Intervals every 60 seconds)
        cycleTimer.current = setInterval(() => {
            if (isInteracting.current) return;

            if (step.current === 0) {
                runRocketSequence();
                step.current = 1;
            } else {
                runShakeSequence();
                step.current = 0;
            }
        }, 60000);

        // Cleanup Hooks on Component Destruction Unmounts
        return () => {
            clearTimeout(initialTimeout);
            if (cycleTimer.current) clearInterval(cycleTimer.current);
        };
    }, []);

    // --- REANIMATED STYLES BINDING ---

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotation.value}rad` },
            ],
        };
    });

    // Decide icon asset states based on active presses
    const IconToRender = isLongPressed ? Mic : SendIcon;
    const iconColor = isLongPressed ? '#FF3B30' : color;

    return (
        <Pressable
            delayLongPress={400} // Custom tailored long press timeline boundary threshold
            onPressIn={() => {
                stopAnimations();
            }}
            onPressOut={() => {
                if (isLongPressed) {
                    setIsLongPressed(false);
                    onLongPressEnd?.();
                }
                resumeAnimations();
            }}
            onPress={() => {
                if (!isLongPressed) {
                    onTap();
                }
            }}
            onLongPress={() => {
                setIsLongPressed(true);
                onLongPressStart?.();
            }}
            style={styles.hitSlopContainer}
        >
            <Animated.View style={animatedStyle}>
                <IconToRender size={size} color={iconColor} />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    hitSlopContainer: {
        padding: 4, // Replicates Flutter's EdgeInsets.all(4) transparent canvas layout padding expansion
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
});