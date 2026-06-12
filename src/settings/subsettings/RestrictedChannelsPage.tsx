import { MinusCircle, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const RestrictedChannelsPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <ChartAppBar title={t('restricted_channels')} />

            <main className="flex-1 flex flex-col">
                {/* Description */}
                <p className="px-4 py-4 text-[14px] text-foreground/60 leading-relaxed">
                    {t('protect_interaction_desc')}
                </p>

                {/* Search Bar */}
                <div className="px-4">
                    <div className="h-11 bg-foreground/5 rounded-[10px] flex items-center px-3">
                        <Search className="text-foreground/30 w-[18px] h-[18px] mr-2" />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent w-full outline-none text-[15px] text-foreground placeholder:text-foreground/30"
                        />
                    </div>
                </div>

                {/* Empty State */}
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-20 h-20 rounded-full border border-foreground/10 flex items-center justify-center">
                        <MinusCircle className="text-foreground/20 w-10 h-10" />
                    </div>

                    <h2 className="text-[18px] font-bold mt-6">
                        {t('no_restricted_channels')}
                    </h2>

                    <p className="text-[14px] text-foreground/50 text-center mt-2 px-10">
                        {t('restrict_channel_desc')}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default RestrictedChannelsPage;
