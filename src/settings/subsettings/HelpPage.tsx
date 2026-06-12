import {
    AlertTriangle,
    ChevronRight,
    HelpCircle,
    MessageSquare,
    ShieldCheck
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const HelpPage: React.FC = () => {
    const { t } = useTranslation();

    // Define the menu items data
    const helpItems = [
        { icon: AlertTriangle, label: t('report_problem') },
        { icon: HelpCircle, label: t('help_center') },
        { icon: ShieldCheck, label: t('privacy_security_help') },
        { icon: MessageSquare, label: t('support_requests') },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('help')} />

            <main className="py-2">
                {helpItems.map((item, index) => (
                    <HelpItem
                        key={index}
                        icon={item.icon}
                        title={item.label}
                        onClick={() => console.log(`Navigating to: ${item.label}`)}
                    />
                ))}
            </main>
        </div>
    );
};

// Reusable List Item component
interface HelpItemProps {
    icon: React.ElementType;
    title: string;
    onClick: () => void;
}

const HelpItem: React.FC<HelpItemProps> = ({ icon: Icon, title, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center px-4 py-3 hover:bg-black/5 transition-colors"
    >
        <Icon size={22} className="text-foreground mr-4" />
        <span className="flex-1 text-left text-base text-foreground">
            {title}
        </span>
        <ChevronRight size={18} className="text-foreground/30" />
    </button>
);

export default HelpPage;
