import { useLocalSearchParams } from 'expo-router';
import { MovieBoxDetailPage } from '@/features/boxes/pages/details/MovieBoxDetailPage';

export default function MovieBoxDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <MovieBoxDetailPage id={id as string} />;
}
