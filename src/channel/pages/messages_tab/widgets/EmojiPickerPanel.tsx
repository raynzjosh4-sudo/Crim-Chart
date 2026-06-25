import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const CATEGORIES = [
  {
    icon: '😊',
    label: 'Smileys',
    emojis: [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
      '😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
      '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔',
      '🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥',
      '😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮',
      '🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓',
    ],
  },
  {
    icon: '👍',
    label: 'Gestures',
    emojis: [
      '👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉',
      '👆','🖕','👇','☝️','👋','🤚','🖐️','✋','🖖','👏',
      '🙌','🤲','🤝','🙏','✍️','💅','🤳','💪','🦵','🦶',
      '👂','🦻','👃','🦷','👀','👁️','👅','👄','💋','❤️',
      '🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️',
      '💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️',
    ],
  },
  {
    icon: '🐶',
    label: 'Animals',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
      '🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧',
      '🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄',
      '🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🦂','🐢',
      '🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦀','🐡','🐠',
      '🐟','🐬','🐳','🐋','🦈','鳄','🐅','🐆','🦓','🦍',
    ],
  },
  {
    icon: '🍔',
    label: 'Food',
    emojis: [
      '🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐',
      '🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑',
      '🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🧅','🧄','🍔',
      '🍟','🍕','🌭','🌮','🌯','🥙','🧆','🥚','🍳','🧇',
      '🥞','🧈','🍞','🥐','☕','🍵','🧃','🥤','🧋','🍺',
      '🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🍶',
    ],
  },
  {
    icon: '⚽',
    label: 'Sports',
    emojis: [
      '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱',
      '🏓','🏸','🏒','🥊','🥋','⛷️','🏂','🏋️','🤼','🤸',
      '🤺','🤾','🏇','🏊','🤽','🚣','🧗','🚴','🏆','🥇',
      '🎯','🎲','🎮','🕹️','🎰','🎳','🎨','🖼️','🎭','🎬',
      '🎤','🎧','🎵','🎶','🎸','🎹','🎺','🎻','🪗','🥁',
      '🎷','🪘','🎙️','📷','📸','📹','🎥','📽️','🎞️','📞',
    ],
  },
  {
    icon: '🌍',
    label: 'Places',
    emojis: [
      '🌍','🌎','🌏','🌐','🗺️','🧭','⛰️','🌋','🗻','🏔️',
      '🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🏘️',
      '🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩',
      '✈️','🚀','🛸','🚁','🛺','🚂','🚃','🚄','🚅','🚆',
      '🚇','🚈','🚉','🚊','🚝','🚗','🚕','🚙','🚌','🚎',
      '🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🛵',
    ],
  },
];

interface EmojiPickerPanelProps {
  onEmojiSelected: (emoji: string) => void;
}

export const EmojiPickerPanel: React.FC<EmojiPickerPanelProps> = ({
  onEmojiSelected,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const screenWidth = Dimensions.get('window').width;
  const numColumns = 8;
  const emojiSize = screenWidth / numColumns;

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat, idx) => {
            const isActive = idx === activeTab;
            return (
              <TouchableOpacity activeOpacity={1}
                key={cat.label}
                onPress={() => setActiveTab(idx)}
                style={[
                  styles.tabItem,
                  isActive && styles.activeTabItem,
                ]}
              >
                <Text style={styles.tabIcon}>{cat.icon}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Emoji Grid */}
      <ScrollView style={styles.gridContainer}>
        <View style={styles.emojiRow}>
          {CATEGORIES[activeTab].emojis.map((emoji, idx) => (
            <TouchableOpacity activeOpacity={1}
              key={`${emoji}-${idx}`}
              onPress={() => onEmojiSelected(emoji)}
              style={[
                styles.emojiItem,
                { width: emojiSize, height: emojiSize },
              ]}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tabBar: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#FFF',
  },
  tabIcon: {
    fontSize: 22,
  },
  gridContainer: {
    flex: 1,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  emojiItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
});
