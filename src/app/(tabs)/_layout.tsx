import { AppBottomNavBar } from '@/components/navbar/AppBottomNavBar';
import { DraggableProfileButton } from '@/components/profile/DraggableProfileButton';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  const bottomPadding = Math.max(8, insets.bottom);
  const tabBarHeight = 60 + insets.bottom;

  const last = String(segments[segments.length - 1] ?? '');
  let selectedIndex = 0;
  if (last === 'index' || last === '') selectedIndex = 0;
  else if (last === 'vids' || last === 'explore') selectedIndex = 1;
  else if (last === 'channels') selectedIndex = 3;
  else if (last === 'inbox') selectedIndex = 5;

  const onItemTapped = (index: number) => {
    console.log(`[TabsLayout] Tapped tab index: ${index}`);
    try {
      switch (index) {
        case 0:
          router.navigate('/');
          break;
        case 1:
          router.navigate('/vids');
          break;
        case 2:
          router.navigate('/first-post');
          break;
        case 3:
          router.navigate('/channels');
          break;
        case 5:
          router.navigate('/inbox');
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(`[TabsLayout] Navigation error:`, e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      <View style={[styles.tabBar, { height: tabBarHeight, paddingBottom: bottomPadding }]}>
        <AppBottomNavBar selectedIndex={selectedIndex} onItemTapped={onItemTapped} />
      </View>

      <DraggableProfileButton />
    </View>
  );
}

const styles = StyleSheet.create({
  tabarIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabbaricon2: {
    position: 'absolute',
    right: -4,
    top: -6,
    backgroundColor: '#FF453A',
    borderRadius: 6,
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: '#000',
  },

  tabBar: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#000',
  },
})
