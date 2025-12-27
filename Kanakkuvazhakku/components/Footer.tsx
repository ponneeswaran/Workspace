import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, List, Wallet, Sparkles, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator'; // Adjust path as needed
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

// Assuming AddTransactionModal exists in the same components directory
// import AddTransactionModal from './AddTransactionModal';

import { Theme } from '../utils/theme';

interface FooterProps {
  activeTab: string;
  orientation: 'portrait' | 'landscape';
  theme: Theme;
}

type FooterNavigationProp = StackNavigationProp<RootStackParamList>;

const Footer: React.FC<FooterProps> = ({ activeTab, orientation, theme }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<FooterNavigationProp>();

  const containerStyle = orientation === 'portrait'
    ? [styles.containerPortrait, { backgroundColor: theme.colors.cardBackground, shadowColor: theme.colors.text }]
    : [styles.containerLandscape, { backgroundColor: theme.colors.cardBackground, borderLeftColor: theme.colors.borderColor }];
  const tabButtonStyle = orientation === 'portrait' ? styles.tabButtonPortrait : styles.tabButtonLandscape;

  return (
    <View style={containerStyle}>
      {/* Home */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Dashboard')}
        style={tabButtonStyle}
      >
        <Home 
          size={24} 
          strokeWidth={activeTab === 'Dashboard' ? 2.5 : 2}
          color={activeTab === 'Dashboard' ? theme.colors.primary : theme.colors.secondary}
        />
        <Text style={[styles.tabText, activeTab === 'Dashboard' ? { color: theme.colors.primary } : { color: theme.colors.secondary }]}>{t('Home')}</Text>
      </TouchableOpacity>

      {/* History */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Expenses')}
        style={tabButtonStyle}
      >
        <List 
          size={24} 
          strokeWidth={activeTab === 'Expenses' ? 2.5 : 2}
          color={activeTab === 'Expenses' ? theme.colors.primary : theme.colors.secondary}
        />
        <Text style={[styles.tabText, activeTab === 'Expenses' ? { color: theme.colors.primary } : { color: theme.colors.secondary }]}>{t('History')}</Text>
      </TouchableOpacity>

      {/* Center Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.background, shadowColor: theme.colors.text }]}
          accessibilityLabel="Add Transaction"
        >
          <Plus size={28} strokeWidth={2.5} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Income */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Income')}
        style={tabButtonStyle}
      >
        <Wallet 
          size={24} 
          strokeWidth={activeTab === 'Income' ? 2.5 : 2}
          color={activeTab === 'Income' ? theme.colors.primary : theme.colors.secondary}
        />
        <Text style={[styles.tabText, activeTab === 'Income' ? { color: theme.colors.primary } : { color: theme.colors.secondary }]}>{t('Income')}</Text>
      </TouchableOpacity>

      {/* Assistant */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Assistant')}
        style={tabButtonStyle}
      >
        <Sparkles 
          size={24} 
          strokeWidth={activeTab === 'Assistant' ? 2.5 : 2}
          color={activeTab === 'Assistant' ? theme.colors.primary : theme.colors.secondary}
        />
        <Text style={[styles.tabText, activeTab === 'Assistant' ? { color: theme.colors.primary } : { color: theme.colors.secondary }]}>{t('Assistant')}</Text>
      </TouchableOpacity>
      
      {/* Add Transaction Modal - Placeholder */}
      {/* {showAddModal && <AddTransactionModal onClose={() => setShowAddModal(false)} initialTab={activeTab === 'income' ? 'income' : 'expense'} />} */}
    </View>
  );
};

const styles = StyleSheet.create({
  activeTabText: {},
  addButton: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 4,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    width: 56,
  },
  addButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  containerLandscape: {
    alignItems: 'center',
    borderLeftWidth: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 20,
    width: 80,
  },
  containerPortrait: {
    alignItems: 'center',
    borderRadius: 30,
    bottom: -10,
    elevation: 8,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around',
    left: 20,
    paddingHorizontal: 6,
    position: 'absolute',
    right: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  inactiveTabText: {},
  tabButtonLandscape: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  tabButtonPortrait: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },

});

Footer.propTypes = {
  activeTab: PropTypes.string.isRequired,
  orientation: PropTypes.oneOf(['portrait', 'landscape']).isRequired,
  theme: PropTypes.object.isRequired,
};

export default Footer;
