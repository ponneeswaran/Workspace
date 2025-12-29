import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { User } from 'phosphor-react-native';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingView: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { colors } = useTheme();
  const theme = useTheme();

  const onProfilePress = () => {
    navigation.navigate('Profile');
  };
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState<'EN' | 'TA'>('EN');
  const { dispatch } = useApp();

  const handleComplete = () => {
    if (name) {
      dispatch({ type: 'SET_USER', payload: { name, currency, language } });
      navigation.navigate('Dashboard');
    }
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Onboarding</Text>
        <TouchableOpacity onPress={onProfilePress} style={[styles.profileButton, { backgroundColor: colors.border }]}>
          <User size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={[styles.mainTitle, { color: colors.text }]}>Welcome to Kanakkuvazhakku</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>Let&apos;s set up your profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Currency</Text>
        <Picker
          selectedValue={currency}
          onValueChange={(itemValue: string) => setCurrency(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="INR" value="INR" />
          <Picker.Item label="USD" value="USD" />
          <Picker.Item label="EUR" value="EUR" />
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Language</Text>
        <Picker
          selectedValue={language}
          onValueChange={(itemValue: 'EN' | 'TA') => setLanguage(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="English" value="EN" />
          <Picker.Item label="Tamil" value="TA" />
        </Picker>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0F766E',
    borderRadius: 5,
    marginTop: 20,
    padding: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0D9488',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  label: {
    color: '#0F766E',
    fontSize: 14,
    marginBottom: 5,
  },
  mainTitle: {
    color: '#0F766E',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  outerContainer: {
    flex: 1,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0D9488',
    borderWidth: 1,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  profileButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  subtitle: {
    color: '#0D9488',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default OnboardingView;