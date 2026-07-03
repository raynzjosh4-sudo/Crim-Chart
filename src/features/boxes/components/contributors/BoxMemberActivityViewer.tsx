import UserAvatar from '@/components/avatar/UserAvatar';
import { InteractionItemWidget } from '@/components/widgets/InteractionItemWidget';
import { supabase } from '@/core/supabase/supabaseConfig';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityShimmer, PaginationShimmer } from '@/components/shimmers/ActivityShimmer';

// Simple module-level cache to keep data in memory
const activityCache: Record<string, InteractionRecord[]> = {};

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
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  useEffect(() => {
    if (!visible || !userId || !boxId) return;

    const cacheKey = `${boxId}-${userId}`;

    const fetchInteractions = async () => {
      // If we don't have cache, show loading shimmer
      if (!activityCache[cacheKey]) {
        setLoading(true);
      } else {
        // Load from memory instantly
        setInteractions(activityCache[cacheKey]);
      }

      try {
        // Query box_item_reactions joined with box_items to only get reactions for THIS specific box
        const { data, error } = await supabase
          .from('box_item_reactions')
          .select(`
            id,
            reaction_type,
            created_at,
            box_item_id,
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

        if (!data || data.length === 0) {
          console.log(`[DEBUG] BoxMemberActivityViewer: No interactions found for user ${userId} in box ${boxId}`);
          setInteractions([]);
          activityCache[cacheKey] = [];
          return;
        }

        console.log(`[DEBUG] BoxMemberActivityViewer: Fetched ${data.length} interactions for user ${userId} in box ${boxId}:`, JSON.stringify(data, null, 2));

        // Cache the fresh data and update UI
        activityCache[cacheKey] = data;
        setInteractions(data);
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
      animationType={isDesktop ? "fade" : "slide"}
      transparent={isDesktop}
      onRequestClose={onClose}
    >
      <View style={[styles.modalBackground, isDesktop && { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }]}>
        <SafeAreaView style={isDesktop ? styles.desktopModal : styles.container} edges={['top', 'bottom']}>

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
                <Text style={styles.subtitle}>Recent Reactions</Text>
              </View>
            </View>

            <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.closeBtn}>
              <X size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Body - List of Interactions */}
          {loading ? (
            <ActivityShimmer />
          ) : interactions.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>No recent activity</Text>
            </View>
          ) : (
            <FlatList
              data={interactions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                let detailsText = `Performed a ${item.reaction_type} action`;
                if (item.reaction_type === 'like') detailsText = 'Reacted with a like';
                if (item.reaction_type === 'comment') detailsText = 'Reacted with a comment';
                if (item.reaction_type === 'tag') detailsText = 'Reacted with a tag';
                if (item.reaction_type === 'view') detailsText = 'Viewed some posts';

                return (
                  <InteractionItemWidget
                    interactionType={item.reaction_type}
                    timestamp={item.created_at}
                    details={item.details || detailsText}
                  />
                );
              }}
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
  desktopModal: {
    width: '100%',
    maxWidth: 600,
    height: '90%',
    maxHeight: 800,
    backgroundColor: '#0D0D0D',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
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
