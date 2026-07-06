import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { Modal, StyleSheet, View, SafeAreaView, Text, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { Check } from 'lucide-react-native';
export type AgeRestrictionType = 'All Ages' | '13+' | '16+' | '18+' | '21+';
interface AppAgeRestrictionPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedAge: AgeRestrictionType;
  onSelect: (age: AgeRestrictionType) => void;
}
const AGE_OPTIONS: AgeRestrictionType[] = ['All Ages', '13+', '16+', '18+', '21+'];
export const AppAgeRestrictionPicker: React.FC<AppAgeRestrictionPickerProps> = ({
  visible,
  onClose,
  selectedAge,
  onSelect
}) => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 16
    },
    description: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 14,
      marginBottom: 24,
      lineHeight: 20
    },
    optionsContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)'
    },
    optionRowSelected: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    optionText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500'
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: 'bold'
    },
    desktopContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    desktopCard: {
      width: 320,
      height: 'auto',
      maxHeight: 500,
      backgroundColor: colors.background,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 10
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      paddingBottom: 16
    }
  }));
  const {
    width
  } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={isDesktop} presentationStyle={isDesktop ? "overFullScreen" : "pageSheet"}>
      {isDesktop ? <TouchableOpacity activeOpacity={1} style={styles.desktopContainer} onPress={onClose}>
          <TouchableOpacity activeOpacity={1} style={styles.desktopCard} onPress={e => e.stopPropagation()}>
            <ChartAppBar title="Age Restriction" showBack onBack={onClose} />
            <ScrollView style={styles.content}>
              <Text style={styles.description}>
                Select the minimum age required to view this content.
              </Text>
              
              <View style={styles.optionsContainer}>
                {AGE_OPTIONS.map(age => {
              const isSelected = selectedAge === age;
              return <TouchableOpacity activeOpacity={1} key={age} style={[styles.optionRow, isSelected && styles.optionRowSelected]} onPress={() => {
                onSelect(age);
                onClose();
              }}>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {age}
                      </Text>
                      {isSelected && <Check size={20} color={colors.primary} />}
                    </TouchableOpacity>;
            })}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity> : <SafeAreaView style={styles.container}>
          <ChartAppBar title="Age Restriction" showBack onBack={onClose} />
          <ScrollView style={styles.content}>
            <Text style={styles.description}>
              Select the minimum age required to view this content.
            </Text>
            
            <View style={styles.optionsContainer}>
              {AGE_OPTIONS.map(age => {
            const isSelected = selectedAge === age;
            return <TouchableOpacity activeOpacity={1} key={age} style={[styles.optionRow, isSelected && styles.optionRowSelected]} onPress={() => {
              onSelect(age);
              onClose();
            }}>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {age}
                    </Text>
                    {isSelected && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>;
          })}
            </View>
          </ScrollView>
        </SafeAreaView>}
    </Modal>;
};