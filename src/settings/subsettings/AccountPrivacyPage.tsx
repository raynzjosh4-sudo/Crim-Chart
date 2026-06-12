import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AccountPrivacyPage: React.FC = () => {
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
            <ChartAppBar title={t('account_privacy')} />

            <main className="p-4">
                <div className="flex justify-between items-center">
                    <span className="text-foreground text-base font-medium">
                        {t('private_account')}
                    </span>
                    <Switch
                        checked={isPrivate}
                        onChange={setIsPrivate}
                    />
                </div>

                <p className="mt-4 text-foreground/60 text-sm leading-6">
                    {t('private_account_desc')}
                </p>
            </main>
        </div>
    );
};

// Reusable Switch Component
interface SwitchProps {
    checked: boolean;
    onChange: (value: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-300'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
};

export default AccountPrivacyPage;
