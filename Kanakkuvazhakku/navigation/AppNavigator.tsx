import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashView from '../screens/SplashView';
import AuthView from '../screens/AuthView';
import OnboardingView from '../screens/OnboardingView';
import HomeView from '../screens/HomeView';
import HistoryView from '../screens/HistoryView';
import ChatView from '../screens/ChatView';
import TermsScreen from '../screens/TermsScreen';
import RegistrationView from '../screens/RegistrationView';
import MainLayout from '../components/MainLayout';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Dashboard: undefined;
  Expenses: undefined;
  Income: undefined;
  Assistant: undefined;
  Terms: undefined;
  Registration: { identifier: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const DashboardScreen = () => (
  <MainLayout>
    <HomeView />
  </MainLayout>
);
const ExpensesScreen = () => (
  <MainLayout>
    <HistoryView />
  </MainLayout>
);
const AssistantScreen = () => (
  <MainLayout>
    <ChatView />
  </MainLayout>
);

const RootNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashView} />
      <Stack.Screen name="Auth" component={AuthView} />
      <Stack.Screen name="Onboarding" component={OnboardingView} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Registration" component={RegistrationView} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} />
      <Stack.Screen name="Assistant" component={AssistantScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;