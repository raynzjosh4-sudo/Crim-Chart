import { CrimChatUser } from '@/app/user/_usertypemodel';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { UserProfileBottomSheet } from '@/channel/pages/messages_tab/bottom_sheets/UserProfileBottomSheet';
import { UserAvatar } from './activeUserBar/avator/UserAvatar';
import { styles } from './activeUserBar/styles/activeUserBar.styles';

interface ActiveUsersBarProps {
  users: CrimChatUser[];
}


export const ActiveUsersBar: React.FC<ActiveUsersBarProps> = ({ users }) => {
  // Sort users priority: 
  // 1. Is Typing 
  // 2. Has Status
  // 3. Is Online 
  // 4. Last Replied
  // 5. Last Seen
  const sortedUsers = [...users].sort((a, b) => {
    if (a.isTyping && !b.isTyping) return -1;
    if (!a.isTyping && b.isTyping) return 1;

    if (a.hasStatus && !b.hasStatus) return -1;
    if (!a.hasStatus && b.hasStatus) return 1;

    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;

    const aReplied = a.lastReplied || 0;
    const bReplied = b.lastReplied || 0;
    if (aReplied !== bReplied) return bReplied - aReplied;

    const aSeen = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
    const bSeen = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
    return bSeen - aSeen;
  });

  const [selectedUser, setSelectedUser] = useState<CrimChatUser | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const openSheetFor = (user: CrimChatUser) => {
    setSelectedUser(user);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setSelectedUser(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
          {sortedUsers.map(user => (
            <React.Fragment key={user.id}>
              <UserAvatar user={user} onPress={openSheetFor} />
            </React.Fragment>
          ))}
        </ScrollView>

      {selectedUser && (
        <UserProfileBottomSheet
          visible={sheetVisible}
          onClose={closeSheet}
          user={{
            id: '',
            text: '',
            timestamp: new Date(),
            user: {
              id: selectedUser.id || (selectedUser as any).userId,
              name: selectedUser.username || '',
              avatarUrl: selectedUser.profileImageUrl || ''
            }
          } as any}
        />
      )}
    </View>
  );
};
