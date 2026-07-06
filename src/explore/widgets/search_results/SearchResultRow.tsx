import React from 'react';
import { GlobalSearchResult } from '../../models/GlobalSearchResult';
import { ProfileSearchRow } from './widgets/ProfileSearchRow';
import { ChannelSearchRow } from './widgets/ChannelSearchRow';
import { MusicSearchRow } from './widgets/MusicSearchRow';
import { VideoSearchRow } from './widgets/VideoSearchRow';
import { PostSearchRow } from './widgets/PostSearchRow';
import { ChannelPostSearchRow } from './widgets/ChannelPostSearchRow';
import { BoxSearchRow } from './widgets/BoxSearchRow';
import { CrownSearchRow } from './widgets/CrownSearchRow';

interface Props {
  item: GlobalSearchResult;
}

export const SearchResultRow: React.FC<Props> = React.memo(({ item }) => {
  switch (item.entity_type) {
    case 'profile':
      return <ProfileSearchRow item={item} />;
    case 'channel':
      return <ChannelSearchRow item={item} />;
    case 'music':
      return <MusicSearchRow item={item} />;
    case 'video':
      return <VideoSearchRow item={item} />;
    case 'post':
      return <PostSearchRow item={item} />;
    case 'channel_music':
    case 'channel_video':
    case 'channel_post':
      return <ChannelPostSearchRow item={item} />;
    case 'box_music':
    case 'box_movie':
    case 'box_store':
    case 'box_sports':
    case 'box_voting':
      return <BoxSearchRow item={item} />;
    case 'crown':
      return <CrownSearchRow item={item} />;
    default:
      return null;
  }
});
