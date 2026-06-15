import { useLocalSearchParams } from 'expo-router';
import { MusicBoxDetailPage } from '@/features/boxes/pages/details/MusicBoxDetailPage';

export default function MusicBoxDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <MusicBoxDetailPage id={id as string} />;
}
