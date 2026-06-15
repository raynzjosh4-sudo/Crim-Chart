import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Animated, PanResponder } from 'react-native';
import { Music, Play, ShoppingBag, Trophy, FolderHeart, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export type BoxCategory = 'audio' | 'video' | 'marketplace' | 'sports' | 'contest';

interface CreateBoxSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateBoxSheet: React.FC<CreateBoxSheetProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      pan.setValue({ x: 0, y: 0 });
    }
  }, [visible]);

  const handleSelectCategory = (category: BoxCategory) => {
    onClose();
    // Navigate to the dynamic creation page, passing the category type
    router.push({ pathname: '/boxes-create/[type]', params: { type: category } });
  };

  const categories = [
    {
      id: 'audio',
      title: 'Audio & Sound',
      subtitle: 'Music, Podcasts, and Voice Notes',
      icon: <Music size={18} color="#1DB954" />,
      color: '#1DB954'
    },
    {
      id: 'video',
      title: 'Video & Motion',
      subtitle: 'Movies, Series, and Short Clips',
      icon: <Play size={18} color="#E50914" />,
      color: '#E50914'
    },
    {
      id: 'marketplace',
      title: 'Marketplace & Trade',
      subtitle: 'Selling, Swapping, and Bidding',
      icon: <ShoppingBag size={18} color="#FF9900" />,
      color: '#FF9900'
    },
    {
      id: 'sports',
      title: 'Sports & Highlights',
      subtitle: 'Matches, Scores, and Brackets',
      icon: <Trophy size={18} color="#00529B" />,
      color: '#00529B'
    },
    {
      id: 'contest',
      title: 'Contests & Voting',
      subtitle: 'Competitions, Polls, and Ratings',
      icon: <FolderHeart size={18} color="#9C27B0" />,
      color: '#9C27B0'
    }
  ] as const;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <Animated.View style={[styles.container, { transform: [{ translateY: pan.y }] }]}>
          <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center' }}>
            <View style={styles.dragHandle} />
            <View style={styles.header}>
              <Text style={styles.headerTitle}>What kind of box are you building?</Text>
            </View>
          </View>
          
          <View style={styles.listContainer}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id}
                style={styles.optionRow}
                activeOpacity={0.7}
                onPress={() => handleSelectCategory(cat.id as BoxCategory)}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${cat.color}1A` }]}>
                  {cat.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{cat.title}</Text>
                  <Text style={styles.optionSubtitle}>{cat.subtitle}</Text>
                </View>
                <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
              </TouchableOpacity>
            ))}
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    width: '100%',
    backgroundColor: '#0D0D0D', // Match app background
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  optionSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
  },
});
