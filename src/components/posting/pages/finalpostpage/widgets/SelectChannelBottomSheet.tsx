import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, FlatList, TouchableWithoutFeedback, Animated, PanResponder, ActivityIndicator } from 'react-native';
import { colors } from '@/core/theme/colors';
import { Search, Check } from 'lucide-react-native';
import AppAvatar from '@/components/avatar/AppAvatar';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChannelListSkeleton } from '@/components/skeletons/Skeletons';

export interface ChannelData {
  id: string;
  name: string;
  avatarUrl: string;
}

interface SelectChannelBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedChannels: string[];
  onToggleChannel: (id: string) => void;
}

export const SelectChannelBottomSheet: React.FC<SelectChannelBottomSheetProps> = ({ 
  visible, 
  onClose, 
  selectedChannels, 
  onToggleChannel 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAuthStore(s => s.user);
  
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchChannels = async (isLoadMore = false) => {
    if (!user) return;
    if (loading || (!hasMore && isLoadMore)) return;
    setLoading(true);
    
    // Always calculate offset from the current true channels array size
    const offset = isLoadMore ? channels.length : 0;
    
    const { data, error } = await supabase.rpc('get_user_channels', {
      p_user_id: user.id,
      p_target_user_id: user.id,
      p_filter_type: 'joined',
      p_page_offset: offset,
      p_page_limit: limit
    });
    
    if (data && !error) {
       const fetched: ChannelData[] = data.map((c: any) => ({
         id: c.id,
         name: c.name,
         avatarUrl: c.avatar_url
       }));
       if (isLoadMore) {
         // Prevent duplicates if multiple loads triggered rapidly
         const newIds = new Set(fetched.map(f => f.id));
         const filteredPrev = channels.filter(p => !newIds.has(p.id));
         setChannels([...filteredPrev, ...fetched] as any);
       } else {
         setChannels(fetched);
       }
       if (fetched.length < limit) setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setHasMore(true);
      fetchChannels(false);
    }
  }, [visible]);

  const filteredChannels = React.useMemo(() => {
    if (!searchQuery.trim()) return channels;
    return channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [channels, searchQuery]);

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

  const renderItem = useCallback(({ item: channel }: { item: ChannelData }) => {
    const isSelected = selectedChannels.includes(channel.id);
    return (
      <TouchableOpacity 
        style={styles.channelRow} 
        activeOpacity={0.7}
        onPress={() => onToggleChannel(channel.id)}
      >
        <AppAvatar url={channel.avatarUrl} size={48} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.channelName}>{channel.name}</Text>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check color="#000" size={14} strokeWidth={4} />}
        </View>
      </TouchableOpacity>
    );
  }, [selectedChannels, onToggleChannel]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
          <Animated.View style={[styles.container, { transform: [{ translateY: pan.y }] }]}>
            <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center' }}>
              <View style={styles.dragHandle} />
              
              <View style={[styles.header, { width: '100%' }]}>
                <View style={{ width: 60 }} />
                <Text style={styles.headerTitle}>Select Channels</Text>
                <TouchableOpacity activeOpacity={1} onPress={onClose} style={[styles.headerBtn, { width: 60, alignItems: 'flex-end' }]}>
                  <Text style={styles.saveText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Search color="rgba(255,255,255,0.4)" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search channels..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                selectionColor="#FACD11"
              />
            </View>
            
            <FlatList
              data={filteredChannels}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.scroll}
              contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
              onEndReached={() => {
                if (!searchQuery.trim() && hasMore) {
                  fetchChannels(true);
                }
              }}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                loading ? (
                  <View style={{ paddingTop: 20 }}>
                    <ChannelListSkeleton count={5} />
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No channels found</Text>
                )
              }
              ListFooterComponent={
                loading && channels.length > 0 ? (
                  <View style={{ paddingTop: 10 }}>
                    <ChannelListSkeleton count={2} />
                  </View>
                ) : null
              }
            />
          </Animated.View>
        </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '100%',
    backgroundColor: '#000000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%', 
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerBtn: {
    paddingVertical: 4,
  },
  saveText: {
    color: '#FACD11',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFF',
    fontSize: 16,
  },
  scroll: {
    width: '100%',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  channelName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FACD11',
    borderColor: '#FACD11',
  },
});
