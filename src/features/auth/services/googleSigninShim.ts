// Safe shim for @react-native-google-signin/google-signin
import { Platform } from 'react-native';

const GoogleSigninWebMock = {
    configure: (_opts?: any) => { },
    hasPlayServices: async () => false,
    signIn: async () => new Promise<any>(() => {}),
    signOut: async () => { },
    revokeAccess: async () => { },
};

let GoogleSigninNative: any = null;

if (Platform.OS !== 'web') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('@react-native-google-signin/google-signin');
        GoogleSigninNative = mod?.GoogleSignin ?? mod;
    } catch (e) {
        GoogleSigninNative = null;
    }
}

const GoogleSignin = Platform.OS === 'web' 
    ? GoogleSigninWebMock 
    : (GoogleSigninNative ?? GoogleSigninWebMock);

export { GoogleSignin };

