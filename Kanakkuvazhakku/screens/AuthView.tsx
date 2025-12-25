import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const AuthView: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { dispatch } = useApp();

  const handleAuth = () => {
    if (email && password) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      dispatch({ type: 'SET_USER', payload: { name: 'User', email, currency: 'INR', language: 'EN' } });
      onAuth();
    } else {
      Alert.alert('Error', 'Please enter mobile number/email and password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeTitle}>Welcome</Text>
      <Text style={styles.subtitle}>Enter your credentials to access your secure offline ledger.</Text>

      <Text style={styles.label}>Mobile Number or Email</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter mobile # or email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'This feature is not yet implemented.')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleAuth}>
        <Text style={styles.loginButtonText}>Login</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.loginButtonIcon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Alert.alert('Sign Up', 'This feature is not yet implemented.')}>
        <Text style={styles.signUpText}>Don&apos;t have an account?</Text>
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By continuing, you agree to our{' '}
        <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>{' '}
        and{' '}
        <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        .
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  forgotPassword: {
    color: '#0D9488', // Teal 600
    marginBottom: 20,
    marginTop: -10,
    textAlign: 'right',
  },
  input: {
    color: '#1E293B',
    flex: 1,
    height: 50,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0', // Slate 200
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  label: {
    color: '#334155', // Slate 700
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  linkText: {
    color: '#0D9488', // Teal 600
    fontWeight: 'bold',
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E', // Teal 700
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
    paddingVertical: 15,
  },
  loginButtonIcon: {
    // styles for arrow icon
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  signUpText: {
    color: '#0D9488', // Teal 600
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280', // Gray 500
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  termsText: {
    color: '#6B7280', // Gray 500
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
  },
  welcomeTitle: {
    color: '#1E293B', // Slate 800
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default AuthView;