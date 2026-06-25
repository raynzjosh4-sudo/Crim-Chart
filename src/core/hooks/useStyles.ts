import React from 'react';
import { StyleSheet } from 'react-native';
import { useThemeStore, useCurrentTheme } from '../store/useThemeStore';
import { ThemeTokens } from '../theme/themes';

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

/**
 * A custom hook that creates a dynamically scaled StyleSheet based on the global theme scale.
 * 
 * @param styleFactory A function that takes the current `colors` token map and `scale` factor and returns an object of styles.
 * @returns A memoized StyleSheet object.
 */
export function useStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  styleFactory: (colors: ThemeTokens, scale: number) => T | NamedStyles<T>
): T {
  const scale = useThemeStore((state) => state.scale);
  const currentTheme = useCurrentTheme();

  return React.useMemo(() => {
    return StyleSheet.create(styleFactory(currentTheme.colors, scale));
  }, [scale, currentTheme, styleFactory]);
}
