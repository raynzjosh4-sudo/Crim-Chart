import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { TooltipBadge } from './TooltipBadge';

export const SearchPromptBadge = ({ placement = 'bottom', width = 130 }: { placement?: 'top' | 'bottom' | 'right', width?: number }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const { t } = useTranslation();
  const theme = useCurrentTheme();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    
    const showTooltip = () => {
      const searchPrompts = [
        t('search_music', 'Search music'),
        t('search_people', 'Search a friend'),
        t('search_channels', 'Search channels'),
        t('search_videos', 'Search videos'),
        t('search_boxes', 'Search boxes'),
        t('search_crowns', 'Search crowns')
      ];
      const randomPrompt = searchPrompts[Math.floor(Math.random() * searchPrompts.length)];
      setTooltipText(randomPrompt);
      setTooltipVisible(true);

      timeoutId = setTimeout(() => {
        setTooltipVisible(false);
      }, 5000);
    };

    // Initial show after 12 seconds to avoid overlapping with TrendingBadge (which shows for 10s)
    const initialTimeout = setTimeout(() => {
      showTooltip();
      // Then set up the repeating interval every 10 seconds
      interval = setInterval(showTooltip, 10000);
    }, 12000);

    return () => {
      clearTimeout(initialTimeout);
      if (interval) clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Intentionally empty dependency array so it doesn't reset

  return (
    <TooltipBadge 
      visible={tooltipVisible} 
      text={tooltipText} 
      color={theme.colors.error || '#FF3B30'} 
      width={140} 
      placement={placement}
    />
  );
};
