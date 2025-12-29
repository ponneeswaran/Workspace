import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../utils/useAuth';
import { User } from 'lucide-react-native';
import { useApp } from '../contexts/AppContext';
import { lightTheme, darkTheme } from '../utils/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const HomeView: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { state } = useApp();
  const theme = state.theme === 'light' ? lightTheme : darkTheme;

  const onProfilePress = () => {
    navigation.navigate('Profile');
  };

  const { storedUser } = useAuth();
  const userName = storedUser?.name || 'Guest';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Ledger Summary</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>Welcome, {userName}</Text>
        </View>
        <TouchableOpacity onPress={onProfilePress} style={[styles.profileButton, { backgroundColor: theme.colors.borderColor }]}>
          <User size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  profileButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  subtitle: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeView;
