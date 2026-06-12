import { useRouter } from 'expo-router';
import { ImagePlus, Plus, Send, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CrownModel } from './models/CrownModel';
import { CrownMediaType, CrownOptionModel } from './models/CrownOptionModel';
import { CrownPollCard } from './widgets/CrownPollCard';
import { ExpandableCrownText } from './widgets/ExpandableCrownText';

interface DynamicCrownWidgetProps {
  pollModel: CrownModel;
  themeColor: string;
  fullBleed?: boolean;
}

export const DynamicCrownWidget: React.FC<DynamicCrownWidgetProps> = ({
  pollModel,
  themeColor,
  fullBleed = true,
}) => {
  const router = useRouter();
  const [options, setOptions] = useState<CrownOptionModel[]>(pollModel.options);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');

  const handleCrown = (optionId: string) => {
    setOptions(prevOptions => {
      const newOptions = prevOptions.map(opt => {
        if (opt.isMe && opt.id !== optionId) {
          return opt.copyWith({ crowns: Math.max(0, opt.crowns - 1), isMe: false });
        }
        if (opt.id === optionId) {
          return opt.copyWith({ crowns: opt.crowns + 1, isMe: true });
        }
        return opt;
      });
      return newOptions;
    });
  };

  const submitNewOption = () => {
    const text = newOptionText.trim();
    if (!text) return;

    const newOption = new CrownOptionModel({
      id: Date.now().toString(),
      description: text,
      mediaType: CrownMediaType.none,
      crowns: 1,
      isMe: true,
    });

    setOptions([newOption, ...options]);
    setNewOptionText('');
    setIsAddingOption(false);
  };

  return (
    <View style={styles.container}>
      {/* THE CROWN POLL TITLE */}
      <View style={styles.titleContainer}>
        <ExpandableCrownText
          text={pollModel.title}
          style={styles.titleText}
        />
      </View>

      {/* THE HORIZONTAL CARDS */}
      <View style={[styles.listContainer, fullBleed && styles.fullBleed]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {options.map((option) => (
            <View key={option.id} style={styles.cardWrapper}>
              <CrownPollCard
                option={option}
                themeColor={themeColor}
                onTap={() => {
                  // Pass option data via router or store, for now navigate to detail
                  router.push({
                    pathname: '/(app)/crown-detail' as any,
                    params: { pollId: pollModel.id, optionId: option.id, themeColor }
                  });
                }}
              />
            </View>
          ))}

          {/* ADD OPTION CARD / BUTTON AT THE END */}
          <TouchableOpacity
            style={[
              styles.addCard,
              {
                backgroundColor: `${themeColor}1A`, // 0.1 alpha
                borderColor: `${themeColor}4D`, // 0.3 alpha
              }
            ]}
            onPress={() => setIsAddingOption(true)}
            activeOpacity={0.8}
          >
            <Plus size={28} color={themeColor} />
            <Text style={[styles.addCardText, { color: themeColor }]}>Add Option</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ADD OPTION INPUT FIELD */}
      {isAddingOption && (
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.iconButton}>
            <ImagePlus size={20} color="#666" />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { borderColor: themeColor }]}
            value={newOptionText}
            onChangeText={setNewOptionText}
            placeholder="Add your option text..."
            placeholderTextColor="#999"
            autoFocus
            onSubmitEditing={submitNewOption}
          />

          <TouchableOpacity style={styles.iconButton} onPress={submitNewOption}>
            <Send size={20} color={themeColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => setIsAddingOption(false)}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  titleContainer: {
    paddingBottom: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a', // On Surface
  },
  listContainer: {
    height: 260,
  },
  fullBleed: {
    marginHorizontal: -16, // Assuming parent has 16 padding, negative margin achieves full bleed
  },
  scrollContent: {
    paddingHorizontal: 16, // Re-add padding inside scroll view
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  cardWrapper: {
    marginRight: 12,
  },
  addCard: {
    width: 140,
    height: 220,
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
  },
  iconButton: {
    padding: 8,
  },
});
