// Basic module shims for packages when types are not installed
declare module 'react/jsx-runtime';
declare module 'react-i18next';
declare module '@react-navigation/native';

// Minimal lucide-react typings for common icon components used in the app
declare module 'lucide-react' {
    import * as React from 'react';
    export type LucideIcon = React.ComponentType<any>;
    export const ChevronRight: LucideIcon;
    export const Camera: LucideIcon;
    export const Lock: LucideIcon;
    export const Ban: LucideIcon;
    export const DownloadCloud: LucideIcon;
    export const EyeOff: LucideIcon;
    export const Globe: LucideIcon;
    export const Info: LucideIcon;
    export const LifeBuoy: LucideIcon;
    export const Maximize: LucideIcon;
    export const MessageCircle: LucideIcon;
    export const MinusCircle: LucideIcon;
    export const Palette: LucideIcon;
    export const RefreshCw: LucideIcon;
    export const Send: LucideIcon;
    export const Type: LucideIcon;
    export const UserCheck: LucideIcon;
    export const UserPlus: LucideIcon;
    export const Bug: LucideIcon;
    export default {} as { [key: string]: LucideIcon };
}

// Allow use of require in files without Node types
declare var require: any;
// Expose a minimal JSX IntrinsicElements in the global JSX namespace so TSX
// elements don't error when specific libs aren't installed.
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}

// Minimal fallbacks for React named exports in case the project's type
// resolution misses @types/react. These are intentionally permissive "any"
// typings to unblock the development server and IDE; they should be removed
// once proper types are available.
declare module 'react' {
    export function useState<T = any>(initial?: T): [T, (v: T) => void];
    export function useEffect(...args: any[]): any;
    export function useRef<T = any>(initial?: T): { current: T };
    export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: any[]): T;
    export function useMemo<T>(factory: () => T, deps: any[] | undefined): T;
    export type FC<P = any> = (props: P & { children?: any }) => any;
    const React: any;
    export default React;
}
