import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { Check, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import countryList from 'country-list';

export type Country = { name: string; cca2: string };

interface AppCountryPickerProps {
  visible: boolean;
  initialCountries?: Country[];
  onClose: () => void;
  onSelect: (countries: Country[]) => void;
}

export const AppCountryPicker: React.FC<AppCountryPickerProps> = ({
  visible,
  initialCountries = [],
  onClose,
  onSelect,
}) => {
  const [selected, setSelected] = useState<Country[]>(initialCountries);
  const [search, setSearch] = useState('');

  // Load and sort country list once — never causes a freeze because it's just data
  const allCountries = useMemo<Country[]>(() => {
    const data = countryList.getData() as Array<{ code: string; name: string }>;
    data.sort((a, b) => a.name.localeCompare(b.name));
    return data.map((c: { code: string; name: string }) => ({ name: c.name, cca2: c.code }));
  }, []);

  useEffect(() => {
    if (visible) {
      setSelected(initialCountries);
      setSearch('');
    }
  }, [visible]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? allCountries.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase())
          )
        : allCountries,
    [allCountries, search]
  );

  const toggleCountry = (country: Country) => {
    const exists = selected.find((c: Country) => c.cca2 === country.cca2);
    if (exists) {
      setSelected(selected.filter((c: Country) => c.cca2 !== country.cca2));
    } else {
      setSelected([...selected, country]);
    }
  };

  const removeCountry = (cca2: string) => {
    setSelected(selected.filter((c: Country) => c.cca2 !== cca2));
  };

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const ITEM_HEIGHT = 50;

  const renderItem = ({ item }: { item: Country }) => {
    const isChecked = !!selected.find((c: Country) => c.cca2 === item.cca2);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.row}
        onPress={() => toggleCountry(item)}
      >
        <Text style={[styles.rowText, isChecked && styles.rowTextSelected]}>
          {item.name}
        </Text>
        {isChecked && <Check size={18} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  const pickerContent = (
    <>
      <ChartAppBar
        title="Select Country"
        showBack
        onBack={onClose}
        actions={[
          <TouchableOpacity
            activeOpacity={0.7}
            key="done"
            onPress={() => onSelect(selected)}
            style={styles.doneButton}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>,
        ]}
      />

      {selected.length > 0 && (
        <View style={styles.chipsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={selected}
            keyExtractor={c => c.cca2}
            contentContainerStyle={styles.chipsScroll}
            renderItem={({ item }) => (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{item.name}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => removeCountry(item.cca2)}
                  style={styles.chipRemove}
                >
                  <X size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search countries..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={search}
          onChangeText={setSearch}
          {...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {})}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.cca2}
        renderItem={renderItem}
        initialNumToRender={25}
        maxToRenderPerBatch={25}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
      />
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
        <TouchableOpacity
          activeOpacity={1}
          style={styles.desktopContainer}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.desktopCard}
            onPress={e => e.stopPropagation()}
          >
            {pickerContent}
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <SafeAreaView style={styles.container}>{pickerContent}</SafeAreaView>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 8,
  },
  doneText: { color: '#FFD700', fontWeight: '800', fontSize: 14 },
  chipsContainer: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  chipsScroll: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: { color: '#FFF', fontSize: 13, fontWeight: '600', marginRight: 6 },
  chipRemove: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 2,
  },
  searchBox: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    color: '#FFF',
    fontSize: 15,
  },
  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    height: 50,
  },
  rowText: { color: '#FFF', fontSize: 15 },
  rowTextSelected: { color: colors.primary, fontWeight: '700' },
  desktopContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  desktopCard: {
    width: 600,
    height: '80%',
    maxHeight: 700,
    backgroundColor: colors.background,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
