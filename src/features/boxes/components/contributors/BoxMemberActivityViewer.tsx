import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
import UserAvatar from '@/components/avatar/UserAvatar';
import { InteractionItemWidget } from '@/components/widgets/InteractionItemWidget';

interface BoxMemberActivityViewerProps {
  userId: string;
  userName: string;
  userAvatarUrl: string;
  boxId: string;
  visible: boolean;
  onClose: () => void;
}

interface InteractionRecord {
  id: string;
  reaction_type: string;
  created_at: string;
}

export const BoxMemberActivityViewer: React.FC<BoxMemberActivityViewerProps> = ({ 
  userId, 
  userName, 
  userAvatarUrl, 
  boxId,
  visible, 
  onClose 
}) => {
  const [interactions, setInteractions] = useState<InteractionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !userId || !boxId) return;

    const fetchInteractions = async () => {
      setLoading(true);
      try {
        // Query box_item_reactions joined with box_items to only get reactions for THIS specific box
        const { data, error } = await supabase
          .from('box_item_reactions')
          .select(`
            id,
            reaction_type,
            created_at,
            box_items!inner(box_id)
          `)
          .eq('user_id', userId)
          .eq('box_items.box_id', boxId)
          .order('created_at', { ascending: false })
          .limit(50); // Get latest 50 interactions

        if (error) {
          console.error('[BoxMemberActivityViewer] Error fetching interactions:', error);
          return;
        }

        setInteractions(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [visible, userId, boxId]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          
          {/* Header - Looks like a Status Viewer Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <UserAvatar 
              userId={userId}
              fallbackUrl={userAvatarUrl}
              name={userName}
              size={40}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.subtitle}>Recent Activity in Box</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Body - List of Interactions */}
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FFC400" />
          </View>
        ) : interactions.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        ) : (
          <FlatList
            data={interactions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <InteractionItemWidget
                interactionType={item.reaction_type}
                timestamp={item.created_at}
                details={`Performed a ${item.reaction_type} action`}
              />
            )}
          />
        )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 12,
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  }
});
