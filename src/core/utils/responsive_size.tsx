import { Dimensions } from 'react-native';

const DESIGN_WIDTH = 390.0;
const DESIGN_HEIGHT = 844.0;

export let screenWidth = 0;
export let screenHeight = 0;
export let widthMultiplier = 1;
export let heightMultiplier = 1;

/**
 * Initializes the sizing configuration.
 * It automatically runs on import, but you can call it again if the screen 
 * orientation changes or if you need to pass a custom userScaleFactor.
 */
export const initSizeConfig = (userScaleFactor: number = 1.0) => {
    const { width, height } = Dimensions.get('window');
    screenWidth = width;
    screenHeight = height;

    // Calculate the raw multiplier
    const rawWidthMultiplier = screenWidth / DESIGN_WIDTH;

    // Clamp the multiplier so it doesn't get ridiculously huge on tablets/large phones.
    // JS Equivalent of Dart's .clamp() is Math.min(Math.max(value, min), max)
    const clampedWidth = Math.min(Math.max(rawWidthMultiplier, 0.0), 1.1);
    widthMultiplier = clampedWidth * userScaleFactor;

    // Calculate true height multiplier
    const rawHeightMultiplier = screenHeight / DESIGN_HEIGHT;

    // Clamp height multiplier so it never compresses vertically much more than horizontally
    const clampedHeight =
        rawHeightMultiplier < widthMultiplier * 0.85
            ? widthMultiplier * 0.85
            : rawHeightMultiplier;

    heightMultiplier = clampedHeight * userScaleFactor;
};

// Auto-initialize when the file is first imported
initSizeConfig();

/**
 * Scales the dimension proportionally to the screen width.
 * Use this for horizontal dimensions: width, padding right/left, margins.
 */
export const w = (size: number): number => size * widthMultiplier;

/**
 * Scales the dimension proportionally to the screen height.
 */
export const h = (size: number): number => size * heightMultiplier;

/**
 * Scales font sizes based on a balanced multiplier (width is usually safer for text)
 */
export const sp = (size: number): number => size * widthMultiplier;

/**
 * Scales the radius based on width multiplier.
 */
export const r = (size: number): number => size * widthMultiplier;