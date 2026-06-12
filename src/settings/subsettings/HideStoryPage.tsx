import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const HideStoryPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('hide_story')} />

            <main>
                {/* ListTile replacement */}
                <button
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-black/5 transition-colors"
                    onClick={() => console.log('Navigate to Hide Story From')}
                >
                    <span className="text-[15px] font-normal">
                        {t('hide_story_from')}
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="text-[14px] text-foreground/50">
                            {t('zero_people')}
                        </span>
                        <ChevronRight size={18} className="text-foreground/30" />
                    </div>
                </button>

                {/* Description Text */}
                <div className="px-4 py-4">
                    <p className="text-[13px] text-foreground/50 leading-relaxed">
                        {t('hide_story_desc')}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default HideStoryPage;
