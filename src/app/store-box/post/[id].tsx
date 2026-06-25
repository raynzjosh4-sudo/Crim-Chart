import { useLocalSearchParams } from 'expo-router';
import { StorePostingPage } from '@/features/boxes/components/store_posting/StorePostingPage';

export default function StoreBoxPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <StorePostingPage boxId={id as string} />;
}
