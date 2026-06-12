import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const DeliverRequestsPage: React.FC = () => {
    const { t } = useTranslation();

    // Mock navigation handlers - Replace with your router's navigate function
    const navigateTo = (route: string) => console.log(`Navigating to: ${route}`);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('message_inbox_request')} />

            <main className="flex flex-col py-4">
                {/* Top Description */}
                <p className="px-4 pb-4 text-sm text-foreground/60">
                    {t('decide_inbox_desc')}
                </p>

                {/* Potential Connections Section */}
                <SectionHeader title={t('potential_connections')} />
                <SettingsItem
                    title={t('channels_you_joins')}
                    trailing={t('inbox_request')}
                    onClick={() => navigateTo('message-delivery-options')}
                />

                <div className="h-px bg-foreground/5 my-8" />

                {/* Other People Section */}
                <SectionHeader title={t('other_people')} />
                <SettingsItem
                    title={t('others_in_channels')}
                    trailing={t('inbox_request')}
                    onClick={() => navigateTo('message-delivery-options')}
                />

                <div className="h-px bg-foreground/5 my-8" />

                {/* Channel Settings Section */}
                <SectionHeader title={t('channel_settings')} />
                <SettingsItem
                    title={t('who_can_add_channel')}
                    onClick={() => navigateTo('group-add-settings')}
                />

                {/* Footer Description */}
                <p className="px-4 pt-4 text-[13px] text-foreground/50">
                    {t('not_all_messages_desc')}
                </p>
            </main>
        </div>
    );
};

// Reusable List Item
const SettingsItem: React.FC<{
    title: string;
    trailing?: string;
    onClick: () => void
}> = ({ title, trailing, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-black/5 transition-colors"
    >
        <span className="text-[15px]">{title}</span>
        <div className="flex items-center gap-2">
            {trailing && (
                <span className="text-sm text-foreground/50">
                    {trailing}
                </span>
            )}
            <ChevronRight size={18} className="text-foreground/30" />
        </div>
    </button>
);

// Reusable Section Header
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="px-4 mb-2 text-base font-bold text-foreground">
        {title}
    </h3>
);

export default DeliverRequestsPage;
