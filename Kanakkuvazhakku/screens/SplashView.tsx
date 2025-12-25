import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const SplashView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(onFinish, 1000);
    });
  }, [fadeAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ ...styles.logoContainer, opacity: fadeAnim }}>
        <Text style={styles.logo}>Kanakkuvazhakku</Text>
        <Text style={styles.subtitle}>Personal Finance Manager</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  subtitle: {
    color: '#F59E0B',
    fontSize: 16,
  },
});

export default SplashView;