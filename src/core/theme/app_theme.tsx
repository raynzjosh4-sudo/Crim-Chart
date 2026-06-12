import { useColorScheme } from 'react-native';

const sharedTheme = {
    fontFamily: 'Inter',
    // You can define global metrics here (border radii, padding)
    borderRadius: {
        input: 28,
        button: 16, // Approximating 'Squircle'
    },
};

export const lightTheme = {
    ...sharedTheme,
    isDark: false,
    colors: {
        primary: '#0066CC',
        background: '#F7F8FB',
        text: '#111827',

        // Message / Chat Colors
        outgoingBubble: '#0066CC',
        incomingBubble: '#FFFFFF',
        inputFill: '#F0F2F5',

        // Surface & Structural Colors
        surface: '#FFFFFF',
        surfaceVariant: '#F3F6FA',
        textSecondary: 'rgba(17, 24, 39, 0.7)',
        error: '#FF5252',
        snackBar: '#212121', // grey[900]
    },
};

export const darkTheme = {
    ...sharedTheme,
    isDark: true,
    colors: {
        primary: '#FFC107',
        background: '#0A0808',
        text: '#ECECEC',

        // Message / Chat Colors
        outgoingBubble: '#FFC107',
        incomingBubble: '#1E1C1C',
        inputFill: '#141212',

        // Surface & Structural Colors
        surface: '#0F0D0D',
        surfaceVariant: '#1C1919',
        textSecondary: 'rgba(236, 236, 236, 0.7)',
        error: '#FF5252',
        snackBar: '#211A19',
    },
};

/**
 * A custom hook to easily access the current theme throughout your app.
 */
export const useAppTheme = () => {
    const scheme = useColorScheme();
    return scheme === 'dark' ? darkTheme : lightTheme;
};