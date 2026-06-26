import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Prefer EXPO_PUBLIC_ environment variables for client-side access in Expo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

function isValidUrl(url: string) {
    try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

let supabaseClient: any = null;

if (isValidUrl(supabaseUrl) && supabaseUrl.indexOf('YOUR_SUPABASE') === -1) {
    try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                storage: AsyncStorage,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: Platform.OS === 'web',
            },
        });
    } catch (err) {
        // If createClient fails (e.g. invalid URL), log and continue with a noop client
        console.warn('Failed to initialize Supabase client:', err);
        supabaseClient = {} as any;
    }
} else {
    // eslint-disable-next-line no-console
    console.warn('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY to enable Supabase features.');
    supabaseClient = {} as any;
}

export const supabase = supabaseClient;
export { supabaseAnonKey, supabaseUrl };

