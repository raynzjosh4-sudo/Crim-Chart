import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { X, Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import countryList from 'country-list';

// Web-safe version of AppCountryPicker — no react-native-country-picker-modal dependency

export type Country = { name: string; cca2: string };

interface AppCountryPickerProps {
  visible: boolean;
  initialCountries?: Country[];
  onClose: () => void;
  onSelect: (countries: Country[]) => void;
}

export const AppCountryPicker: React.FC<AppCountryPickerProps> = ({ visible, initialCountries = [], onClose, onSelect }) => {
  const [selected, setSelected] = useState<Country[]>(initialCountries);
  const [search, setSearch] = useState('');
  const [allCountries, setAllCountries] = useState<Country[]>([]);

  useEffect(() => {
    const data = countryList.getData() as { code: string; name: string }[];
    data.sort((a, b) => a.name.localeCompare(b.name));
    setAllCountries(data.map(c => ({ name: c.name, cca2: c.code })));
  }, []);

  useEffect(() => {
    if (visible) {
      setSelected(initialCountries);
      setSearch('');
    }
  }, [visible, initialCountries]);

  const filtered = allCountries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCountry = (country: Country) => {
    const exists = selected.find(c => c.cca2 === country.cca2);
    if (exists) {
      setSelected(selected.filter(c => c.cca2 !== country.cca2));
    } else {
      setSelected([...selected, country]);
    }
  };

  const removeCountry = (cca2: string) => {
    setSelected(selected.filter(c => c.cca2 !== cca2));
  };

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const pickerContent = (
    <>
      <ChartAppBar
        title="Select Country"
        showBack
        onBack={onClose}
        actions={[
          <TouchableOpacity activeOpacity={0.7} key="done" onPress={() => onSelect(selected)} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        ]}
      />

      {selected.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer} contentContainerStyle={styles.chipsScroll}>
          {selected.map(country => (
            <View key={country.cca2} style={styles.chip}>
              <Text style={styles.chipText}>{country.name}</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => removeCountry(country.cca2)} style={styles.chipRemove}>
                <X size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search countries..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.list}>
        {filtered.map(country => {
          const isSelected = !!selected.find(c => c.cca2 === country.cca2);
          return (
            <TouchableOpacity
              key={country.cca2}
              activeOpacity={0.7}
              style={styles.row}
              onPress={() => toggleCountry(country)}
            >
              <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>{country.name}</Text>
              {isSelected && <Check size={18} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={isDesktop}
      presentationStyle={isDesktop ? 'overFullScreen' : 'pageSheet'}
    >
      {isDesktop ? (
        <TouchableOpacity activeOpacity={1} style={styles.desktopContainer} onPress={onClose}>
          <TouchableOpacity activeOpacity={1} style={styles.desktopCard} onPress={(e) => e.stopPropagation()}>
            {pickerContent}
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <SafeAreaView style={styles.container}>
          {pickerContent}
        </SafeAreaView>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  doneButton: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 8,
  },
  doneText: { color: '#FFD700', fontWeight: '800', fontSize: 14 },
  chipsContainer: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  chipsScroll: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8,
  },
  chipText: { color: '#FFF', fontSize: 13, fontWeight: '600', marginRight: 6 },
  chipRemove: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 2 },
  searchBox: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, paddingHorizontal: 16, height: 44,
    color: '#FFF', fontSize: 15,
  },
  list: { flex: 1 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rowText: { color: '#FFF', fontSize: 15 },
  rowTextSelected: { color: colors.primary, fontWeight: '700' },
  desktopContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  desktopCard: {
    width: 600, height: '80%', maxHeight: 700,
    backgroundColor: colors.background, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
});
