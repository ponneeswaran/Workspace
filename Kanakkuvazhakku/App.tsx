import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './contexts/AppContext';
import SplashView from './screens/SplashView';
import AuthView from './screens/AuthView';
import OnboardingView from './screens/OnboardingView';
import AppNavigator from './navigation/AppNavigator';
import { getAuthStatus, saveAuthStatus } from './utils/storage';

const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<'splash' | 'auth' | 'onboarding' | 'main'>('splash');
  const [isLoading, setIsLoading] = useState(true);
  const { state, dispatch } = useApp();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authenticated = await getAuthStatus();
      dispatch({ type: 'SET_AUTHENTICATED', payload: authenticated });
      if (authenticated) {
        setAppState('main');
      } else {
        setAppState('auth');
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [dispatch]);

  const handleAuth = useCallback(() => {
    saveAuthStatus(true); // Persist authentication status
    setAppState('onboarding');
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setAppState('main');
  }, []);

  if (isLoading) {
    return (
      <SplashView onFinish={() => setAppState(state.isAuthenticated ? 'main' : 'auth')} />
    );
  }

  if (appState === 'auth') {
    return <AuthView onAuth={handleAuth} />;
  }

  if (appState === 'onboarding') {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  return <AppNavigator />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <StatusBar style="auto" />
    </AppProvider>
  );
}
