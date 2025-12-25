import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { version } from '../package.json';

const TermsScreen: React.FC = () => {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using Kanakkuvazhakku (&quot;the App&quot;), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use the App.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Privacy & Data Storage</Text>
          <View style={[styles.highlightBox, styles.tealBox]}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#0F766E" style={styles.highlightIcon} />
            <View style={styles.highlightTextContainer}>
              <Text style={[styles.highlightTitle, styles.tealTitle]}>Offline-First Policy</Text>
              <Text style={[styles.highlightText, styles.tealText]}>
                We prioritize your privacy. Your financial data (expenses, budgets, history) is stored <Text style={styles.boldText}>locally on your device</Text>. We do not store your personal expense records on our servers.
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            You are responsible for backing up your data. Uninstalling the app or clearing app data may result in the permanent loss of your records unless you have performed a manual export or sync (if available).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. AI Features & Usage</Text>
          <View style={[styles.highlightBox, styles.purpleBox]}>
            <Ionicons name="server-outline" size={24} color="#7C3AED" style={styles.highlightIcon} />
            <View style={styles.highlightTextContainer}>
              <Text style={[styles.highlightText, styles.purpleText]}>
                The App uses Google Gemini API to provide financial insights and natural language expense parsing.
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            When you use AI features (e.g., &quot;Magic Fill&quot; or &quot;Assistant&quot;), minimal necessary data (such as the text you type or a summary of recent spending) is sent to the AI provider for processing. This data is ephemeral and is not used to train public AI models by default, in accordance with the API provider&apos;s enterprise privacy policies.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Disclaimer</Text>
          <Text style={styles.paragraph}>
            The App is a financial tracking tool, not a financial advisor. Insights provided by the AI are for informational purposes only. Please consult a qualified financial professional for investment, tax, or legal advice. We are not liable for any financial decisions made based on the App&apos;s data or AI suggestions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. User Account & Security</Text>
          <View style={styles.securityContainer}>
            <Ionicons name="lock-closed-outline" size={16} color="#6B7280" style={styles.securityIcon}/>
            <Text style={styles.paragraph}>
              You are responsible for maintaining the confidentiality of your device, PIN, or password used to access the App. 
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.footerText}>Version {version}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    paddingTop: 32,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  headerTitle: {
    color: '#1E293B',
    fontSize: 20,
    fontWeight: 'bold',
  },
  highlightBox: {
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
  },
  highlightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  highlightText: {
    fontSize: 12,
    lineHeight: 18,
  },
  highlightTextContainer: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  paragraph: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
  },
  purpleBox: {
    backgroundColor: '#FAF5FF',
    borderColor: '#F3E8FF',
  },
  purpleText: {
    color: '#5B21B6',
  },
  scrollContent: {
    padding: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  securityContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  securityIcon: {
    marginRight: 8,
    marginTop: 4,
  },
  tealBox: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  tealText: {
    color: '#134E4A',
  },
  tealTitle: {
    color: '#115E59',
  },
});

export default TermsScreen;
