import { BadgeIcon } from '@/mainFeed/features/bottomappbar/iconwithbarge/BadgeIcon'; // Assuming this exists
import { useTheme } from '@react-navigation/native';
import { Hash, MessageCircle, PlaySquare, PlusCircle, Podcast } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavBarProps } from './AppBottomNavBarProps';

export const AppBottomNavBar = ({

  selectedIndex,

  onItemTapped,
  homeBadgeCount = 0,
}: AppBottomNavBarProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: 'rgba(255, 255, 255, 0.08)' }]}>
      <SafeAreaView edges={['bottom', 'left', 'right']}>
        <View style={styles.navBar}>
          <NavItem
            index={0}
            selectedIndex={selectedIndex}
            onTap={onItemTapped}
            icon={<BadgeIcon IconComponent={Podcast} count={Boolean(homeBadgeCount) ? 1 : 0} />}
            selectedIcon={<BadgeIcon IconComponent={Podcast} count={Boolean(homeBadgeCount) ? 1 : 0} />}
            label="Feed"
            color={colors.primary}
            inactiveColor="rgba(255, 255, 255, 0.45)"
          />
          <NavItem
            index={1}
            selectedIndex={selectedIndex}
            onTap={onItemTapped}
            icon={<PlaySquare size={32} />}
            selectedIcon={<PlaySquare size={32} />}
            label="Vids"
            color={colors.primary}
            inactiveColor="rgba(255, 255, 255, 0.45)"
          />

          <AddButton onTap={() => onItemTapped(2)} color={colors.primary} />

          <NavItem
            index={3}
            selectedIndex={selectedIndex}
            onTap={onItemTapped}
            icon={<BadgeIcon IconComponent={Hash} showDot={true} />}
            selectedIcon={<BadgeIcon IconComponent={Hash} showDot={true} />}
            label="Channels"
            color={colors.primary}
            inactiveColor="rgba(255, 255, 255, 0.45)"
          />

          <NavItem
            index={5}
            selectedIndex={selectedIndex}
            onTap={onItemTapped}
            icon={<MessageCircle size={32} />}
            selectedIcon={<MessageCircle size={32} />}
            label="Msgs"
            color={colors.primary}
            inactiveColor="rgba(255, 255, 255, 0.45)"
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const NavItem = ({
  index,
  selectedIndex,
  onTap,
  icon,
  selectedIcon,
  label,
  color,
  inactiveColor,
}: any) => {
  const isSelected = index === selectedIndex;
  const itemColor = isSelected ? color : inactiveColor;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onTap(index)}
      style={styles.navItem}
    >
      {(() => {
        const element = isSelected ? selectedIcon : icon;
        if (!element) return null;
        const Component: any = (element as any).type;
        const existingProps = (element as any).props || {};
        return <Component {...existingProps} color={itemColor} />;
      })()}
      <Text style={[styles.label, { color: itemColor }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const AddButton = ({ onTap, color }: { onTap: () => void; color: string }) => {
  return (
    <TouchableOpacity onPress={onTap} style={styles.addButton} activeOpacity={0.8}>
      <PlusCircle color={color} size={36} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
  },
  navBar: {
    height: 62,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  addButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

