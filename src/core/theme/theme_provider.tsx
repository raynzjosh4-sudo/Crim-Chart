import React, { createContext, ReactNode, useContext, useState } from 'react';

// Replicating Flutter's ThemeMode enum
export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
    currentColor: string;
    currentFontFamily: string;
    displayScale: number;
    themeMode: ThemeMode;
    updateColor: (color: string) => void;
    updateFontFamily: (fontFamily: string) => void;
    updateDisplayScale: (scale: number) => void;
    updateThemeMode: (mode: ThemeMode) => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    // We use standard React state to replace ChangeNotifier's variables.
    // When these change, any component consuming this context will re-render.

    // Note: Defaulting to the dark primary color from your previous AppTheme
    const [currentColor, setCurrentColor] = useState<string>('#FFC107');
    const [currentFontFamily, setCurrentFontFamily] = useState<string>('Inter');
    const [displayScale, setDisplayScale] = useState<number>(1.0);
    const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

    const value: ThemeContextType = {
        currentColor,
        currentFontFamily,
        displayScale,
        themeMode,
        updateColor: setCurrentColor,
        updateFontFamily: setCurrentFontFamily,
        updateDisplayScale: setDisplayScale,
        updateThemeMode: setThemeMode,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Custom hook to consume the theme context easily in any component.
 * Replaces Provider.of<ThemeProvider>(context) in Flutter.
 */
export const useThemeSettings = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeSettings must be used within a ThemeProvider');
    }
    return context;
};