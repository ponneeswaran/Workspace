// HomeView.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Footer from '../components/Footer';


const HomeView: React.FC = () => {
  return (
    <View style={styles.container}>
      <Footer activeTab="dashboard" orientation="portrait" />
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
