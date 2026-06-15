import { Plus, User } from 'lucide-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';

interface TaggerRowProps {
  taggerName?: string | null;
  taggerAvatar?: string | null;
  tagsCount: number;
}

export const TaggerRow: React.FC<TaggerRowProps> = ({ taggerName, taggerAvatar, tagsCount }) => {
  if (!taggerName) return null;

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {taggerAvatar ? (
          <Image source={{ uri: taggerAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <User size={12} color="#FFF" />
          </View>
        )}
        {tagsCount > 3 && (
          <View style={styles.plusBadge}>
            <Plus size={8} color="#FFF" />
          </View>
        )}
      </View>
      <Text style={styles.text}>
        {taggerName} tagged this post
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  placeholderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#FACD11',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
