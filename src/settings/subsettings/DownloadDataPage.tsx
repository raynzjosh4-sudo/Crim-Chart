import { DownloadCloud } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const DownloadDataPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ChartAppBar title={t('download_info')} />

            {/* flex-1 makes the main container expand to fill the screen,
        allowing mt-auto on the button container to act like a Spacer
      */}
            <main className="flex-1 flex flex-col items-center p-6">
                {/* Icon Circle */}
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <DownloadCloud size={40} className="text-primary" />
                </div>

                {/* Header Text */}
                <h1 className="text-[20px] font-bold mt-6 text-foreground">
                    {t('get_copy_header')}
                </h1>

                {/* Description Text */}
                <p className="text-sm text-foreground/60 text-center mt-4 leading-[1.5]">
                    {t('download_desc')}
                </p>

                {/* Spacer / Button Container */}
                <div className="w-full mt-auto">
                    <button
                        className="w-full h-[50px] bg-primary text-white rounded-[12px] font-bold text-base transition-opacity hover:opacity-90"
                        onClick={() => console.log('Download requested')}
                    >
                        {t('request_download')}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default DownloadDataPage;
