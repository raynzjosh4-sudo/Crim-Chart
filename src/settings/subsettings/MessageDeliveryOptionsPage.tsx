import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

interface MessageDeliveryOptionsProps {
    titleKey: string;
    descriptionKey: string;
}

const MessageDeliveryOptionsPage: React.FC<MessageDeliveryOptionsProps> = ({
    titleKey,
    descriptionKey
}) => {
    const { t } = useTranslation();
    const [selectedOption, setSelectedOption] = useState('Chart inbox requests');

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t(titleKey)} />

            <main className="py-4">
                {/* Section Header */}
                <h3 className="px-4 pb-2 text-[15px] font-bold">
                    {t('deliver_requests_to')}
                </h3>

                {/* Radio Items */}
                <RadioOption
                    label={t('Chart_inbox_requests')}
                    value="Chart inbox requests"
                    selected={selectedOption}
                    onSelect={setSelectedOption}
                />
                <RadioOption
                    label={t('no_receive_inbox_requests')}
                    value="Don't receive Chart inbox requests"
                    selected={selectedOption}
                    onSelect={setSelectedOption}
                />

                {/* Description Footer */}
                <p className="px-4 pt-4 text-[13px] text-foreground/50">
                    {t(descriptionKey)}
                </p>
            </main>
        </div>
    );
};

// Helper component for the Radio Item
interface RadioOptionProps {
    label: string;
    value: string;
    selected: string;
    onSelect: (value: string) => void;
}

const RadioOption: React.FC<RadioOptionProps> = ({ label, value, selected, onSelect }) => {
    const isSelected = selected === value;

    return (
        <button
            onClick={() => onSelect(value)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-black/5 transition-colors"
        >
            <span className="text-[15px]">{label}</span>

            {/* Custom Radio Visual */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
        ${isSelected ? 'border-primary' : 'border-foreground/20'}`}
            >
                {isSelected && (
                    <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                )}
            </div>
        </button>
    );
};

export default MessageDeliveryOptionsPage;
