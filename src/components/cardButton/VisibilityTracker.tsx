import React, { useEffect } from 'react';

interface VisibilityTrackerProps {
    children: React.ReactNode;
    onVisibilityChanged: (isVisible: boolean) => void;
}

export default function VisibilityTracker({
    children,
    onVisibilityChanged,
}: VisibilityTrackerProps) {

    useEffect(() => {
        // 1. Equivalent to initState + addPostFrameCallback((_) => callback(true))
        onVisibilityChanged(true);

        return () => {
            // 2. Equivalent to dispose + addPostFrameCallback((_) => callback(false))
            onVisibilityChanged(false);
        };
        // Passing onVisibilityChanged ensures the hook reacts correctly if the handler reference changes
    }, [onVisibilityChanged]);

    // Acts as a transparent wrapper passing children through
    return <>{children}</>;
}