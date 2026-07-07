import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { X, Trash2 } from 'lucide-react-native';
import { useDraftStore, Draft } from '@/core/store/useDraftStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';

interface DraftsListModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDraft: (draft: Draft) => void;
}

export const DraftsListModal: React.FC<DraftsListModalProps> = ({ visible, onClose, onSelectDraft }) => {
  const theme = useCurrentTheme();
  const { drafts, loadDrafts, deleteDraft } = useDraftStore();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    if (visible) {
      loadDrafts();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }, isMobile && styles.modalMobile]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Your Drafts</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list}>
            {drafts.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.text + '80' }]}>No drafts saved yet.</Text>
            ) : (
              drafts.map(draft => (
                <View key={draft.id} style={[styles.draftItem, { borderBottomColor: theme.colors.border }]}>
                  <TouchableOpacity style={styles.draftContent} onPress={() => onSelectDraft(draft)}>
                    <Text style={[styles.draftDate, { color: theme.colors.primary }]}>
                      {new Date(draft.created_at).toLocaleString()}
                    </Text>
                    <Text style={[styles.draftPreview, { color: theme.colors.text }]} numberOfLines={2}>
                      {draft.text || (draft.media?.length ? `[Media: ${draft.media.length} items]` : 'Empty draft')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteDraft(draft.id)}>
                    <Trash2 size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    height: '70%',
    maxHeight: 600,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalMobile: {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  draftItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  draftContent: {
    flex: 1,
  },
  draftDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  draftPreview: {
    fontSize: 15,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 12,
    marginLeft: 8,
  },
});
