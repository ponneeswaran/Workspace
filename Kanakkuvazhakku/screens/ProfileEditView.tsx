import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../utils/useAuth';
import ImageCropper from '../components/ImageCropper';
import { useTranslation } from 'react-i18next';

const ProfileEditView: React.FC = () => {
  const { t } = useTranslation();
  const { storedUser, updateProfile } = useAuth();
  const { dispatch } = useApp();

  const [name, setName] = useState(storedUser?.name || '');
  const [preview, setPreview] = useState<string | undefined>(storedUser?.profilePicture);
  const [croppingUri, setCroppingUri] = useState<string | null>(null);

  useEffect(() => {
    setName(storedUser?.name || '');
    setPreview(storedUser?.profilePicture);
  }, [storedUser]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled && 'assets' in res && res.assets && res.assets.length > 0) {
      setCroppingUri(res.assets[0].uri);
    }
  };

  const handleCrop = async (uri: string) => {
    setPreview(uri);
    setCroppingUri(null);
  };

  const handleSave = async () => {
    // update secure stored user
    const success = await updateProfile({ name: name.trim(), profilePicture: preview });
    if (success) {
      // Also update AppContext user for UI
      dispatch({ type: 'SET_USER', payload: { name: name.trim(), email: storedUser?.email || '', phone: storedUser?.mobile || '', currency: storedUser?.currency || '₹' } });
      Alert.alert(t('Saved') || 'Saved');
    } else {
      Alert.alert(t('Save Failed') || 'Failed to save profile');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('Edit Profile')}</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} accessibilityRole="button" accessibilityLabel={t('Change profile picture') || 'Change profile picture'}>
          {preview ? <Image source={{ uri: preview }} style={styles.avatar} accessibilityLabel={t('Profile picture') || 'Profile picture'} /> : <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitialText}>{name ? name.charAt(0).toUpperCase() : 'U'}</Text></View>}
        </TouchableOpacity>

        <Text style={styles.label}>{t('Full Name')}</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder={t('name_placeholder')} accessibilityLabel={t('Full Name') || 'Full Name'} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} accessibilityRole="button" accessibilityLabel={t('Save Changes') || 'Save Changes'}><Text style={styles.saveText}>{t('Save Changes') || 'Save Changes'}</Text></TouchableOpacity>
      </View>

      {croppingUri && <ImageCropper imageUri={croppingUri} onCancel={() => setCroppingUri(null)} onCrop={handleCrop} />}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: { backgroundColor: '#eee', borderRadius: 48, height: 96, width: 96 },
  avatarInitialText: { color: '#fff', fontWeight: '700' },
  avatarPlaceholder: { alignItems: 'center', backgroundColor: '#0f766e', borderRadius: 48, height: 96, justifyContent: 'center', width: 96 },
  avatarWrapper: { alignItems: 'center', marginBottom: 16 },
  container: { backgroundColor: '#F8FAFC', flex: 1 },
  content: { padding: 16 },
  header: { padding: 16 },
  input: { backgroundColor: '#fff', borderColor: '#e6e9ee', borderRadius: 10, borderWidth: 1, padding: 12 },
  label: { color: '#6b7280', marginBottom: 6, marginTop: 8 },
  saveBtn: { alignItems: 'center', backgroundColor: '#0d9488', borderRadius: 10, marginTop: 20, padding: 14 },
  saveText: { color: '#fff', fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700' },
});

export default ProfileEditView;