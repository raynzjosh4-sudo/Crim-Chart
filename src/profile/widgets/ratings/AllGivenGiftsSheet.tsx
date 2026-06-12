import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { GiftAggregation } from './GiftAggregationModels';

interface AllGivenGiftsSheetProps {
  visible: boolean;
  aggregations: GiftAggregation[];
  onClose: () => void;
}

export const AllGivenGiftsSheet: React.FC<AllGivenGiftsSheetProps> = ({
  visible,
  aggregations,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>All Gifts Received</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="rgba(255,255,255,0.54)" size={24} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={aggregations}
            keyExtractor={item => item.giftId}
            renderItem={({ item }) => (
              <View style={styles.row}>
                {item.giftImageUrl ? (
                  <Image source={{ uri: item.giftImageUrl }} style={styles.icon} />
                ) : (
                  <Text style={styles.iconPlaceholder}>🎁</Text>
                )}
                <View style={styles.info}>
                  <Text style={styles.giftName}>{item.giftName}</Text>
                  <Text style={styles.giftSub}>×{item.totalReceived} — {item.totalValue} coins</Text>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  icon: { width: 44, height: 44, borderRadius: 8, marginRight: 12, backgroundColor: '#2A2A2A' },
  iconPlaceholder: { fontSize: 32, marginRight: 12 },
  info: { flex: 1 },
  giftName: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  giftSub: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 },
});
