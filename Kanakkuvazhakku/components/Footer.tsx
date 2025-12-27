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

interface FooterProps {
  activeTab: string;
  orientation: 'portrait' | 'landscape';
}

type FooterNavigationProp = StackNavigationProp<RootStackParamList>;

const Footer: React.FC<FooterProps> = ({ activeTab, orientation }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<FooterNavigationProp>();

  const containerStyle = orientation === 'portrait' ? styles.containerPortrait : styles.containerLandscape;
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
          strokeWidth={activeTab === 'dashboard' ? 2.5 : 2}
          color={activeTab === 'dashboard' ? '#0D9488' : '#6B7280'} // teal-600 vs gray-400
        />
        <Text style={[styles.tabText, activeTab === 'dashboard' ? styles.activeTabText : styles.inactiveTabText]}>{t('Home')}</Text>
      </TouchableOpacity>

      {/* History */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Expenses')}
        style={tabButtonStyle}
      >
        <List 
          size={24} 
          strokeWidth={activeTab === 'expenses' ? 2.5 : 2}
          color={activeTab === 'expenses' ? '#0D9488' : '#6B7280'}
        />
        <Text style={[styles.tabText, activeTab === 'expenses' ? styles.activeTabText : styles.inactiveTabText]}>{t('History')}</Text>
      </TouchableOpacity>

      {/* Center Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity 
          style={styles.addButton}
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
          strokeWidth={activeTab === 'income' ? 2.5 : 2}
          color={activeTab === 'income' ? '#0D9488' : '#6B7280'}
        />
        <Text style={[styles.tabText, activeTab === 'income' ? styles.activeTabText : styles.inactiveTabText]}>{t('Income')}</Text>
      </TouchableOpacity>

      {/* Assistant */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Assistant')}
        style={tabButtonStyle}
      >
        <Sparkles 
          size={24} 
          strokeWidth={activeTab === 'ai' ? 2.5 : 2}
          color={activeTab === 'ai' ? '#0D9488' : '#6B7280'}
        />
        <Text style={[styles.tabText, activeTab === 'ai' ? styles.activeTabText : styles.inactiveTabText]}>{t('Assistant')}</Text>
      </TouchableOpacity>
      
      {/* Add Transaction Modal - Placeholder */}
      {/* {showAddModal && <AddTransactionModal onClose={() => setShowAddModal(false)} initialTab={activeTab === 'income' ? 'income' : 'expense'} />} */}
    </View>
  );
};

const styles = StyleSheet.create({
  activeTabText: {
    color: '#0D9488', // teal-600
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#0D9488',
    borderColor: '#F8FAFC',
    borderRadius: 28,
    borderWidth: 4,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#000',
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
    backgroundColor: '#FFFFFF',
    borderLeftColor: '#E2E8F0',
    borderLeftWidth: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 20,
    width: 80,
  },
  containerPortrait: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    elevation: 5,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inactiveTabText: {
    color: '#6B7280', // gray-400
  },
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
};

export default Footer;
