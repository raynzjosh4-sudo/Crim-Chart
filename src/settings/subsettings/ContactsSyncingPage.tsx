import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { Switch } from 'react-native';

const ContactsSyncingPage: React.FC = () => {
    const { t } = useTranslation();
    const [syncEnabled, setSyncEnabled] = useState<boolean>(true);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('contacts_syncing')} />

            <main className="p-4 flex flex-col">
                {/* Toggle Row */}
                <div className="flex justify-between items-center">
                    <span className="text-base font-medium flex-1">
                        {t('connect_with_members')}
                    </span>
                    <Switch
                        value={syncEnabled}
                        onValueChange={setSyncEnabled}
                    />
                </div>

                {/* Description */}
                <p className="mt-4 text-sm text-foreground/60 leading-[1.5]">
                    {t('sync_desc')}
                </p>
            </main>
        </div>
    );
};

export default ContactsSyncingPage;
