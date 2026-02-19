import React, { ReactNode, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from './Footer';
import { useRoute } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';
import { lightTheme, darkTheme } from '../utils/theme';

interface MainLayoutProps {
  children: ReactNode;
  /** Hide bottom footer (useful for auth / onboarding screens) */
  showFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showFooter = true }) => {
  const [footerHeight, setFooterHeight] = useState(0);

  const onFooterLayout = (event: import('react-native').LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height);
  };

  const { width, height } = useWindowDimensions();
  const route = useRoute();
  const { state } = useApp();
  const theme = state.theme === 'light' ? lightTheme : darkTheme;
  const orientation = width > height ? 'landscape' : 'portrait';

  const injectedFooterHeight = showFooter ? footerHeight : 0;

  if (orientation === 'landscape') {
    return (
      <View style={[styles.safeArea, { backgroundColor: theme.colors.background }, styles.containerLandscape]}>
        <SafeAreaView style={styles.flex1}>
          <View style={styles.content}>
            {React.Children.map(children, child =>
              React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<{ footerHeight?: number }>, { footerHeight: injectedFooterHeight }) : child
            )}
          </View>
        </SafeAreaView>
        {showFooter && <Footer activeTab={route.name} orientation={orientation} theme={theme} onLayout={onFooterLayout} />}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.containerPortrait}>
        <View style={styles.content}>
          {React.Children.map(children, child =>
            React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<{ footerHeight?: number }>, { footerHeight: injectedFooterHeight }) : child
          )}
        </View>
        {showFooter && <Footer activeTab={route.name} orientation={orientation} theme={theme} onLayout={onFooterLayout} />}
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
  flex1: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default MainLayout;
