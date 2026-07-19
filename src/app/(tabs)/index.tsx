import { MainFeedPage } from '@/mainFeed/pages/MainFeedPage';
import { GuestFeedPage } from '@/features/feed/pages/GuestFeedPage';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export default function HomeScreen() {
  const user = useAuthStore(s => s.user);
  return user ? <MainFeedPage /> : <GuestFeedPage />;
}
