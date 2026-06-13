import { colors } from "@/core/theme/colors";
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // matches screenshot scaffold
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        marginHorizontal: 8,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    statusTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
    },
    statusScroll: {
        paddingHorizontal: 16,
    },
    addStatusCard: {
        width: 100,
        height: 160,
        backgroundColor: '#383219', // Matches the exact brownish/yellow tint from screenshot
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
    },
    addStatusAvatarContainer: {
        position: 'relative',
        alignSelf: 'flex-start',
    },
    addStatusAvatar: {
        width: 32,
        height: 20,
        borderRadius: 16,
        backgroundColor: '#111',
    },
    addStatusPlus: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: colors.primary,
        borderRadius: 6,
        padding: 2,
    },
    addStatusLabel: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold',
    },
    feedPostContainer: {
        padding: 16,
    },
    feedPostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    feedAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        marginRight: 12,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    feedAuthor: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    feedContent: {
        color: '#FFF',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    inviteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 12,
    },
    inviteCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    inviteChannelAvatar: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#222',
        marginRight: 12,
    },
    inviteChannelInfo: {
        flex: 1,
    },
    inviteChannelTitle: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 4,
    },
    inviteChannelSub: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    joinButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    joinButtonText: {
        color: '#000',
        fontSize: 13,
        fontWeight: '900',
    },
    messagesTabContainer: {
        flex: 1,
        backgroundColor: '#000', // Solid black background matching screenshot
    },
    messagesScroll: {
        flex: 1,
    },
    messagesScrollContent: {
        paddingBottom: 20,
    },
    dateDividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    dateLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    dateText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontWeight: '800',
        marginHorizontal: 12,
    },
});

export default function IgnoredRoute() { return null; }
