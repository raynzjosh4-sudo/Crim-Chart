import { colors } from '@/core/theme/colors';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View, useWindowDimensions } from 'react-native';

const MOCK_MUSIC_ITEMS = [
  {
    id: '1',
    title: 'Midnight Synthwave Mix 2026',
    author: 'Listened to by Alex',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80',
    height: 340,
  },
  {
    id: '2',
    title: 'Top 50 Global Hits - This Week',
    author: 'Listened to by Sarah',
    image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f0f081?w=600&q=80',
    height: 280,
  },
  {
    id: '3',
    title: 'Acoustic Chill & Study Vibes',
    author: 'Listened to by Mike',
    image: 'https://images.unsplash.com/photo-1460036521480-c4b50fd04bdc?w=600&q=80',
    height: 380,
  },
  {
    id: '4',
    title: 'Underground Hip-Hop Gems',
    author: 'Listened to by Jordan',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    height: 310,
  },
];

export function FriendsMusicLayer() {
  const isWeb = Platform.OS === 'web';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { height } = useWindowDimensions();

  // WhatsApp Theme
  const bgColor = isDark ? '#111b21' : '#efeae2';
  const cardBgColor = isDark ? '#202c33' : '#ffffff';
  const textColor = isDark ? '#e9edef' : '#111b21';
  const authorColor = isDark ? '#8696a0' : '#667781';

  return (
    <View style={[
      styles.container,
      { backgroundColor: bgColor },
      isWeb ? { minHeight: height, justifyContent: 'center' } : {}
    ]}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Know what your friends listen to</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_MUSIC_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            style={({ hovered }: any) => [
              styles.cardContainer,
              { height: item.height, backgroundColor: cardBgColor },
              isWeb && hovered && styles.cardHovered
            ]}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <View style={[styles.textContainer, { backgroundColor: cardBgColor, borderTopColor: isDark ? '#111b21' : '#f0f0f0' }]}>
              <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.cardAuthor, { color: authorColor }]} numberOfLines={1}>
                {item.author}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 40,
    paddingLeft: 20, // Only left padding so scroll cuts off nicely on the right
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
    paddingRight: 20,
  },
  scrollContent: {
    gap: 20,
    paddingRight: 40,
    alignItems: 'flex-start',
  },
  cardContainer: {
    width: 240,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'transform 0.2s ease, box-shadow 0.2s ease' as any,
        cursor: 'pointer' as any,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' as any,
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }
    }),
  },
  cardHovered: {
    transform: [{ translateY: -4 }],
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)' as any,
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    minHeight: 80,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 20,
  },
  cardAuthor: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});
