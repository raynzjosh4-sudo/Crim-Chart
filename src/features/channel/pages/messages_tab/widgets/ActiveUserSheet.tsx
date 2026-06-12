import { CrimChatUser } from '@/app/user/_usertypemodel';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FollowButton } from './activeUserBar/followButton';

interface ActiveUserSheetProps {
    user: CrimChatUser | null;
    visible: boolean;
    onClose: () => void;
}


export const ActiveUserSheet: React.FC<ActiveUserSheetProps> = ({ user, visible, onClose }) => {
    const followUser = () => {
        console.log(`{'following ${user?.username} and followings count is now ${user?.followers! + 1
            }'}`)
    };
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <View style={styles.sheetContainer}>
                    <View style={styles.handle} />

                    {user && (
                        <View style={styles.content}>
                            <Image source={{ uri: user.profileImageUrl }} style={styles.largeAvatar} />
                            <Text style={styles.username}>{user.username}</Text>

                            <View style={styles.statsRow}>
                                <View style={styles.statCol}>
                                    <Text style={styles.statValue}>{user.followers}</Text>
                                    <Text style={styles.statLabel}>Followers</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statCol}>

                                    <Text style={styles.statValue}>{user.channelCount == 0 || null ? 0 : user.channelCount}</Text>
                                    <Text style={styles.statLabel}>Channels</Text>
                                </View>
                            </View>

                            <View style={styles.actionsRow}>
                                <FollowButton onFollow={followUser}></FollowButton>
                                <TouchableOpacity style={styles.viewButton}>
                                    <Text style={styles.viewText}>View Account</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.sectionTitle}>Common Channels</Text>
                            <Text style={styles.emptyText}>No common channels</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheetContainer: {
        backgroundColor: '#0B0B0B',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 34,
    },
    handle: {
        width: 48,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignSelf: 'center',
        borderRadius: 2,
        marginBottom: 12,
    },
    content: { alignItems: 'center' },
    largeAvatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: 'rgba(255,184,0,0.6)', marginBottom: 12 },
    username: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 10 },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    statCol: { alignItems: 'center', paddingHorizontal: 20 },
    statValue: { color: '#FFF', fontWeight: '900', fontSize: 18 },
    statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.06)' },
    actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 20 },
    viewButton: { backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
    viewText: { color: '#FFF', fontWeight: '700' },
    sectionTitle: { color: '#FFF', fontWeight: '800', fontSize: 16, alignSelf: 'flex-start', marginTop: 6, marginBottom: 6 },
    emptyText: { color: 'rgba(255,255,255,0.5)', alignSelf: 'flex-start' },
});

export default ActiveUserSheet;
function Follow() {
    throw new Error('Function not implemented.');
}

