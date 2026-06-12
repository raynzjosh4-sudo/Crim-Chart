import { Ban, Bug, Camera, ChevronRight, DownloadCloud, EyeOff, Globe, Info, LifeBuoy, Lock, Maximize, MessageCircle, MinusCircle, Palette, RefreshCw, Send, Type, UserCheck, UserPlus as UserPlusIcon } from 'lucide-react';
// using the automatic JSX runtime; no default React import required
import { useTranslation } from 'react-i18next';

import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import CacheManager from '@/core/utils/cache_manager';

const SettingsPage = () => {
    const { t } = useTranslation();
    const navigation = require('@react-navigation/native').useNavigation();

    return (
        <div className="min-h-screen bg-background text-foreground pb-10">
            <ChartAppBar title={t('settings')} />

            <main className="flex flex-col">
                {/* Who can see content */}
                <SettingsSection title={t('who_can_see_content')}>
                    <SettingsItem icon={Lock} title={t('account_privacy')} trailingText={t('public')} onClick={() => navigation.navigate('/privacy')} />
                    <SettingsItem icon={Ban} title={t('blocked')} onClick={() => navigation.navigate('/blocked')} />
                    <SettingsItem icon={Camera} title={t('hide_story')} onClick={() => navigation.navigate('/hide-story')} />
                    <SettingsItem icon={EyeOff} title={t('visibility_off_Chart')} onClick={() => navigation.navigate('/visibility')} />
                </SettingsSection>

                <hr className="border-foreground/5" />

                {/* Interaction Section */}
                <SettingsSection title={t('how_others_interact')}>
                    <SettingsItem icon={Send} title={t('messages_story_reuse')} onClick={() => navigation.navigate('/messages')} />
                    <SettingsItem icon={MessageCircle} title={t('comments')} onClick={() => navigation.navigate('/comments')} />
                    <SettingsItem icon={RefreshCw} title={t('sharing_reuse')} onClick={() => navigation.navigate('/sharing')} />
                    <SettingsItem icon={MinusCircle} title={t('restricted_channels')} onClick={() => navigation.navigate('/restricted')} />
                    <SettingsItem icon={Type} title={t('hidden_words')} onClick={() => navigation.navigate('/hidden-words')} />
                    <SettingsItem icon={UserCheck} title={t('contacts_syncing')} onClick={() => navigation.navigate('/contacts')} />
                    <SettingsItem icon={UserPlusIcon} title={t('join_invite')} onClick={() => navigation.navigate('/invite')} />
                </SettingsSection>

                <hr className="border-foreground/5" />

                {/* App & Media */}
                <SettingsSection title={t('app_and_media')}>
                    <SettingsItem icon={Palette} title={t('theme')} onClick={() => navigation.navigate('/theme')} />
                    <SettingsItem icon={Type} title={t('fonts')} onClick={() => navigation.navigate('/fonts')} />
                    <SettingsItem icon={Maximize} title={t('display_text_size')} onClick={() => navigation.navigate('/display')} />
                    <SettingsItem icon={Globe} title={t('language')} onClick={() => navigation.navigate('/language')} />
                    <SettingsItem icon={RefreshCw} title={t('data_saver')} onClick={() => navigation.navigate('/data')} />
                    <SettingsItem icon={DownloadCloud} title={t('download_data')} onClick={() => navigation.navigate('/download')} />
                </SettingsSection>

                <hr className="border-foreground/5" />

                {/* Support */}
                <SettingsSection title={t('more_info_support')}>
                    <SettingsItem icon={LifeBuoy} title={t('help')} onClick={() => navigation.navigate('/help')} />
                    <SettingsItem icon={Info} title={t('about')} onClick={() => navigation.navigate('/about')} />
                </SettingsSection>

                <hr className="border-foreground/5" />

                {/* Debug Section */}
                <SettingsSection title="Developer Tools (Debug)">
                    <SettingsItem
                        icon={Bug}
                        title="Nuke Local Cache"
                        subtitle="Wipes SQLite tables & image files"
                        iconColor="text-yellow-500"
                        onClick={async () => {
                            await CacheManager.clearCache();
                            alert("Cache Nuked!");
                        }}
                    />
                </SettingsSection>

                <hr className="border-foreground/5" />

                {/* Login/Logout */}
                <div className="mt-6">
                    <SettingsItem title={t('add_account')} textColor="text-primary" onClick={() => navigation.navigate('/add-account')} />
                    <SettingsItem title={t('switch_account')} textColor="text-primary" onClick={() => { }} />
                    <SettingsItem title={t('log_out')} textColor="text-destructive" onClick={() => {/* Open Modal */ }} />
                </div>
            </main>
        </div>
    );
};

// --- Sub-components for clean architecture ---

const SettingsSection = ({ title, children }: { title: string, children: any }) => (
    <section className="mt-4 mb-2">
        <h3 className="px-4 mb-2 text-[12px] font-bold text-foreground/50 uppercase tracking-wider">
            {title}
        </h3>
        {children}
    </section>
);

interface SettingsItemProps {
    icon?: any;
    title: string;
    subtitle?: string;
    trailingText?: string;
    textColor?: string;
    iconColor?: string;
    onClick: () => void;
}

const SettingsItem = ({
    icon: Icon, title, subtitle, trailingText, textColor = "text-foreground", iconColor = "text-primary", onClick
}: SettingsItemProps) => (
    <button
        onClick={onClick}
        className="w-full flex items-center px-4 py-3 hover:bg-black/5 transition-colors text-left"
    >
        {Icon && (
            <div className={`mr-4 ${iconColor}`}>
                <Icon size={20} />
            </div>
        )}
        <div className="flex-1">
            <div className={`text-[15px] ${textColor}`}>{title}</div>
            {subtitle && <p className="text-[12px] text-foreground/50 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center text-foreground/30">
            {trailingText && <span className="text-[14px] mr-2 text-foreground/50">{trailingText}</span>}
            <ChevronRight size={18} />
        </div>
    </button>
);

export default SettingsPage;
