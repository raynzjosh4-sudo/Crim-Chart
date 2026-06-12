import React, { useState } from 'react';
import { Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
const ActivityStatusPage: React.FC = () => {
    const { t } = useTranslation();
    const [showStatus, setShowStatus] = useState<boolean>(true);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('Chart_activity_status')} />

            <main className="p-4 flex flex-col">
                {/* Toggle Row */}
                <div className="flex justify-between items-center">
                    <span className="text-base font-medium">
                        {t('show_activity_status')}
                    </span>
                    <Switch
                        value={showStatus}
                        onValueChange={setShowStatus}
                    />
                </div>

                {/* Description */}
                <p className="mt-2 text-[13px] text-foreground/50 leading-[1.4]">
                    {t('activity_status_desc')}
                </p>

                {/* Footer */}
                <p className="mt-6 text-[13px] text-foreground/50">
                    {t('activity_status_footer')}
                </p>
            </main>
        </div>
    );
};

export default ActivityStatusPage;
