import React, { createContext, ReactNode, useContext, useState } from 'react';
import { AppStrings } from './AppStrings'; // Assuming your static translation dictionaries live here

// Interface defining what our localization system exposes to components
interface LocalizationContextType {
    currentLocale: string;
    setLocale: (locale: string) => void;
    tr: (key: string, args?: Record<string, string>) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
    children: ReactNode;
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
    const [currentLocale, setCurrentLocaleState] = useState<string>('en');

    // Replicates: setLocale(String locale) validation checking
    const setLocale = (locale: string) => {
        if (Object.prototype.hasOwnProperty.call(AppStrings.translations, locale)) {
            setCurrentLocaleState(locale);
        }
    };

    // Replicates: tr(String key, {Map<String, String>? args}) with brace parsing
    const tr = (key: string, args?: Record<string, string>): string => {
        let value = AppStrings.translations[currentLocale]?.[key] ??
            AppStrings.translations['en']?.[key] ??
            key;

        // Direct translation of dynamic bracket argument mapping context ({var})
        if (args) {
            Object.entries(args).forEach(([k, v]) => {
                // Safe global regex parsing lookup replaces Flutter's replaceAll
                value = value.replace(new RegExp(`{${k}}`, 'g'), v);
            });
        }

        return value;
    };

    return (
        <LocalizationContext.Provider value={{ currentLocale, setLocale, tr }}>
            {children}
        </LocalizationContext.Provider>
    );
}

/**
 * Replaces Flutter's BuildContext extension framework.
 * Usage: const { tr } = useLocalization();
 */
export function useLocalization() {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
}