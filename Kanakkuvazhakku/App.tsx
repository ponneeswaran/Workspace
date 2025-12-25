import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './contexts/AppContext';
import RootNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AppProvider>
  );
}
