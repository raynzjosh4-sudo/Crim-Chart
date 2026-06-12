import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { Switch } from 'react-native';

const CommentControlsPage: React.FC = () => {
    const { t } = useTranslation();
    const [hideOffensive, setHideOffensive] = useState(true);

    // Placeholder navigation handlers
    const navigateTo = (path: string) => console.log(`Navigating to: ${path}`);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('comment_controls')} />

            <main className="flex flex-col">
                {/* Navigation Items */}
                <SettingsItem
                    title={t('allow_comments_from')}
                    trailingText={t('everyone')}
                    onClick={() => navigateTo('allow-comments')}
                />
                <SettingsItem
                    title={t('block_comments_from')}
                    trailingText={t('zero_people')}
                    onClick={() => navigateTo('blocked-commenters')}
                />

                {/* Description Text */}
                <p className="px-4 py-2 text-[13px] text-foreground/50">
                    {t('block_comments_desc')}
                </p>

                <div className="h-8 border-b border-foreground/5" />

                {/* Filters Section */}
                <SectionHeader title={t('filters')} />

                <div className="px-4">
                    <div className="flex justify-between items-center">
                        <span className="text-base font-medium">
                            {t('hide_offensive_comments')}
                        </span>
                        <Switch value={hideOffensive} onValueChange={setHideOffensive} />
                    </div>
                    <p className="mt-1 text-[13px] text-foreground/50">
                        {t('hide_offensive_desc')}
                    </p>
                </div>
            </main>
        </div>
    );
};

// Reusable Navigation Item
const SettingsItem: React.FC<{
    title: string;
    trailingText: string;
    onClick: () => void
}> = ({ title, trailingText, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-black/5 transition-colors"
    >
        <span className="text-[15px]">{title}</span>
        <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/50">{trailingText}</span>
            <ChevronRight size={18} className="text-foreground/30" />
        </div>
    </button>
);

// Reusable Section Header
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="px-4 pt-2 pb-4 text-base font-bold text-foreground">
        {title}
    </h3>
);

export default CommentControlsPage;
