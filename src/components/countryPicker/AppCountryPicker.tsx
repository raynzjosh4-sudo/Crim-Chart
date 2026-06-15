import React from 'react';
import { Modal, StyleSheet, View, SafeAreaView } from 'react-native';
import CountryPicker, { Country, DARK_THEME } from 'react-native-country-picker-modal';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';

interface AppCountryPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
}

export const AppCountryPicker: React.FC<AppCountryPickerProps> = ({ visible, onClose, onSelect }) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <ChartAppBar 
          title="Select Country" 
          showBack 
          onBack={onClose} 
        />
        <View style={styles.content}>
          <CountryPicker
            countryCode={'US'}
            withModal={false} // Renders inline inside our own wrapper instead of using its default modal
            withFilter // This adds the search bar natively!
            withFlag
            withCountryNameButton={false}
            withAlphaFilter
            withCallingCode={false}
            onSelect={(country) => {
              onSelect(country);
            }}
            theme={{ 
              ...DARK_THEME, 
              backgroundColor: colors.background,
              primaryColorVariant: '#333',
            }}
            containerButtonStyle={styles.hiddenButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  hiddenButton: {
    display: 'none',
  },
});
