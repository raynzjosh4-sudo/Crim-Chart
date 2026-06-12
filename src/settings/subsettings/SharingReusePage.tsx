import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const SharingReusePage: React.FC = () => {
    const { t } = useTranslation();
    const [allowResharing, setAllowResharing] = useState(true);
    const [allowSharing, setAllowSharing] = useState(true);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('sharing_and_reuse')} />

            <main className="p-4 space-y-8">
                {/* Section Header */}
                <h2 className="text-[16px] font-bold text-foreground">
                    {t('sharing')}
                </h2>

                {/* Switch Items */}
                <SwitchItem
                    title={t('allow_resharing_channels')}
                    subtitle={t('resharing_desc')}
                    value={allowResharing}
                    onToggle={setAllowResharing}
                />

                <SwitchItem
                    title={t('allow_sharing_inbox')}
                    subtitle={t('sharing_inbox_desc')}
                    value={allowSharing}
                    onToggle={setAllowSharing}
                />
            </main>
        </div>
    );
};

// Reusable Switch Component
interface SwitchItemProps {
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: (value: boolean) => void;
}

const SwitchItem: React.FC<SwitchItemProps> = ({ title, subtitle, value, onToggle }) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <span className="text-[16px] font-medium text-foreground flex-1 pr-4">
                    {title}
                </span>

                {/* Toggle Switch */}
                <button
                    onClick={() => onToggle(!value)}
                    className={`w-11 h-6 rounded-full transition-colors duration-200 relative
            ${value ? 'bg-primary' : 'bg-foreground/20'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
            ${value ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>

            <p className="text-[13px] text-foreground/50 leading-relaxed">
                {subtitle}
            </p>
        </div>
    );
};

export default SharingReusePage;
