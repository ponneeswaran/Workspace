// ProfileSettingsView.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import { useApp } from '../contexts/AppContext';
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('Profile Settings')}</Text>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dropdown: {
    height: 50,
    width: 150,
  },
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});

export default ProfileSettingsView;

