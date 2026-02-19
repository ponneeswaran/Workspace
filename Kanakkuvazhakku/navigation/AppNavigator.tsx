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
import ProfileSettingsView from '../screens/ProfileSettingsView';
import ProfileEditView from '../screens/ProfileEditView';
import AccountView from '../screens/AccountView';
import IncomeView from '../screens/IncomeView';
import BudgetView from '../screens/BudgetView';
import CategoryExpensesView from '../screens/CategoryExpensesView';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Dashboard: undefined;
  Expenses: undefined;
  Income: undefined;
  Budget: undefined;
  CategoryExpenses: { category: string };
  Assistant: undefined;
  Terms: undefined;
  Registration: { identifier: string };
  Profile: undefined;
  ProfileEdit: undefined;
  Account: undefined;
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
const ProfileSettingsScreen = () => (
  <MainLayout>
    <ProfileSettingsView />
  </MainLayout>
);
const ProfileEditScreen = () => (
  <MainLayout>
    <ProfileEditView />
  </MainLayout>
);
const IncomeScreen = () => (
  <MainLayout>
    <IncomeView />
  </MainLayout>
);
const BudgetScreen = () => (
  <MainLayout>
    <BudgetView />
  </MainLayout>
);

const RootNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashView} />
      <Stack.Screen name="Auth" component={() => (
        <MainLayout showFooter={false}>
          <AuthView />
        </MainLayout>
      )} />
      <Stack.Screen name="Onboarding" component={OnboardingView} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Registration" component={() => (
        <MainLayout showFooter={false}>
          <RegistrationView />
        </MainLayout>
      )} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} />
      <Stack.Screen name="Income" component={IncomeScreen} />
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="CategoryExpenses" component={CategoryExpensesView} />
      <Stack.Screen name="Assistant" component={AssistantScreen} />
      <Stack.Screen name="Profile" component={ProfileSettingsScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="Account" component={AccountView} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;