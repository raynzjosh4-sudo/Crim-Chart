import { CrimChatUser } from '@/app/user/_usertypemodel';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import ActiveUserSheet from './ActiveUserSheet';
import { UserAvatar } from './activeUserBar/avator/UserAvatar';
import { styles } from './activeUserBar/styles/activeUserBar.styles';

interface ActiveUsersBarProps {
  users: CrimChatUser[];
}


export const ActiveUsersBar: React.FC<ActiveUsersBarProps> = ({ users }) => {
  // Sort users: 1. Is Typing -> 2. Is Online -> 3. Offline
  const sortedUsers = [...users].sort((a, b) => {
    if (a.isTyping && !b.isTyping) return -1;
    if (!a.isTyping && b.isTyping) return 1;
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return 0;
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
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => users[0] && openSheetFor(users[0])}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {sortedUsers.map(user => (
            <UserAvatar key={user.id} user={user} onPress={openSheetFor} />
          ))}
        </ScrollView>
      </TouchableOpacity>

      <ActiveUserSheet user={selectedUser} visible={sheetVisible} onClose={closeSheet} />
    </View>
  );
};
