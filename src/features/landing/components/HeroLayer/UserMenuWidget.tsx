import { colors } from '@/core/theme/colors';
import { User } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const isWeb = Platform.OS === 'web';

interface UserMenuWidgetProps {
  onLoginClick: () => void;
  onCreateAccount: () => void;
}

export function UserMenuWidget({ onLoginClick, onCreateAccount }: UserMenuWidgetProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.topBar}>
      {isDesktop && (
        <>
          <TextInput
            style={styles.topInput}
            placeholder="Email, phone, or username"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.topInput}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.loginBtnSmall} onPress={onLoginClick}>
            <Text style={styles.loginBtnSmallText}>Log in</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 14,
    right: 20,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  userIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    ...(isWeb && { cursor: 'pointer' as any })
  },
  userMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 200,
    backgroundColor: '#161b22', // GitHub dark mode drop down
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)' as any,
      },
      default: {
        elevation: 8,
      }
    })
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...(isWeb && { cursor: 'pointer' as any })
  },
  menuItemText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  topInput: {
    width: 200,
    height: 38,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 6,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 14,
    backgroundColor: 'transparent',
    ...(isWeb && { outlineStyle: 'none' as any })
  },
  loginBtnSmall: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isWeb && { cursor: 'pointer' as any })
  },
  loginBtnSmallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f1419'
  }
});
