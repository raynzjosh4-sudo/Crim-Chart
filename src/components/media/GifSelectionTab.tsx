import { useStyles } from "@/core/hooks/useStyles";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, LayoutAnimation } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Search, X, ChevronUp, ChevronDown, Check } from 'lucide-react-native';
import { MediaData, MediaType } from '@/components/media/types';
import { colors } from '@/core/theme/colors';
interface GifSelectionTabProps {
  selectedIndices: number[];
  onMediaTap: (index: number, item: MediaData) => void;
}
const CATEGORIES = ['Trending', 'Reaction', 'Dance', 'Celebrate', 'Funny', 'Sports'];
const DUMMY_GIFS = Array.from({
  length: 6
}, (_, i) => ({
  id: i,
  url: `https://picsum.photos/seed/gif${i}/400/400`
}));
export default function GifSelectionTab({
  selectedIndices,
  onMediaTap
}: GifSelectionTabProps) {
  const styles = useStyles(colors => ({
    container: {
      flex: 1
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      justifyContent: 'flex-end'
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginRight: 8
    },
    searchIcon: {
      padding: 8
    },
    categoriesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8
    },
    categoriesTitle: {
      fontWeight: 'bold',
      fontSize: 14
    },
    categoryScroll: {
      maxHeight: 40
    },
    categoryList: {
      paddingHorizontal: 16,
      gap: 8
    },
    categoryChip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8
    },
    categoryChipText: {
      fontSize: 12
    },
    gridContent: {
      padding: 16,
      gap: 8
    },
    gifCell: {
      flex: 1 / 2,
      aspectRatio: 1,
      margin: 4,
      borderRadius: 12,
      overflow: 'hidden'
    },
    selectedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center'
    }
  }));
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const toggleCategories = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCategoriesExpanded(prev => !prev);
  };
  const toggleSearch = (expand: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchExpanded(expand);
    if (!expand) setSearchText('');
  };
  return <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        {isSearchExpanded ? <TextInput style={[styles.searchInput, {
        color: colors.text,
        backgroundColor: 'rgba(255,255,255,0.05)'
      }]} placeholder="Search GIFs..." placeholderTextColor="rgba(255,255,255,0.4)" value={searchText} onChangeText={setSearchText} autoFocus /> : null}
        <TouchableOpacity activeOpacity={1} onPress={() => toggleSearch(!isSearchExpanded)} style={styles.searchIcon}>
          {isSearchExpanded ? <X color={colors.text} size={16} /> : <Search color={colors.text} size={20} />}
        </TouchableOpacity>
      </View>

      {/* Categories Toggle Header */}
      <TouchableOpacity activeOpacity={1} style={styles.categoriesHeader} onPress={toggleCategories}>
        <Text style={[styles.categoriesTitle, {
        color: colors.text
      }]}>Categories</Text>
        {isCategoriesExpanded ? <ChevronUp color="rgba(255,255,255,0.6)" size={20} /> : <ChevronDown color="rgba(255,255,255,0.6)" size={20} />}
      </TouchableOpacity>

      {/* Category Chips */}
      {isCategoriesExpanded && <FlatList horizontal data={CATEGORIES} keyExtractor={item => item} contentContainerStyle={styles.categoryList} style={styles.categoryScroll} showsHorizontalScrollIndicator={false} renderItem={({
      item
    }) => <View style={[styles.categoryChip, {
      backgroundColor: 'rgba(255,255,255,0.08)'
    }]}>
              <Text style={[styles.categoryChipText, {
        color: colors.text
      }]}>{item}</Text>
            </View>} />}

      {/* GIF Grid */}
      <FlatList data={DUMMY_GIFS} numColumns={2} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.gridContent} renderItem={({
      item,
      index
    }) => {
      const isSelected = selectedIndices.includes(index);
      return <TouchableOpacity activeOpacity={1} style={[styles.gifCell, {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: colors.primary
      }, isSelected && {
        borderWidth: 3
      }]} onPress={() => {
        onMediaTap(index, {
          type: MediaType.image,
          contentUrl: item.url
        });
      }} activeOpacity={0.8}>
              <ExpoImage source={{
          uri: item.url
        }} contentFit="cover" style={StyleSheet.absoluteFill} />
              {isSelected && <View style={[styles.selectedBadge, {
          backgroundColor: colors.primary
        }]}>
                  <Check color="black" size={16} />
                </View>}
            </TouchableOpacity>;
    }} />
    </View>;
}