import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const AllowCommentsFromPage: React.FC = () => {
    const { t } = useTranslation();
    const [selectedId, setSelectedId] = useState<string>('everyone');

    // Configuration for options
    const options = [
        { id: 'everyone', title: t('everyone_on_Chart') },
        { id: 'sharing_channel', title: t('only_shared_channels_comments') },
        { id: 'competitors', title: t('only_competitors') },
        { id: 'off', title: t('off') },
    ];

    return (
        <div className="min-h-screen bg-background">
            <ChartAppBar title={t('allow_comments_from')} />

            <main className="flex flex-col">
                {/* Description */}
                <p className="p-4 text-sm text-foreground/70">
                    {t('allow_comments_desc')}
                </p>

                {/* Options List */}
                <div className="flex flex-col">
                    {options.map((option) => (
                        <OptionItem
                            key={option.id}
                            title={option.title}
                            isSelected={selectedId === option.id}
                            onSelect={() => setSelectedId(option.id)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

// Reusable Option Item Component
interface OptionItemProps {
    title: string;
    isSelected: boolean;
    onSelect: () => void;
    subtitle?: string;
}

const OptionItem: React.FC<OptionItemProps> = ({ title, isSelected, onSelect, subtitle }) => {
    return (
        <div
            onClick={onSelect}
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors"
        >
            <div className="flex flex-col">
                <span className={`text-base ${isSelected ? 'font-bold' : 'font-normal'} text-foreground`}>
                    {title}
                </span>
                {subtitle && (
                    <span className="text-[13px] text-foreground/50 mt-0.5">
                        {subtitle}
                    </span>
                )}
            </div>

            {/* Custom Radio Button */}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary' : 'border-foreground/20'
                }`}>
                {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                )}
            </div>
        </div>
    );
};

export default AllowCommentsFromPage;
