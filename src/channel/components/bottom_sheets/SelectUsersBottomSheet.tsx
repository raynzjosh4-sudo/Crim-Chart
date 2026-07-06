import { useStyles } from "@/core/hooks/useStyles";
import AppAvatar from '@/components/avatar/AppAvatar';
import { supabase } from '@/core/supabase/supabaseConfig';
import { Check, Search } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, KeyboardAvoidingView, Modal, PanResponder, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SendRequestButton } from '@/channel/components/buttons/SendRequestButton';
import { UserListSkeleton } from '@/components/skeletons/Skeletons';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.98;
const SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.6;
const OFFSET = SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT;
export interface UserData {
  id: string;
  name: string;
  avatarUrl: string;
}
interface SelectUsersBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSendRequest: (userId: string) => Promise<void>;
}
export const SelectUsersBottomSheet: React.FC<SelectUsersBottomSheetProps> = ({
  visible,
  onClose,
  title,
  onSendRequest
}) => {
  const styles = useStyles(colors => ({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    container: {
      width: '100%',
      height: SHEET_MAX_HEIGHT,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24
    },
    dragHandle: {
      width: 36,
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 8
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 8
    },
    headerTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700'
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#111111',
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48
    },
    searchInput: {
      flex: 1,
      marginLeft: 12,
      color: colors.text,
      fontSize: 16
    },
    scroll: {
      width: '100%'
    },
    emptyText: {
      color: 'rgba(255,255,255,0.4)',
      textAlign: 'center',
      marginTop: 32,
      fontSize: 15
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8
    },
    infoContainer: {
      flex: 1,
      marginLeft: 16
    },
    userName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600'
    }
  }));
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase.from('profiles').select('id, display_name, profile_image_url').limit(20);
      if (searchQuery.trim()) {
        query = query.ilike('display_name', `%${searchQuery.trim()}%`);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      if (data) {
        const realUsers: UserData[] = data.map(d => ({
          id: d.id,
          name: d.display_name || 'Unknown',
          avatarUrl: d.profile_image_url || 'https://i.pravatar.cc/150'
        }));
        setUsers(realUsers);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      fetchUsers();
    }
  }, [visible]);
  useEffect(() => {
    if (visible) {
      const delay = setTimeout(() => fetchUsers(), 300);
      return () => clearTimeout(delay);
    }
  }, [searchQuery]);
  const pan = useRef(new Animated.ValueXY({
    x: 0,
    y: OFFSET
  })).current;
  const currentY = useRef(OFFSET);
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      let newY = currentY.current + gestureState.dy;
      if (newY < 0) newY = 0; // Don't drag above max height
      pan.setValue({
        x: 0,
        y: newY
      });
    },
    onPanResponderRelease: (e, gestureState) => {
      const newY = currentY.current + gestureState.dy;
      if (newY > OFFSET + 100 || gestureState.vy > 1.5) {
        // Close
        onClose();
      } else if (newY < OFFSET / 2 || gestureState.vy < -0.5) {
        // Snap to top
        Animated.spring(pan, {
          toValue: {
            x: 0,
            y: 0
          },
          useNativeDriver: false
        }).start();
        currentY.current = 0;
      } else {
        // Snap back to min height
        Animated.spring(pan, {
          toValue: {
            x: 0,
            y: OFFSET
          },
          useNativeDriver: false
        }).start();
        currentY.current = OFFSET;
      }
    }
  })).current;
  useEffect(() => {
    if (visible) {
      pan.setValue({
        x: 0,
        y: OFFSET
      });
      currentY.current = OFFSET;
    }
  }, [visible]);
  const renderItem = useCallback(({
    item: user
  }: {
    item: UserData;
  }) => {
    return <View style={styles.userRow}>
        <AppAvatar url={user.avatarUrl} size={48} />
        <View style={styles.infoContainer}>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
        <SendRequestButton onPress={() => onSendRequest(user.id)} />
      </View>;
  }, [onSendRequest]);
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{
        width: '100%',
        alignItems: 'center'
      }}>
          <Animated.View style={[styles.container, {
          transform: [{
            translateY: pan.y
          }]
        }]}>
            <View {...panResponder.panHandlers} style={{
            width: '100%',
            alignItems: 'center'
          }}>
              <View style={styles.dragHandle} />

              <View style={[styles.header, {
              width: '100%'
            }]}>
                <View style={{
                width: 60
              }} />
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{
                width: 60
              }} />
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Search color="rgba(255,255,255,0.4)" size={20} />
              <TextInput style={styles.searchInput} placeholder="Search users..." placeholderTextColor="rgba(255,255,255,0.4)" value={searchQuery} onChangeText={setSearchQuery} selectionColor="#FACD11" />
            </View>

            <FlatList data={users} renderItem={renderItem} keyExtractor={item => item.id} style={styles.scroll} contentContainerStyle={{
            paddingBottom: Math.max(40, insets.bottom + 20),
            paddingHorizontal: 20
          }} ListEmptyComponent={loading ? <UserListSkeleton count={5} /> : <Text style={styles.emptyText}>No users found</Text>} />
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>;
};