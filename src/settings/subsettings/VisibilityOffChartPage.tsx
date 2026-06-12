import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const VisibilityOffChartPage: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(true);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('visibility_off_Chart')} />

            <main className="p-4">
                {/* Toggle Row */}
                <div className="flex items-center justify-between">
                    <h2 className="text-[16px] font-medium text-foreground flex-1 pr-4">
                        {t('show_profile_search')}
                    </h2>

                    {/* Custom Toggle Switch */}
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className={`w-11 h-6 rounded-full transition-colors duration-200 relative shrink-0
              ${isVisible ? 'bg-primary' : 'bg-foreground/20'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
              ${isVisible ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>

                {/* Description */}
                <p className="text-[13px] text-foreground/50 mt-2 leading-relaxed">
                    {t('visibility_desc')}
                </p>
            </main>
        </div>
    );
};

export default VisibilityOffChartPage;
