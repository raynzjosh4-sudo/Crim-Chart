import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface FeedComponent {
  id: string;
  render: () => React.ReactNode;
}

interface DynamicFeedViewProps {
  components: FeedComponent[];
}

export const DynamicFeedView: React.FC<DynamicFeedViewProps> = ({ components }) => {
  return (
    <View style={styles.container}>
      {components.map((component) => (
        <ErrorBoundary key={component.id}>
          {component.render()}
        </ErrorBoundary>
      ))}
    </View>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
