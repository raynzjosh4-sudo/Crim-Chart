import { colors } from '@/core/theme/colors';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface JoinButtonProps {
    onPress?: () => void;
    title?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    fullWidth?: boolean;
}

export const JoinButton: React.FC<JoinButtonProps> = ({
    onPress,
    title = 'JOIN',
    style,
    textStyle,
    fullWidth
}) => {
    return (
        <TouchableOpacity activeOpacity={1}
            style={[
                styles.button,
                fullWidth && { width: '100%', paddingVertical: 10 },
                style
            ]}
            onPress={onPress}
        >
            <Text style={[styles.text, textStyle]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#000',
        fontWeight: '900',
        fontSize: 14,
    }
});
