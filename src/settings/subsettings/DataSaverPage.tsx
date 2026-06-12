import { Check } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { Switch } from 'react-native';

const DataSaverPage: React.FC = () => {
    const { t } = useTranslation();
    const [dataSaver, setDataSaver] = useState(false);
    const [highResKey, setHighResKey] = useState('wifi_only');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const options = ['never', 'wifi_only', 'cellular_wifi'];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('data_saver')} />

            <main className="flex flex-col">
                {/* Data Saver Toggle */}
                <div className="p-4 flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <h2 className="text-base font-medium">{t('data_saver')}</h2>
                        <p className="mt-1 text-[13px] text-foreground/50">
                            {t('data_saver_desc')}
                        </p>
                    </div>
                    <Switch value={dataSaver} onValueChange={setDataSaver} />
                </div>

                <div className="h-px bg-foreground/5 mx-4" />

                {/* High Res Media Selection */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full text-left px-4 py-4 flex flex-col hover:bg-black/5 transition-colors"
                >
                    <span className="text-base">{t('high_res_media')}</span>
                    <span className="text-sm text-primary mt-1">{t(highResKey)}</span>
                </button>
            </main>

            {/* Bottom Sheet Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
                    <div
                        className="w-full bg-background rounded-t-[20px] p-6 pb-12 animate-in slide-in-from-bottom"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {options.map((key) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setHighResKey(key);
                                    setIsModalOpen(false);
                                }}
                                className="w-full py-4 flex items-center justify-between"
                            >
                                <span className={`text-base ${highResKey === key ? 'font-bold text-primary' : ''}`}>
                                    {t(key)}
                                </span>
                                {highResKey === key && <Check size={20} className="text-primary" />}
                            </button>
                        ))}
                    </div>
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setIsModalOpen(false)} />
                </div>
            )}
        </div>
    );
};

export default DataSaverPage;
