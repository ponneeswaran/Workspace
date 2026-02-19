// ProfileSettingsView.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../utils/theme';

const languageData = [
  { label: 'English', value: 'en' },
  { label: 'Tamil', value: 'ta' },
];

const currencyData = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'INR', value: 'INR' },
];

const ProfileSettingsView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useApp();
  const theme = state.theme === 'light' ? lightTheme : darkTheme;
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Profile'>>();

  const changeLanguage = (item: { value: string }) => {
    i18n.changeLanguage(item.value);
    setSelectedLanguage(item.value);
  };

  const changeCurrency = async (item: { value: string }) => {
    try {
      await AsyncStorage.setItem('currency', item.value);
      dispatch({ type: 'SET_CURRENCY', payload: item.value });
    } catch (error) {
      console.error('Failed to save currency', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      await AsyncStorage.setItem('theme', newTheme);
      dispatch({ type: 'SET_THEME', payload: newTheme });
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  };

  // BYOK: user-provided Gemini API key
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);

  const loadApiKeyState = async () => {
    try {
      const k = await (await import('../services/geminiService')).getUserApiKey();
      setHasApiKey(Boolean(k));
    } catch (err) {
      console.error('loadApiKeyState', err);
    }
  };

  React.useEffect(() => { loadApiKeyState(); }, []);

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setIsSavingKey(true);
    try {
      await (await import('../services/geminiService')).setUserApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setHasApiKey(true);
      Alert.alert(t('api_key_saved') || 'API key saved');
    } catch (err) {
      console.error(err);
      Alert.alert(t('save_failed') || 'Save failed');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleRemoveApiKey = async () => {
    try {
      await (await import('../services/geminiService')).removeUserApiKey();
      setHasApiKey(false);
      Alert.alert(t('api_key_removed') || 'API key removed');
    } catch (err) {
      console.error(err);
      Alert.alert(t('remove_failed') || 'Remove failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('Profile Settings')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')} style={styles.headerAction}>
          <Text style={[styles.headerActionText, { color: theme.colors.primary }]}>{t('Edit Profile')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.option, { borderBottomColor: theme.colors.borderColor }]}>
        <Text style={[styles.optionText, { color: theme.colors.text }]}>{t('Language')}</Text>
        <Dropdown
          style={[styles.dropdown, { backgroundColor: theme.colors.cardBackground }]}
          placeholderStyle={{ color: theme.colors.text }}
          selectedTextStyle={{ color: theme.colors.text }}
          itemTextStyle={{ color: theme.colors.text }}
          containerStyle={{ backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.borderColor }}
          data={languageData}
          labelField="label"
          valueField="value"
          value={selectedLanguage}
          onChange={changeLanguage}
        />
      </View>

      <View style={[styles.option, { borderBottomColor: theme.colors.borderColor }]}>
        <Text style={[styles.optionText, { color: theme.colors.text }]}>{t('Currency')}</Text>
        <Dropdown
          style={[styles.dropdown, { backgroundColor: theme.colors.cardBackground }]}
          placeholderStyle={{ color: theme.colors.text }}
          selectedTextStyle={{ color: theme.colors.text }}
          itemTextStyle={{ color: theme.colors.text }}
          containerStyle={{ backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.borderColor }}
          data={currencyData}
          labelField="label"
          valueField="value"
          value={state.currency}
          onChange={changeCurrency}
        />
      </View>

      <View style={[styles.option, { borderBottomColor: theme.colors.borderColor }]}>
        <Text style={[styles.optionText, { color: theme.colors.text }]}>{t('Dark Mode')}</Text>
        <Switch
          value={state.theme === 'dark'}
          onValueChange={toggleTheme}
          thumbColor={state.theme === 'dark' ? theme.colors.primary : theme.colors.secondary}
          trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
        />
      </View>

      <View style={[styles.option, { borderBottomColor: theme.colors.borderColor }]}>
        <Text style={[styles.optionText, { color: theme.colors.text }]}>{t('Budgets')}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Budget')}
          style={styles.manageButton}
          accessibilityRole="button"
          accessibilityLabel={t('Manage budgets')}
        >
          <Text style={[styles.manageText, { color: theme.colors.primary }]}>{t('Manage')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.option, { borderBottomColor: theme.colors.borderColor }]}>
        <Text style={[styles.optionText, { color: theme.colors.text }]}>{t('AI API Key')}</Text>
        {!hasApiKey ? (
          <View style={styles.rowCenter}>
            <TextInput
              placeholder={t('enter_api_key') || 'Enter API key'}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry
              style={[styles.apiInput, { color: theme.colors.text, borderColor: theme.colors.borderColor }]}
              accessibilityLabel={t('Enter API Key')}
            />
                    <TouchableOpacity onPress={handleSaveApiKey} style={styles.saveKeyBtn} accessibilityRole="button">
              <Text style={styles.saveKeyText}>{isSavingKey ? '...' : (t('Save Key') || 'Save')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.rowCenter}>
            <Text style={[styles.apiKeyConfiguredText, { color: theme.colors.text }]}>{t('api_key_configured') || 'Configured'}</Text>
            <TouchableOpacity onPress={handleRemoveApiKey} style={styles.removeKeyBtn} accessibilityRole="button">
              <Text style={[styles.removeKeyText, { color: theme.colors.primary }]}>{t('Remove Key')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  apiInput: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, marginRight: 8, padding: 8, width: 200 },
  apiKeyConfiguredText: { marginRight: 12 },
  container: {
    flex: 1,
    padding: 16,
  },
  dropdown: {
    height: 50,
    width: 150,
  },
  headerAction: { padding: 8 },
  headerActionText: { fontWeight: '700' },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  manageButton: { padding: 8 },
  manageText: { fontWeight: '700' },
  option: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
  },
  removeKeyBtn: { padding: 8 },
  removeKeyText: { fontWeight: '700' },
  rowCenter: { alignItems: 'center', flexDirection: 'row' },
  saveKeyBtn: { padding: 8 },
  saveKeyText: { color: '#0d9488', fontWeight: '700' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});

export default ProfileSettingsView;

