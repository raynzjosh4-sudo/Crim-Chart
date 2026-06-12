import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const BlockedPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <ChartAppBar title={t('blocked')} />

            {/* Tab Header */}
            <div className="flex border-b border-foreground/10">
                <TabButton
                    isActive={activeTab === 0}
                    onClick={() => setActiveTab(0)}
                    label={t('accounts')}
                />
                <TabButton
                    isActive={activeTab === 1}
                    onClick={() => setActiveTab(1)}
                    label={t('channel')}
                />
            </div>

            {/* Tab Content */}
            <div className="flex-1 flex items-center justify-center">
                {activeTab === 0 ? (
                    <EmptyState message={t('no_blocked_accounts')} />
                ) : (
                    <EmptyState message={t('no_blocked_commenters')} />
                )}
            </div>
        </div>
    );
};

// Helper: Custom Tab Button
const TabButton: React.FC<{ isActive: boolean; onClick: () => void; label: string }> = ({
    isActive,
    onClick,
    label
}) => (
    <button
        onClick={onClick}
        className={`flex-1 py-4 text-sm font-medium transition-colors duration-200 border-b-2 ${isActive
                ? 'border-foreground text-foreground'
                : 'border-transparent text-foreground/50'
            }`}
    >
        {label}
    </button>
);

// Helper: Empty State View
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-sm text-foreground/40">
        {message}
    </div>
);

export default BlockedPage;
