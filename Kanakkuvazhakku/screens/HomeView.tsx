// HomeView.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User } from 'lucide-react-native';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const HomeView: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const onProfilePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
          <User size={24} color="#334155" />
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
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeView;
