import { Search } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const BlockedCommentersPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ChartAppBar title={t('blocked_commenters')} />

            {/* Search Input Container */}
            <div className="p-4">
                <div className="h-[45px] bg-foreground/5 rounded-[10px] flex items-center px-4">
                    <Search
                        size={18}
                        className="text-foreground/40"
                    />
                    <input
                        type="text"
                        placeholder={t('search')}
                        className="flex-1 bg-transparent border-none outline-none ml-3 text-sm text-foreground placeholder:text-foreground/40"
                    />
                </div>
            </div>

            {/* Empty State / List Area */}
            {/* flex-1 acts like Expanded in Flutter */}
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-foreground/40">
                    {t('no_blocked_commenters')}
                </p>
            </div>
        </div>
    );
};

export default BlockedCommentersPage;
