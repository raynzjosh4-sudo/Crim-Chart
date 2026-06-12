import { PlusCircle, X } from 'lucide-react';
import React, { KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { Switch } from 'react-native'; // Assuming you have a Switch component from previous steps

const HiddenWordsPage: React.FC = () => {
    const { t } = useTranslation();
    const [manualFilter, setManualFilter] = useState(true);
    const [inputVal, setInputVal] = useState('');
    const [hiddenWords, setHiddenWords] = useState(['scam', 'spam', 'ads']);

    // Handle adding words (supports comma separation)
    const handleAddWords = () => {
        if (!inputVal.trim()) return;

        const newWords = inputVal
            .split(',')
            .map((w) => w.trim())
            .filter((w) => w !== '' && !hiddenWords.includes(w));

        setHiddenWords([...hiddenWords, ...newWords]);
        setInputVal('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleAddWords();
    };

    const removeWord = (wordToRemove: string) => {
        setHiddenWords(hiddenWords.filter((w) => w !== wordToRemove));
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title={t('hidden_words')} />

            <main className="p-4">
                {/* Description */}
                <p className="text-sm text-foreground/80 leading-[1.4]">
                    {t('hidden_words_desc')}
                </p>

                {/* Toggle Switch */}
                <div className="flex justify-between items-center mt-8">
                    <span className="text-base font-medium">
                        {t('manual_filter')}
                    </span>
                    <Switch value={manualFilter} onValueChange={setManualFilter} />
                </div>

                {/* Conditional Content */}
                {manualFilter && (
                    <div className="mt-6">
                        <h3 className="text-base font-bold mb-3">
                            {t('custom_words_phrases')}
                        </h3>

                        {/* Input Field */}
                        <div className="flex items-center bg-foreground/5 rounded-[10px] p-1">
                            <input
                                type="text"
                                value={inputVal}
                                onChange={(e: any) => setInputVal(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('add_words_placeholder')}
                                className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-[15px] placeholder:text-foreground/30"
                            />
                            <button
                                onClick={handleAddWords}
                                className="p-2 text-primary hover:opacity-80 transition-opacity"
                            >
                                <PlusCircle size={24} />
                            </button>
                        </div>

                        {/* Chips Container */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {hiddenWords.map((word) => (
                                <div
                                    key={word}
                                    className="flex items-center gap-1 bg-foreground/5 px-3 py-2 rounded-[8px]"
                                >
                                    <span className="text-[14px]">{word}</span>
                                    <button
                                        onClick={() => removeWord(word)}
                                        className="text-foreground/50 hover:text-foreground transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HiddenWordsPage;
