import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const MessagesStoryRepliesPage: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('messages_story_reuse')} />

            <main className="py-2">
                {/* How people reach you section */}
                <SectionHeader title={t('how_people_reach_you')} />

                <SettingsItem
                    label={t('message_inbox_request')}
                    onClick={() => console.log('navigate: ')}
                />
                <SettingsItem
                    label={t('story_reuse')}
                    onClick={() => console.log('navigate: ')}
                />

                <hr className="my-4 border-foreground/5" />

                {/* Who can see online section */}
                <SectionHeader title={t('who_can_see_online')} />

                <SettingsItem
                    label={t('show_activity_status')}
                    onClick={() => console.log('navigate: ')}
                />
            </main>
        </div>
    );
};

// Helper Components
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="px-4 py-4 text-[12px] font-bold text-foreground/50 uppercase tracking-wide">
        {title}
    </h3>
);

const SettingsItem: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-black/5 transition-colors text-left"
    >
        <span className="text-[15px]">{label}</span>
        <ChevronRight size={18} className="text-foreground/30" />
    </button>
);

export default MessagesStoryRepliesPage;

