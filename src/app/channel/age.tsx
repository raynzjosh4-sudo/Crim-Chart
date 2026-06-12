import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useRouter } from 'expo-router';
import { useChannelCreationController } from '@/channel/application/useChannelCreationController';
import { Check } from 'lucide-react-native';

export default function AgeSelectionPage() {
  const { colors } = useTheme();
  const router = useRouter();

  const draftAge = useChannelCreationController(state => state.draftAge);
  const setDraftAge = useChannelCreationController(state => state.setDraftAge);

  const ages = useMemo(() => {
    const list = ['All Ages'];
    for (let i = 10; i <= 80; i += 5) {
      list.push(`${i}+`);
    }
    return list;
  }, []);

  const handleSelect = (age: string) => {
    setDraftAge(age);
    router.back();
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = draftAge === item;
    return (
      <TouchableOpacity 
        style={styles.item} 
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemText, { color: isSelected ? '#FACD11' : colors.text, fontWeight: isSelected ? 'bold' : 'normal' }]}>
          {item}
        </Text>
        {isSelected && <Check color="#FACD11" size={20} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar 
        title="Select Age Restrictions" 
        showBack={true} 
        centerTitle={true} 
      />
      
      <View style={styles.content}>
        <FlatList
          data={ages}
          keyExtractor={(item) => item}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemText: {
    fontSize: 16,
  },
});
