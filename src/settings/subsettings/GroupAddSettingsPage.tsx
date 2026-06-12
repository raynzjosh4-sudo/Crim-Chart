import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const GroupAddSettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const [selectedOption, setSelectedOption] = useState('everyone_on_chart');

    // Define options to map over, making the UI data-driven
    const options = [
        {
            value: 'everyone_on_chart',
            title: t('everyone_on_Chart'),
            desc: t('everyone_on_chart_desc')
        },
        {
            value: 'only_shared_channels',
            title: t('only_shared_channels'),
            desc: t('only_shared_channels_desc')
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('who_can_add_channel')} />

            <main className="py-4">
                {options.map((option) => {
                    const isSelected = selectedOption === option.value;

                    return (
                        <button
                            key={option.value}
                            onClick={() => setSelectedOption(option.value)}
                            className="w-full flex items-start gap-4 px-4 py-4 hover:bg-black/5 transition-colors text-left"
                        >
                            {/* Radio Indicator */}
                            <div
                                className={`mt-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-primary' : 'border-foreground/20'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="w-[12px] h-[12px] rounded-full bg-primary" />
                                )}
                            </div>

                            {/* Text Content */}
                            <div className="flex-1">
                                <div className="text-base text-foreground">
                                    {option.title}
                                </div>
                                <div className="mt-1 text-[13px] text-foreground/50 leading-snug">
                                    {option.desc}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </main>
        </div>
    );
};

export default GroupAddSettingsPage;
