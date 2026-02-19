import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../utils/useAuth';
import { saveLocalBackup } from '../utils/storage';
import type { LocalBackup } from '../types';
import EncryptionModal from '../components/EncryptionModal';
import * as FileSystem from 'expo-file-system';
import { Share } from 'react-native';

export default function AccountView() {
  const { t } = useTranslation();
  const { state } = useApp();
  const { storedUser } = useAuth();
  const [showEncryption, setShowEncryption] = useState(false);

  const handleExportCSV = async () => {
    try {
      const rows = [['id','date','category','description','amount','paymentMethod']];
      state.expenses.forEach(e => rows.push([e.id, e.date, e.category, e.description, e.amount.toString(), e.paymentMethod || '']));
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');

      const cacheDir = (FileSystem as unknown as { cacheDirectory?: string }).cacheDirectory ?? '';
      const path = cacheDir + `kanakku_expenses_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(path, csv);

      await Share.share({ url: path, title: t('Expense Report') });
    } catch (err) {
      console.error(err);
      Alert.alert(t('Export Failed') || 'Export failed');
    }
  }; 

  const handleBackup = async (password?: string) => {
    try {
      const raw = JSON.stringify({ expenses: state.expenses, incomes: state.incomes, budgets: state.budgets, user: storedUser });

      // encrypt if password provided
      const { encryptBackup } = await import('../utils/crypto');
      const contentToWrite = password ? encryptBackup(raw, password) : raw;

      const cacheDir = (FileSystem as unknown as { cacheDirectory?: string }).cacheDirectory ?? '';
      const timestamp = Date.now();
      const path = cacheDir + `kanakku_backup_${timestamp}.kbf`;
      await FileSystem.writeAsStringAsync(path, contentToWrite);

      // record a local backup entry (so it appears in "Recent Device Backups")
      const info = await FileSystem.getInfoAsync(path);
      const size = 'size' in info && typeof (info as { size?: number }).size === 'number' ? (info as { size: number }).size : contentToWrite.length;
      const backupMeta: LocalBackup = {
        id: String(timestamp),
        date: new Date(timestamp).toISOString(),
        userName: storedUser?.name || state.user?.name || 'You',
        content: contentToWrite,
        size,
      };
      await saveLocalBackup(backupMeta);

      await Share.share({ url: path, title: t('Backup Data') });
    } catch (err) {
      console.error(err);
      Alert.alert(t('Backup Failed') || 'Backup failed');
    } finally {
      setShowEncryption(false);
    }
  }; 

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>{t('Account')}</Text></View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => setShowEncryption(true)} accessibilityRole="button" accessibilityLabel={t('Backup Data') || 'Backup Data'}>
          <View>
            <Text style={styles.cardTitle}>{t('Backup Data')}</Text>
            <Text style={styles.cardSubtitle}>{t('backup_desc') || 'Create an encrypted backup of your data'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleExportCSV} accessibilityRole="button" accessibilityLabel={t('Export CSV') || 'Export CSV'}>
          <View>
            <Text style={styles.cardTitle}>{t('Export CSV')}</Text>
            <Text style={styles.cardSubtitle}>{t('export_desc') || 'Export your expenses as CSV'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <EncryptionModal isOpen={showEncryption} mode="encrypt" onClose={() => setShowEncryption(false)} onConfirm={handleBackup} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginTop: 8, padding: 8 },
  cardSubtitle: { color: '#6b7280', marginTop: 6 },
  cardTitle: { fontWeight: '700' },
  container: { backgroundColor: '#F8FAFC', flex: 1, padding: 16 },
  header: { paddingBottom: 12 },
  row: { borderBottomWidth: 1, borderColor: '#eee', padding: 12 },
  title: { fontSize: 24, fontWeight: '700' },
});