export interface AppBottomNavBarProps {
    selectedIndex: number;
    onItemTapped: (index: number) => void;
    homeBadgeCount?: number;
}
