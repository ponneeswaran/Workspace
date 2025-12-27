import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './contexts/AppContext';
import RootNavigator from './navigation/AppNavigator';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AppProvider>
    </I18nextProvider>
  );
}
