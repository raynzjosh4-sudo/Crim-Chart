import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useRouter } from 'expo-router';
import { useChannelCreationController } from '@/channel/application/useChannelCreationController';
import countryList from 'country-list';
import { Check } from 'lucide-react-native';

export default function CountrySelectionPage() {
  const { colors } = useTheme();
  const router = useRouter();

  const draftCountries = useChannelCreationController(state => state.draftCountries);
  const setDraftCountries = useChannelCreationController(state => state.setDraftCountries);

  const [selected, setSelected] = useState<string[]>(draftCountries);
  const [countries, setCountries] = useState<{name: string, code: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // countryList.getData() returns [{code: 'US', name: 'United States'}, ...]
    const allCountries = countryList.getData();
    // sort alphabetically
    allCountries.sort((a, b) => a.name.localeCompare(b.name));
    setCountries(allCountries);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (countryName: string) => {
    if (countryName === 'Global') {
      setSelected(['Global']);
    } else {
      let newSelected = selected.filter(c => c !== 'Global');
      if (newSelected.includes(countryName)) {
        newSelected = newSelected.filter(c => c !== countryName);
        if (newSelected.length === 0) newSelected = ['Global'];
      } else {
        newSelected.push(countryName);
      }
      setSelected(newSelected);
    }
  };

  const handleSave = () => {
    setDraftCountries(selected);
    router.back();
  };

  const renderItem = ({ item }: { item: {name: string, code: string} }) => {
    const isSelected = selected.includes(item.name);
    return (
      <TouchableOpacity activeOpacity={1} 
        style={styles.item} 
        onPress={() => handleSelect(item.name)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
        {isSelected && <Check color="#FACD11" size={20} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar 
        title="Country Restrictions" 
        showBack={true} 
        centerTitle={true}
        onBack={handleSave} 
      />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search countries..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity activeOpacity={1} 
          style={styles.item} 
          onPress={() => handleSelect('Global')}
          activeOpacity={0.7}
        >
          <Text style={[styles.itemText, { color: '#FACD11', fontWeight: 'bold' }]}>Global (All Countries)</Text>
          {selected.includes('Global') && <Check color="#FACD11" size={20} />}
        </TouchableOpacity>
        
        <View style={styles.divider} />

        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          initialNumToRender={20}
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
  divider: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 15,
  },
});
