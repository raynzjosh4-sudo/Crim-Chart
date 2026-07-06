import { useStyles } from "@/core/hooks/useStyles";
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { MUSIC_CATEGORIES } from '@/core/constants/musicCategories';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
interface CategoryPickerWidgetProps {
  onSelectCategory: (id: string) => void;
}
export const CategoryPickerWidget = ({
  onSelectCategory
}: CategoryPickerWidgetProps) => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold'
    },
    doneBtn: {
      padding: 8
    },
    doneText: {
      fontWeight: 'bold',
      fontSize: 16
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 16,
      height: 44
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      marginLeft: 8,
      fontSize: 16
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 4
    },
    itemLabel: {
      fontSize: 16
    }
  }));
  const theme = useCurrentTheme();
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return MUSIC_CATEGORIES;
    return MUSIC_CATEGORIES.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);
  return <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, {
        color: theme.colors.text
      }]}>Select Category</Text>
      </View>

      <View style={[styles.searchContainer, {
      backgroundColor: theme.colors.text + '15'
    }]}>
        <Search color={theme.colors.text + '80'} size={20} />
        <TextInput style={[styles.searchInput, {
        color: theme.colors.text
      }, Platform.OS === 'web' ? {
        outlineStyle: 'none' as any
      } : {}]} placeholder="Search categories..." placeholderTextColor={theme.colors.text + '80'} value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <FlatList data={filteredCategories} keyExtractor={item => item.id} showsVerticalScrollIndicator={false} renderItem={({
      item
    }) => {
      return <TouchableOpacity style={[styles.item, {
        backgroundColor: 'transparent'
      }]} onPress={async () => {
        startLoading();
        await new Promise(r => setTimeout(r, 400));
        stopLoading();
        onSelectCategory(item.id);
      }} activeOpacity={0.7}>
              <Text style={[styles.itemLabel, {
          color: theme.colors.text
        }]}>
                {item.label}
              </Text>
            </TouchableOpacity>;
    }} />
    </View>;
};