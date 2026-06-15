import { useLocalSearchParams } from 'expo-router';
import { MusicPostingPage } from '@/features/boxes/components/music_posting/MusicPostingPage';

export default function MusicBoxPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <MusicPostingPage boxId={id as string} />;
}
