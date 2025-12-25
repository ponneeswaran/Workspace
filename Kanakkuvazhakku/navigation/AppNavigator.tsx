import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeView from '../screens/HomeView';
import HistoryView from '../screens/HistoryView';
import ChatView from '../screens/ChatView';
import TermsScreen from '../screens/TermsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
export type RootStackParamList = {
  Main: undefined;
  Terms: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'help'; // Default icon

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Chat') {
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0F766E',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeView} />
    <Tab.Screen name="History" component={HistoryView} />
    <Tab.Screen name="Chat" component={ChatView} />
  </Tab.Navigator>
);

const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;