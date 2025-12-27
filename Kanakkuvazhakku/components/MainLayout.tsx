import React, { ReactNode } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from './Footer';
import { useRoute } from '@react-navigation/native';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { width, height } = useWindowDimensions();
  const route = useRoute();
  const orientation = width > height ? 'landscape' : 'portrait';

  const containerStyle = orientation === 'portrait'
    ? styles.containerPortrait
    : styles.containerLandscape;

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={containerStyle}>
            <View style={styles.content}>
                {children}
            </View>
            <Footer activeTab={route.name} orientation={orientation} />
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerLandscape: {
    flex: 1,
    flexDirection: 'row',
  },
  containerPortrait: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: '#F1F5F9',
    flex: 1, // slate-200 for a slightly off-white background
  },
});

export default MainLayout;
