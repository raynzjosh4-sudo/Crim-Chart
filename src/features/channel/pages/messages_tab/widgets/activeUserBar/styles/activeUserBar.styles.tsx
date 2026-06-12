import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        height: 110,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    scrollContent: {
        paddingHorizontal: 16,
        alignItems: 'center',
        gap: 16,
    },
    userItem: {
        alignItems: 'center',
        width: 60,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 4,
    },
    avatarBorder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: 'rgba(255, 184, 0, 0.3)', // Default base accent frame
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    typingBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#4ADE80',
        padding: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 2,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4ADE80',
        borderWidth: 2,
        borderColor: '#000',
        zIndex: 2,
    },
    userName: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
});

// sheet styles moved to ActiveUserSheet.tsx