import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { BrowserSpinner } from './BrowserSpinner';

interface ProgressContextType {
  activeRequests: number;
  startLoading: () => void;
  stopLoading: () => void;
}

const ProgressContext = React.createContext(undefined as ProgressContextType | undefined | any);

export const useGlobalProgress = () => {
  const context = React.useContext(ProgressContext);
  if (!context) {
    throw new Error('useGlobalProgress must be used within a ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }: { children: any }) => {
  const [activeRequests, setActiveRequests] = React.useState(0);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const startLoading = React.useCallback(() => {
    setActiveRequests(((prev: number) => prev + 1) as any);
  }, []);

  const stopLoading = React.useCallback(() => {
    setActiveRequests(((prev: number) => Math.max(0, prev - 1)) as any);
  }, []);

  return (
    <ProgressContext.Provider value={{ activeRequests, startLoading, stopLoading }}>
      <View style={styles.container}>
        {children}
        {isDesktop && <BrowserSpinner isVisible={activeRequests > 0} />}
      </View>
    </ProgressContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
