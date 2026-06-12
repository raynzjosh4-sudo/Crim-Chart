import { Platform, ViewStyle } from 'react-native';

// --- SHAPES ---

const DEFAULT_RADIUS = 24.0;
const BUTTON_RADIUS = 16.0;
const CARD_RADIUS = 20.0;

export const AppShapes = {
    defaultRadius: DEFAULT_RADIUS,
    buttonRadius: BUTTON_RADIUS,
    cardRadius: CARD_RADIUS,

    /**
     * Replicates Flutter's ContinuousRectangleBorder.
     * Note: `borderCurve: 'continuous'` is iOS-only. Android will safely ignore 
     * it and fall back to a standard rounded rectangle.
     */
    squircle: (radius: number = DEFAULT_RADIUS): ViewStyle => ({
        borderRadius: radius,
        borderCurve: 'continuous',
    }),

    get buttonSquircle(): ViewStyle {
        return this.squircle(BUTTON_RADIUS);
    },

    get cardSquircle(): ViewStyle {
        return this.squircle(CARD_RADIUS);
    },
};


// --- SHADOWS ---

export const AppShadows = {
    /**
     * Generates a diffused shadow compatible with both iOS and Android.
     * Since Android doesn't support fine-tuned blur/spread natively without 3rd party 
     * libraries, we approximate it using the `elevation` property.
     */
    diffused: ({
        color = '#000000',
        blurRadius = 20,
        offsetX = 0,
        offsetY = 4,
        opacity = 0.08,
    } = {}): ViewStyle => ({
        // iOS Shadow Properties
        shadowColor: color,
        shadowOffset: { width: offsetX, height: offsetY },
        shadowOpacity: opacity,
        shadowRadius: blurRadius,
        // Android Shadow Property (approximated based on blurRadius)
        elevation: Platform.OS === 'android' ? Math.max(1, Math.round(blurRadius / 3)) : 0,
    }),

    get cardShadow(): ViewStyle {
        return this.diffused(); // Uses default values
    },

    get floatingShadow(): ViewStyle {
        return this.diffused({
            blurRadius: 30,
            offsetX: 0,
            offsetY: 10,
            opacity: 0.12,
        });
    },
};