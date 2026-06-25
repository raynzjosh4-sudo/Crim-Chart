// Safe shim for @react-native-google-signin/google-signin
// Tries to require the native package; if it fails (e.g. running in Expo Go without native module),
// export a lightweight fallback that avoids throwing during module load.
let RealGoogleSignin: any = null;
try {
    // Use require so bundlers don't eagerly fail; catch any native module errors.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@react-native-google-signin/google-signin');
    RealGoogleSignin = mod?.GoogleSignin ?? mod;
} catch (e) {
    RealGoogleSignin = null;
}

const GoogleSignin = RealGoogleSignin ?? {
    configure: (_opts?: any) => { },
    hasPlayServices: async () => {
        // Indicate that play services are not available in this environment.
        return false;
    },
    signIn: async () => {
        throw new Error(
            'Google Signin native module unavailable in this environment. Use a dev build or prebuilt app.'
        );
    },
    signOut: async () => { },
    revokeAccess: async () => { },
};

export { GoogleSignin };

