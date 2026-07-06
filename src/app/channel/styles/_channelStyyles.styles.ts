import { useStyles } from '@/core/hooks/useStyles';

export function useChannelStyles() {
  return useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      height: 60,
      paddingHorizontal: 12,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 20,
      fontWeight: '900' as const,
      marginHorizontal: 8,
    },
    headerActions: {
      flexDirection: 'row' as const,
      gap: 12,
    },
    actionCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    statusSection: {
      paddingVertical: 12,
    },
    statusHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    statusTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '900' as const,
    },
    statusScroll: {
      paddingHorizontal: 16,
    },
    addStatusCard: {
      width: 100,
      height: 160,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 16,
      padding: 12,
      justifyContent: 'space-between' as const,
    },
    addStatusAvatarContainer: {
      position: 'relative' as const,
      alignSelf: 'flex-start' as const,
    },
    addStatusAvatar: {
      width: 32,
      height: 20,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
    addStatusPlus: {
      position: 'absolute' as const,
      bottom: -2,
      right: -2,
      backgroundColor: colors.primary,
      borderRadius: 6,
      padding: 2,
    },
    addStatusLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold' as const,
    },
    feedPostContainer: {
      padding: 16,
    },
    feedPostHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: 12,
    },
    feedAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceVariant,
      marginRight: 12,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    feedAuthor: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800' as const,
    },
    feedContent: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 16,
    },
    inviteCard: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
    },
    inviteCardLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flex: 1,
      marginRight: 12,
    },
    inviteChannelAvatar: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: colors.surfaceVariant,
      marginRight: 12,
    },
    inviteChannelInfo: {
      flex: 1,
    },
    inviteChannelTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800' as const,
      marginBottom: 4,
    },
    inviteChannelSub: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    joinButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    joinButtonText: {
      color: colors.onPrimary,
      fontSize: 13,
      fontWeight: '900' as const,
    },
    messagesTabContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    messagesScroll: {
      flex: 1,
    },
    messagesScrollContent: {
      paddingBottom: 20,
    },
    dateDividerContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginVertical: 16,
      paddingHorizontal: 16,
    },
    dateLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.muted,
    },
    dateText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '800' as const,
      marginHorizontal: 12,
    },
  }));
}

export default function IgnoredRoute() { return null; }
