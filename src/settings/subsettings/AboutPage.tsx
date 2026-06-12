import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('about')} />

            <main className="flex flex-col">
                <AboutItem title={t('privacy_policy')} />
                <AboutItem title={t('terms_of_use')} />
                <AboutItem title={t('open_source_libs')} />

                <div className="p-4 text-sm text-foreground/50">
                    {t('version')} 1.0.0
                </div>
            </main>
        </div>
    );
};

// Helper component for the list items
interface AboutItemProps {
    title: string;
    onTap?: () => void;
}

const AboutItem: React.FC<AboutItemProps> = ({ title, onTap }) => {
    return (
        <div
            onClick={onTap}
            className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors"
        >
            <span className="text-base text-foreground">
                {title}
            </span>
            <ChevronRight
                className="w-[18px] h-[18px] text-foreground/30"
            />
        </div>
    );
};

export default AboutPage;
