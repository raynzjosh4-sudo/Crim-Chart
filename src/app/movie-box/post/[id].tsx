import { useLocalSearchParams } from 'expo-router';
import { MoviePostingPage } from '@/features/boxes/components/video_posting/MoviePostingPage';

export default function MovieBoxPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <MoviePostingPage boxId={id as string} />;
}
