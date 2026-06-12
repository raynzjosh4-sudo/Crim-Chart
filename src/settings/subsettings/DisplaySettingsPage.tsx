import { Eye } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const DisplaySettingsPage: React.FC = () => {
    const { t } = useTranslation();

    // In a real app, replace this local state with your Global Context/Store
    const [currentScale, setCurrentScale] = useState(1.0);
    const percentage = Math.round(currentScale * 100);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('display_text_size')} />

            <main className="p-4 flex flex-col gap-6">
                {/* Description */}
                <p className="text-sm text-foreground/60">
                    {t('scale_desc')}
                </p>

                {/* Slider Container */}
                <div className="bg-foreground/5 rounded-[15px] p-5">
                    <div className="flex justify-between items-center mb-5">
                        <span className="text-xs">{t('smaller')}</span>
                        <span className="text-base font-bold text-primary">
                            {percentage}%
                        </span>
                        <span className="text-lg">{t('bigger')}</span>
                    </div>

                    <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.1"
                        value={currentScale}
                        onChange={(e) => setCurrentScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                {/* Preview Section */}
                <div className="flex flex-col items-center justify-center py-8">
                    <Eye size={50} className="text-foreground/20" />
                    <p className="mt-2 text-base text-foreground">
                        {t('preview_text')}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default DisplaySettingsPage;
