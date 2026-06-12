import { Check, ChevronDown, ChevronLeft, MoreVertical, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Mock Component for the Back Button
const CrimchartBackButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="p-2">
        <ChevronLeft size={26} className="text-foreground" />
    </button>
);

const AddAccountPage: React.FC = () => {
    const { t } = useTranslation();
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

    const accounts = [
        { name: 'Josh raynz', info: '', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200' },
        { name: 'The Star of China', info: '👑 Chart Title', avatar: 'https://i.pravatar.cc/150?img=11' },
        { name: 'raynzjosh4@gmail.com', info: '', avatar: '' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Top Navigation Bar */}
            <header className="px-4 py-2 flex items-center justify-between">
                <CrimchartBackButton onClick={() => window.history.back()} />
                <button
                    onClick={() => setIsLanguageModalOpen(true)}
                    className="flex items-center gap-1"
                >
                    <span className="text-sm text-foreground/50">{t('native_name')}</span>
                    <ChevronDown size={16} className="text-foreground/50" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6">
                <div className="h-24" /> {/* Spacer */}

                {/* Account List */}
                {accounts.map((acc, index) => (
                    <AccountTile key={index} account={acc} />
                ))}
            </div>

            {/* Bottom Footer */}
            <footer className="border-t border-foreground/10 flex">
                <button className="flex-1 py-5 text-primary font-bold text-sm">
                    {t('switch_accounts')}
                </button>
                <div className="w-[1px] h-6 bg-foreground/10 my-auto" />
                <button className="flex-1 py-5 text-primary font-bold text-sm">
                    {t('create_account')}
                </button>
            </footer>

            {/* Language Modal */}
            {isLanguageModalOpen && (
                <LanguageModal
                    isOpen={isLanguageModalOpen}
                    onClose={() => setIsLanguageModalOpen(false)}
                />
            )}
        </div>
    );
};

// Sub-components
const AccountTile: React.FC<{ account: any }> = ({ account }) => {
    const { t } = useTranslation();
    const hasInfo = account.info.length > 0;
    const isChartTitle = account.info.includes('Chart Title');

    return (
        <div className="py-3 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-foreground/10 flex items-center justify-center overflow-hidden">
                {account.avatar ? (
                    <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-foreground/30">👤</div>
                )}
            </div>

            <div className="flex-1">
                <p className="font-semibold text-base">{account.name}</p>
                {hasInfo && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {!isChartTitle && <div className="w-1 h-1 rounded-full bg-red-500" />}
                        {isChartTitle && <Star size={12} className="text-primary" />}
                        <span className={`text-xs ${isChartTitle ? 'text-primary font-bold' : 'text-foreground/40'}`}>
                            {account.info}
                        </span>
                    </div>
                )}
            </div>

            <button className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full">
                {t('log_in')}
            </button>
            <MoreVertical size={20} className="text-foreground/50 ml-2" />
        </div>
    );
};

const LanguageModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslation();
    const languages = ['English (US)', 'English (UK)', 'Luganda', 'Kiswahili', 'Spanish', 'French'];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
            <div className="w-full bg-background rounded-t-3xl p-5" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-center mb-5">{t('select_language')}</h2>
                {languages.map((lang, i) => (
                    <div key={lang} className="flex justify-between items-center py-3 cursor-pointer" onClick={onClose}>
                        <span className="text-base">{lang}</span>
                        {i === 0 && <Check size={20} className="text-primary" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddAccountPage;