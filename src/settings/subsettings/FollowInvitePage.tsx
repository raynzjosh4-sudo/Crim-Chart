import { Mail, MessageSquare, Share2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { Switch } from 'react-native';

const FollowInvitePage: React.FC = () => {
    const { t } = useTranslation();
    const [autoConfirm, setAutoConfirm] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('join_and_invite')} />

            <main className="p-4">
                {/* Members Section */}
                <SectionHeader title={t('members_section')} />

                <div className="flex justify-between items-center">
                    <span className="text-base font-medium">
                        {t('auto_confirm')}
                    </span>
                    <Switch value={autoConfirm} onValueChange={setAutoConfirm} />
                </div>

                <p className="mt-3 text-[13px] text-foreground/50 leading-[1.4]">
                    {t('auto_confirm_desc')}
                </p>

                {/* Invite Friends Section */}
                <div className="mt-8">
                    <SectionHeader title={t('invite_friends')} />

                    <InviteItem
                        icon={<Mail size={20} />}
                        title={t('invite_email')}
                    />
                    <InviteItem
                        icon={<MessageSquare size={20} />}
                        title={t('invite_sms')}
                    />
                    <InviteItem
                        icon={<Share2 size={20} />}
                        title={t('invite_more')}
                    />
                </div>
            </main>
        </div>
    );
};

// Reusable Section Header
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="mb-4 text-base font-bold text-foreground">
        {title}
    </h3>
);

// Reusable Invite List Item
const InviteItem: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <button
        className="w-full flex items-center gap-4 py-4 hover:bg-black/5 transition-colors"
        onClick={() => console.log(`Inviting via: ${title}`)}
    >
        <div className="text-foreground">{icon}</div>
        <span className="text-[15px]">{title}</span>
    </button>
);

export default FollowInvitePage;
