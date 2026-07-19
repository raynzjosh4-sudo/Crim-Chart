import { useLocalSearchParams } from 'expo-router';
import { MusicBoxDetailPage } from '@/features/boxes/pages/details/MusicBoxDetailPage';
import { Platform, useWindowDimensions, View } from 'react-native';

export default function MusicBoxDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (isDesktop) {
    return (
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
        <View style={{ width: '100%', maxWidth: 600, flex: 1, backgroundColor: '#000', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <MusicBoxDetailPage id={id as string} />
        </View>
      </View>
    );
  }

  return <MusicBoxDetailPage id={id as string} />;
}
