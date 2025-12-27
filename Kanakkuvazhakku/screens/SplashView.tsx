import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Wallet } from 'lucide-react-native';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashView: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      )
    ]).start();

    Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false, // width animation not supported by native driver
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('Auth');
    }, 3500);

    return () => clearTimeout(timer);
  }, [fadeAnim, bounceAnim, loadingAnim, navigation]);

  const loadingWidth = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // NOTE: The path to the background image is assumed.
  // Make sure you have the image at the specified location.
  // const BG_IMAGE = require('../assets/splash-background.jpg');

  return (
    <View style={styles.background}>
      <View style={styles.overlay} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <View style={styles.logoBackground}>
              <Wallet size={64} color="#FFFFFF" />
            </View>
          </Animated.View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Kanakkuvazhakku</Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>Smart Expense Tracker</Text>
            </View>
          </View>
        </View>

        <View style={styles.loadingBarContainer}>
          <Animated.View style={[styles.loadingBar, { width: loadingWidth }]} />
        </View>

        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#0F766E',
    flex: 1, // Added a fallback background color
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  imageStyle: {
    opacity: 0.8,
  },
  loadingBar: {
    backgroundColor: '#5EEAD4', // teal-300
    borderRadius: 9999,
    height: '100%',
  },
  loadingBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    bottom: 64,
    height: 4,
    overflow: 'hidden',
    position: 'absolute',
    width: 192,
  },
  logoBackground: {
    // This can be used for more complex background effects if needed
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    padding: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 148, 136, 0.6)', // teal-900 with opacity
  },
  subtitle: {
    color: '#CCFBF1', // teal-100
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitleContainer: {
    backgroundColor: 'rgba(13, 148, 136, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  version: {
    bottom: 24,
    color: 'rgba(204, 251, 241, 0.5)', // teal-100 with 50% opacity
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    position: 'absolute',
  },
});

export default SplashView;