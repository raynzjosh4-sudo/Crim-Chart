import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Modal, ActivityIndicator, FlatList,
} from 'react-native';
import { X, DollarSign } from 'lucide-react-native';
import { GiftModel } from '../models/GiftModel';

interface GiftSheetProps {
  visible: boolean;
  themeColor?: string;
  recipientId?: string;
  onClose: (gift?: GiftModel) => void;
}

export const GiftSheet: React.FC<GiftSheetProps> = ({
  visible,
  themeColor = '#FACD11',
  recipientId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'free' | 'premium'>('free');
  // Dummy data for now, would be fetched via Supabase in real impl
  const [gifts] = useState<GiftModel[]>([
    { id: '1', name: 'Rose', coinPrice: 10, imageUrl: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', isAnimated: false },
    { id: '2', name: 'Crown', coinPrice: 500, imageUrl: 'https://cdn-icons-png.flaticon.com/512/694/694982.png', isAnimated: true },
  ]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => onClose()}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>SEND GIFT</Text>
            <TouchableOpacity onPress={() => onClose()}>
              <X color="rgba(255,255,255,0.7)" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TabBtn label="FREE" active={activeTab === 'free'} onSelect={() => setActiveTab('free')} color={themeColor} />
            <TabBtn label="PREMIUM" active={activeTab === 'premium'} onSelect={() => setActiveTab('premium')} color={themeColor} />
          </View>

          <FlatList
            data={gifts}
            keyExtractor={g => g.id}
            renderItem={({ item }) => (
              <View style={styles.giftRow}>
                <Image source={{ uri: item.imageUrl }} style={styles.giftIcon} />
                <View style={styles.giftInfo}>
                  <Text style={styles.giftName}>{item.name}</Text>
                  <View style={styles.priceRow}>
                    <DollarSign color="#FACD11" size={12} />
                    <Text style={styles.price}>{item.coinPrice}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.sendBtn, { backgroundColor: themeColor }]}
                  onPress={() => onClose(item)}
                >
                  <Text style={styles.sendText}>SEND</Text>
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingVertical: 16 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const TabBtn: React.FC<{ label: string; active: boolean; onSelect: () => void; color: string }> = ({ label, active, onSelect, color }) => (
  <TouchableOpacity style={[styles.tab, active && { borderBottomColor: color }]} onPress={onSelect}>
    <Text style={[styles.tabLabel, active && { color: '#FFF' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#121212', height: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  title: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1.2 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel: { color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: 13 },
  giftRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  giftIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#1A1A1A' },
  giftInfo: { flex: 1, marginLeft: 12 },
  giftName: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  price: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  sendBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  sendText: { color: '#000', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 68 },
});
