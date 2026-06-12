import { Check } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

// 1. Define the font options
const FONT_OPTIONS = [
    { name: 'font_default', family: 'Inter' },
    { name: 'font_comic_relief', family: 'Comic Relief' },
    { name: 'font_archivo_black', family: 'Archivo Black' },
    { name: 'font_playfair_display', family: 'Playfair Display' },
    { name: 'font_roboto_condensed', family: 'Roboto Condensed' },
];

const FontSelectionPage: React.FC = () => {
    const { t } = useTranslation();

    // Replace this local state with your Global Context or Zustand store
    const [currentFont, setCurrentFont] = useState('Inter');

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('fonts')} />

            <main className="py-2">
                {FONT_OPTIONS.map((font) => {
                    const isSelected = currentFont === font.family;

                    return (
                        <button
                            key={font.family}
                            onClick={() => setCurrentFont(font.family)}
                            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors ${isSelected ? 'bg-primary/5' : ''
                                }`}
                        >
                            <div className="text-left overflow-hidden">
                                {/* Font Name */}
                                <div
                                    className="text-base font-bold text-foreground truncate"
                                    style={{ fontFamily: font.family }}
                                >
                                    {t(font.name)}
                                </div>
                                {/* Tagline Preview */}
                                <div
                                    className="mt-1 text-[13px] text-foreground/50 truncate"
                                    style={{ fontFamily: font.family }}
                                >
                                    {t('Chart_tagline')}
                                </div>
                            </div>

                            {isSelected && (
                                <Check size={20} className="text-primary flex-shrink-0 ml-4" />
                            )}
                        </button>
                    );
                })}
            </main>
        </div>
    );
};

export default FontSelectionPage;
