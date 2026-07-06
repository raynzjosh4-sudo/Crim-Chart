export type SearchEntityType = 
  | 'profile' 
  | 'channel' 
  | 'music' | 'video' | 'post' 
  | 'channel_music' | 'channel_video' | 'channel_post' 
  | 'box_music' | 'box_movie' | 'box_store' | 'box_sports' | 'box_voting' 
  | 'crown';

export interface GlobalSearchResult {
  entity_id: string;
  entity_type: SearchEntityType;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  rank: number;
}
