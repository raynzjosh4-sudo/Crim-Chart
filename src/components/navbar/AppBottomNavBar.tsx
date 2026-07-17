import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { BadgeIcon } from '@/mainFeed/features/bottomappbar/iconwithbarge/BadgeIcon'; // Assuming this exists
import { Clapperboard, Compass, Home, MessageCircle, PlusCircle } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavBarProps } from './AppBottomNavBarProps';

export const AppBottomNavBar = ({

  selectedIndex,
  onItemTapped,
  homeBadgeCount = 0,
  hideBorder,
}: AppBottomNavBarProps & { hideBorder?: boolean }) => {
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.surfaceVariant, borderTopWidth: hideBorder ? 0 : 0.5 }]}>
      <SafeAreaView edges={['bottom', 'left', 'right']}>
        <View style={styles.navBar}>
          <NavItem
            index={0}
            selectedIndex={selectedIndex}
            onTap={onItemTapped}
            icon={<BadgeIcon IconComponent={Home} count={Boolean(homeBadgeCount) ? 1 : 0} />}
            selectedIcon={<BadgeIcon IconComponent={Home} count={Boolean(homeBadgeCount) ? 1 : 0} />}
            label="Crim"
            color={colors.text}
            inactiveColor={colors.textSecondary}
          />
          <NavItem
            index={1}
            selectedIndex={selectedIndex}
            onTap={onItemTapped}
            icon={<Clapperboard size={32} />}
            selectedIcon={<Clapperboard size={32} />}
            label="Vids"
            color={colors.text}
            inactiveColor={colors.textSecondary}
          />

          <AddButton onTap={() => onItemTapped(2)} color={colors.text} styles={styles} />

          <NavItem
            index={3}
            selectedIndex={selectedIndex}
            onTap={onItemTapped}
            icon={<BadgeIcon IconComponent={Compass} showDot={true} />}
            selectedIcon={<BadgeIcon IconComponent={Compass} showDot={true} />}
            label="Channels"
            color={colors.text}
            inactiveColor={colors.textSecondary}
          />

          <NavItem
            index={5}
            selectedIndex={selectedIndex}
            onTap={onItemTapped}
            icon={<MessageCircle size={32} />}
            selectedIcon={<MessageCircle size={32} />}
            label="Chat"
            color={colors.text}
            inactiveColor={colors.textSecondary}
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
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);

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

const AddButton = ({ onTap, color, styles }: { onTap: () => void; color: string; styles: any }) => {
  return (
    <TouchableOpacity onPress={onTap} style={styles.addButton} activeOpacity={0.8}>
      <PlusCircle color={color} size={36} />
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    // borderTopWidth is handled dynamically
  },
  navBar: {
    height: 62 * scale,
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
  },
  navItem: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 4 * scale,
  },
  label: {
    fontSize: 10 * scale,
    fontWeight: '700' as const,
    marginTop: 4 * scale,
  },
  addButton: {
    width: 56 * scale,
    height: 56 * scale,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

