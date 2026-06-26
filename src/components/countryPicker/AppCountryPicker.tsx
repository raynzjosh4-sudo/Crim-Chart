import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import CountryPicker, { Country, DARK_THEME } from 'react-native-country-picker-modal';

interface AppCountryPickerProps {
  visible: boolean;
  initialCountries?: Country[];
  onClose: () => void;
  onSelect: (countries: Country[]) => void;
}

export const AppCountryPicker: React.FC<AppCountryPickerProps> = ({ visible, initialCountries = [], onClose, onSelect }) => {
  const [selected, setSelected] = useState<Country[]>(initialCountries);

  useEffect(() => {
    if (visible) {
      setSelected(initialCountries);
    }
  }, [visible, initialCountries]);

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
  const isDesktop = Platform.OS === 'web' && width >= 768;

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
        <View style={styles.chipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {selected.map(country => (
              <View key={country.cca2} style={styles.chip}>
                <Text style={styles.chipText}>{(country.name as any)?.en || country.name}</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => removeCountry(country.cca2)} style={styles.chipRemove}>
                  <X size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.content}>
        <CountryPicker
          countryCode={'US'}
          withModal={false}
          withFilter
          withFlag
          withCountryNameButton={false}
          withAlphaFilter
          withCallingCode={false}
          onSelect={toggleCountry}
          theme={{
            ...DARK_THEME,
            backgroundColor: colors.background,
            primaryColorVariant: '#333',
          }}
          containerButtonStyle={styles.hiddenButton}
        />
      </View>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 8,
  },
  doneText: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 14,
  },
  chipsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  chipRemove: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  hiddenButton: {
    display: 'none',
  },
  desktopContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
