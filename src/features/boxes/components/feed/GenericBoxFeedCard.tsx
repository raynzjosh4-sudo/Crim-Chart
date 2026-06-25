import React, { useEffect, useState } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { MovieBoxFeedCard } from './MovieBoxFeedCard';
import { MusicBoxFeedCard } from './MusicBoxFeedCard';
import { StoreBoxFeedCard } from './StoreBoxFeedCard';
import { SportsBoxFeedCard } from './SportsBoxFeedCard';
import { VotingBoxFeedCard } from './VotingBoxFeedCard';

interface Props { boxId: string; prefetchedData?: any; boxTypeHint?: string; }

export const GenericBoxFeedCard = ({ boxId, prefetchedData, boxTypeHint }: Props) => {
  const [boxType, setBoxType] = useState<string | null>(
    boxTypeHint || prefetchedData?.box_type || prefetchedData?.raw?.box_type || null
  );

  useEffect(() => {
    let isMounted = true;
    if (!boxType && boxId) {
      supabase.from('boxes').select('box_type').eq('id', boxId).single()
        .then(({ data }) => {
          if (isMounted && data) {
            let mappedType = data.box_type;
            if (mappedType === 'audio') mappedType = 'music';
            if (mappedType === 'video') mappedType = 'movie';
            if (mappedType === 'marketplace') mappedType = 'store';
            if (mappedType === 'contest') mappedType = 'voting';
            setBoxType(mappedType);
          }
        });
    }
    return () => { isMounted = false; };
  }, [boxId, boxType]);

  if (!boxType) return null;

  switch (boxType) {
    case 'store':
    case 'marketplace':
    case 'box_marketplace':
      return <StoreBoxFeedCard boxId={boxId} prefetchedData={prefetchedData} />;
    case 'movie':
    case 'video':
    case 'box_movie':
    case 'box_video':
      return <MovieBoxFeedCard boxId={boxId} prefetchedData={prefetchedData} />;
    case 'music':
    case 'audio':
    case 'box_music':
    case 'box_audio':
      return <MusicBoxFeedCard boxId={boxId} prefetchedData={prefetchedData} />;
    case 'sports':
    case 'box_sports':
      return <SportsBoxFeedCard boxId={boxId} prefetchedData={prefetchedData} />;
    case 'voting':
    case 'contest':
    case 'box_voting':
    case 'box_contest':
      return <VotingBoxFeedCard boxId={boxId} prefetchedData={prefetchedData} />;
    default:
      return null;
  }
};
