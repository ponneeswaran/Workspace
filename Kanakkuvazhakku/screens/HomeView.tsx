// HomeView.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

const HomeView: React.FC = () => {
  return (
    <View style={styles.container}>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

export default HomeView;
