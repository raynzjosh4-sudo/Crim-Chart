import React from 'react';

/**
 * Permissions resolved at prefetch time in SmartPostWidget.
 * Consumed by any card or action component deep in the tree — no prop drilling.
 */
export interface FeedPermissions {
  canComment: boolean;
  canSubmit?: boolean;
}

const defaultPermissions: FeedPermissions = {
  canComment: true,
  canSubmit: true,
};

const FeedPermissionsContext = React.createContext(defaultPermissions);

export const FeedPermissionsWrapper: React.FC<{
  permissions: FeedPermissions;
  children: React.ReactNode;
}> = ({ permissions, children }) => {
  return (
    <FeedPermissionsContext.Provider value={permissions}>
      {children}
    </FeedPermissionsContext.Provider>
  );
};

/** Hook for easy consumption inside any child component */
export function useFeedPermissions(): FeedPermissions {
  return React.useContext(FeedPermissionsContext);
}
