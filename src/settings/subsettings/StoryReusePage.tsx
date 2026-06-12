import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const StoryReusePage: React.FC = () => {
    const { t } = useTranslation();
    const [selectedOption, setSelectedOption] = useState('Only people you share the same channel');

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('story_reuse')} />

            <main className="py-4">
                {/* Section Header */}
                <h3 className="px-4 pb-2 text-[15px] font-bold">
                    {t('who_can_reuse_your_story')}
                </h3>

                {/* Radio Options */}
                <RadioOption
                    title={t('everyone')}
                    subtitle={t('everyone_reuse_desc')}
                    isSelected={selectedOption === 'Everyone'}
                    onSelect={() => setSelectedOption('Everyone')}
                />

                <RadioOption
                    title={t('only_people_same_channel')}
                    subtitle={t('same_channel_reuse_desc')}
                    isSelected={selectedOption === 'Only people you share the same channel'}
                    onSelect={() => setSelectedOption('Only people you share the same channel')}
                />

                {/* Info Footer */}
                <p className="px-4 pt-4 text-[13px] text-foreground/50 leading-relaxed">
                    {t('reuse_policy_desc')}
                </p>
            </main>
        </div>
    );
};

// Reusable Radio Item Component
interface RadioOptionProps {
    title: string;
    subtitle: string;
    isSelected: boolean;
    onSelect: () => void;
}

const RadioOption: React.FC<RadioOptionProps> = ({ title, subtitle, isSelected, onSelect }) => {
    return (
        <button
            onClick={onSelect}
            className="w-full flex items-start justify-between px-4 py-4 hover:bg-black/5 transition-colors text-left"
        >
            <div className="flex-1 pr-4">
                <h4 className="text-[16px] font-medium">{title}</h4>
                <p className="text-[13px] text-foreground/50 mt-1">{subtitle}</p>
            </div>

            {/* Radio Indicator */}
            <div className={`mt-0.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
        ${isSelected ? 'border-primary' : 'border-foreground/20'}`}
            >
                {isSelected && (
                    <div className="w-3 h-3 bg-primary rounded-full" />
                )}
            </div>
        </button>
    );
};

export default StoryReusePage;
