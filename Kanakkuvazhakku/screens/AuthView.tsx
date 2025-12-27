import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ArrowRight, Smartphone, Lock, ArrowLeft, CheckCircle2, Fingerprint, User, Upload, Clock, Trash2 } from 'lucide-react-native';
import { getLocalBackups, deleteLocalBackup, LocalBackup } from '../utils/storage';
import { useTranslation } from 'react-i18next';

// Mock functions and data for now - you'll replace these with your actual context/services
const useData = () => ({
  login: async (id: string, pass: string) => { console.log('login', id, pass); return true; },
  startSignup: (id: string) => { console.log('signup', id); return true; },
  checkUserExists: (id: string) => { console.log('checkUserExists', id); return false; },
  resetPassword: (id: string, pass: string) => { console.log('resetPassword', id, pass); return true; },
  checkBiometricAvailability: (id: string) => { console.log('checkBiometric', id); return true; },
  verifyBiometricLogin: async (id: string) => { console.log('verifyBiometric', id); return true; },
  restoreUserFromBackup: async (file: unknown, pass: unknown) => { console.log('restore', file, pass); return true; },
  getLocalBackups: getLocalBackups, // Use actual function
  deleteLocalBackup: deleteLocalBackup, // Use actual function
});

// Mock OTPScreen
const OTPScreen = ({ onVerify, onBack }: { onVerify: () => void, onBack: () => void }) => (
    <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.otpBackButton}><ArrowLeft size={24} color="#334155" /></TouchableOpacity>
        <Text style={styles.title}>OTP Screen</Text>
        <TouchableOpacity style={styles.button} onPress={onVerify}><Text style={styles.buttonText}>Verify OTP</Text></TouchableOpacity>
    </View>
);
type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main' | 'Terms'>;
const AuthView: React.FC = () => {
    const { login, startSignup, checkUserExists, resetPassword, checkBiometricAvailability, verifyBiometricLogin, getLocalBackups, deleteLocalBackup } = useData();
    const { t, i18n } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    
    // Forgot Password Flow State
    const [viewState, setViewState] = useState<'login' | 'forgot_input' | 'otp' | 'reset' | 'success'>('login');
    const [resetIdentifier, setResetIdentifier] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
    const [canUseBiometric, setCanUseBiometric] = useState(false);
  
    // Backup Restore State
    const [isRestoring, ] = useState(false);
    const [localBackups, setLocalBackups] = useState<LocalBackup[]>([]);
  
    const navigation = useNavigation<AuthScreenNavigationProp>();
    
    // Mocks for web-specific features
    const onLoginSuccess = (identifier: string) => {
        console.log("Login success for:", identifier);
        // navigation.navigate('Main'); // Or wherever you want to go
    };
    
    const onShowTerms = () => navigation.navigate('Terms');
    
    useEffect(() => {
        const loadBackups = async () => {
            if (isNewUser) {
                setLocalBackups(await getLocalBackups());
            }
        };
        loadBackups();
    }, [isNewUser]);
  
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue.length > 5) {
                setCanUseBiometric(checkBiometricAvailability(inputValue));
            } else {
                setCanUseBiometric(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);
  
    const validateIdentifier = (id: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const digits = id.replace(/\D/g, '');
        return emailRegex.test(id) || digits.length >= 10;
    }
  
    const validate = () => {
        if (!validateIdentifier(inputValue)) {
            setError(t('Please enter a valid mobile number or email address.'));
            return false;
        }
        if (!isNewUser && viewState === 'login' && !password) {
            setError(t('Password is required.'));
            return false;
        }
        return true;
    }
  
    const handleSubmit = async () => {
      setError('');
      if (!inputValue) {
          setError(t('This field is required.'));
          return;
      }
      if (!validate()) return;
      const identifier = inputValue.trim();
  
      if (isNewUser) {
          const success = startSignup(identifier);
          if (success) {
              onLoginSuccess(identifier);
          } else {
              setError(t('User already exists'));
          }
      } else {
          const userExists = checkUserExists(identifier);
          if (!userExists) {
              setError(t('User not found'));
              return;
          }
          const success = await login(identifier, password);
          if (success) {
              onLoginSuccess(identifier);
          } else {
              setError(t('Invalid credentials'));
          }
      }
    };
  
    const handleBiometricLogin = async () => {
        const identifier = inputValue.trim();
        const success = await verifyBiometricLogin(identifier);
        if (success) {
            onLoginSuccess(identifier);
        } else {
            setError(t('biometric_login_failed'));
        }
    }
  
    const handleForgotPasswordClick = () => {
      setResetIdentifier('');
      setError('');
      setViewState('forgot_input');
    };
  
    const handleSendOtp = async () => {
      setError('');
      if (!validateIdentifier(resetIdentifier)) {
          setError(t('Please enter a valid mobile number or email address.'));
          return;
      }
      if (!checkUserExists(resetIdentifier)) {
          setError(t('User not found'));
          return;
      }
      setIsSendingOtp(true);
      try {
          await new Promise(res => setTimeout(res, 1000)); // Mock sending OTP
          setViewState('otp');
      } catch {
          setError('Failed to send OTP. Please try again.');
      } finally {
          setIsSendingOtp(false);
      }
    };
  
    const handleInputChange = (text: string) => {
        setInputValue(text);
        if (error) setError('');
    };
  
    const toggleMode = () => {
        setIsNewUser(!isNewUser);
        setError('');
        setPassword('');
    }
  
    const handleOTPVerify = () => setViewState('reset');
  
    const handleResetSubmit = () => {
        if (newPassword !== confirmNewPassword) {
            setError(t('passwords_mismatch'));
            return;
        }
        const success = resetPassword(resetIdentifier, newPassword);
        if (success) {
            setViewState('success');
        } else {
            setError('Failed to reset password');
        }
    }

    const handleRestoreClick = () => Alert.alert("Restore", "File picker not implemented yet.");

    if (viewState === 'forgot_input') {
        return (
          <View style={styles.container}>
              <TouchableOpacity onPress={() => setViewState('login')} style={styles.forgotInputBackButton}><ArrowLeft size={24} color="#334155" /></TouchableOpacity>
              <Text style={styles.title}>{t('forgot_password')}</Text>
              <Text style={styles.subtitle}>{t('enter_your_identifier_to_reset_password')}</Text>
              <View style={styles.inputWrapper}>
                  <User style={styles.inputIcon} size={18} color="#94A3B8" />
                  <TextInput
                      value={resetIdentifier}
                      onChangeText={(text) => { setResetIdentifier(text); if(error) setError(''); }}
                      style={styles.input}
                      placeholder={t('enter_mobile_or_email')}
                      autoFocus
                  />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <TouchableOpacity onPress={handleSendOtp} disabled={isSendingOtp} style={styles.button}>
                  {isSendingOtp ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('send_otp')}</Text>}
              </TouchableOpacity>
          </View>
        );
    }
    if (viewState === 'otp') {
        return <OTPScreen onVerify={handleOTPVerify} onBack={() => setViewState('forgot_input')} />;
    }
    if (viewState === 'reset') {
        return (
          <View style={styles.container}>
              <TouchableOpacity onPress={() => setViewState('login')} style={styles.forgotInputBackButton}><ArrowLeft size={24} color="#334155" /></TouchableOpacity>
              <Text style={styles.title}>{t('reset_password')}</Text>
              <View style={styles.inputWrapper}>
                  <Lock style={styles.inputIcon} size={18} color="#94A3B8" />
                  <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      style={styles.input}
                      placeholder="••••••••"
                      secureTextEntry
                  />
              </View>
              <View style={styles.inputWrapper}>
                  <Lock style={styles.inputIcon} size={18} color="#94A3B8" />
                  <TextInput
                      value={confirmNewPassword}
                      onChangeText={setConfirmNewPassword}
                      style={styles.input}
                      placeholder="••••••••"
                      secureTextEntry
                  />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <TouchableOpacity onPress={handleResetSubmit} style={styles.button}>
                  <Text style={styles.buttonText}>{t('reset_password')}</Text>
              </TouchableOpacity>
          </View>
        );
    }
    if (viewState === 'success') {
        return (
           <View style={[styles.container, styles.successContainer]}>
               <View style={styles.successBox}>
                   <View style={styles.successIconWrapper}>
                       <CheckCircle2 size={32} color="#22C55E" />
                   </View>
                   <Text style={styles.title}>{t('password_reset_successfully')}</Text>
                   <Text style={styles.subtitle}>{t('you_can_now_login_with_your_new_password')}</Text>
                   <TouchableOpacity 
                      onPress={() => {
                          setViewState('login');
                          setNewPassword('');
                          setConfirmNewPassword('');
                          setPassword('');
                          setInputValue('');
                      }}
                      style={styles.button}
                   >
                       <Text style={styles.buttonText}>{t('back_to_login')}</Text>
                   </TouchableOpacity>
               </View>
           </View>
        )
    }
  
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.mainTitleContainer}>
              <Text style={styles.title}>{isNewUser ? t('create_your_account') : t('welcome')}</Text>
              <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
          </View>
          <View style={styles.languageSwitcher}>
            <Button title="English" onPress={() => i18n.changeLanguage('en')} />
            <Button title="தமிழ்" onPress={() => i18n.changeLanguage('ta')} />
          </View>
  
          {isNewUser && (
              <View style={styles.newUserContainer}>
                  <View style={styles.backupBox}>
                      <View style={styles.backupBoxInner}>
                          <View style={styles.backupIconWrapper}><Upload size={20} color="#14B8A6" /></View>
                          <View>
                              <Text style={styles.backupTitle}>{t('already_have_a_backup')}</Text>
                              <Text style={styles.backupSubtitle}>{t('restore_account_from_kbf_file')}</Text>
                          </View>
                      </View>
                      <TouchableOpacity onPress={handleRestoreClick} disabled={isRestoring} style={styles.importButton}>
                          {isRestoring ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.importButtonText}>{t('import')}</Text>}
                      </TouchableOpacity>
                  </View>
  
                  {localBackups.length > 0 && (
                      <View>
                          <View style={styles.localBackupsHeaderContainer}>
                              <Smartphone size={14} color="#64748B" />
                              <Text style={styles.localBackupHeader}>{t('recent_device_backups')}</Text>
                          </View>
                          <View style={styles.localBackupsList}>
                              {localBackups.map(backup => (
                                  <View key={backup.id} style={styles.localBackupItem}>
                                      <View style={styles.localBackupItemInner}>
                                          <View style={styles.localBackupIconWrapper}><Clock size={16} color="#64748B" /></View>
                                          <View>
                                              <Text style={styles.localBackupDate}>{new Date(backup.date).toLocaleDateString()}</Text>
                                              <Text style={styles.localBackupMeta}>{backup.userName} • {(backup.size / 1024).toFixed(1)} KB</Text>
                                          </View>
                                      </View>
                                      <View style={styles.localBackupActions}>
                                          <TouchableOpacity onPress={async () => {
                                              await deleteLocalBackup(backup.id);
                                              setLocalBackups(prev => prev.filter(b => b.id !== backup.id));
                                          }}><Trash2 size={16} color="#94A3B8" /></TouchableOpacity>
                                          <TouchableOpacity onPress={() => Alert.alert("Restore", `Restore ${backup.id}?`)} style={styles.restoreButton}><Text style={styles.restoreButtonText}>{t('restore')}</Text></TouchableOpacity>
                                      </View>
                                  </View>
                              ))}
                          </View>
                      </View>
                  )}
              </View>
          )}
  
          <View>
              <Text style={styles.label}>{t('mobile_number_or_email')}</Text>
              <View style={styles.inputWrapper}>
                  <User style={styles.inputIcon} size={18} color="#94A3B8" />
                  <TextInput
                      value={inputValue}
                      onChangeText={handleInputChange}
                      placeholder={t('enter_mobile_or_email')}
                      style={[styles.input, error ? styles.inputError : {}]}
                      keyboardType="email-address"
                  />
              </View>
          </View>
  
          {!isNewUser && (
              <View>
                  <Text style={styles.label}>{t('password')}</Text>
                  <View style={styles.inputWrapper}>
                      <Lock style={styles.inputIcon} size={18} color="#94A3B8" />
                      <TextInput
                          value={password}
                          onChangeText={(text) => { setPassword(text); setError(''); }}
                          placeholder="••••••••"
                          secureTextEntry
                          style={[styles.input, error ? styles.inputError : {}]}
                      />
                       {canUseBiometric && (
                          <TouchableOpacity onPress={handleBiometricLogin} style={styles.biometricButton}>
                              <Fingerprint size={20} color="#14B8A6" />
                          </TouchableOpacity>
                      )}
                  </View>
                  <TouchableOpacity onPress={handleForgotPasswordClick} style={styles.forgotPasswordButton}>
                      <Text style={styles.linkText}>{t('forgot_password')}</Text>
                  </TouchableOpacity>
              </View>
          )}
  
          {error && <Text style={styles.errorText}>{error}</Text>}
  
          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>{isNewUser ? t('get_started') : t('login')}</Text>
              {!isNewUser && <ArrowRight size={20} color="#fff" />}
          </TouchableOpacity>
  
          <TouchableOpacity onPress={toggleMode} style={styles.toggleModeButton}>
              <Text style={styles.linkText}>{isNewUser ? t('already_have_an_account') : t('dont_have_an_account')}</Text>
          </TouchableOpacity>
  
          <Text style={styles.termsText}>
              {t('by_continuing_you_agree_to_our')}
              <Text onPress={onShowTerms} style={styles.linkText}>{t('terms_of_service')}</Text>
              {t('and')}
              <Text onPress={onShowTerms} style={styles.linkText}>{t('privacy_policy')}</Text>.
          </Text>
        </View>
      </ScrollView>
    );
};
const styles = StyleSheet.create({
    backupBox: {
        alignItems: 'center',
        backgroundColor: '#F0FDFA',
        borderColor: '#CCFBF1',
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    backupBoxInner: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    backupIconWrapper: {
        backgroundColor: '#CCFBF1',
        borderRadius: 999,
        padding: 8,
    },
    backupSubtitle: {
        color: '#115E59',
        fontSize: 12,
    },
    backupTitle: {
        color: '#134E4A',
        fontSize: 14,
        fontWeight: 'bold',
    },
    biometricButton: {
        position: 'absolute',
        right: 12,
        top: 12,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#0D9488',
        borderRadius: 12,
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    container: {
        backgroundColor: '#F8FAFC',
        flex: 1,
        padding: 24,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginBottom: 8,
        marginTop: -8,
    },
    forgotInputBackButton: {
        alignSelf: 'flex-start',
        marginBottom: 20,
        padding: 8,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    importButton: {
        backgroundColor: '#0D9488',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    importButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    innerContainer: {
        backgroundColor: '#F8FAFC',
        padding: 24,
    },
    input: {
        color: '#1E293B',
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    inputIcon: {
        marginLeft: 12,
    },
    inputWrapper: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        marginBottom: 16,
    },
    label: {
        color: '#334155',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    languageSwitcher: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16
    },
    linkText: {
        color: '#0D9488',
        fontWeight: '500',
    },
    localBackupActions: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    localBackupDate: {
        color: '#1E293B',
        fontSize: 14,
        fontWeight: '600',
    },
    localBackupHeader: {
        color: '#64748B',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    localBackupIconWrapper: {
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 999,
        height: 32,
        justifyContent: 'center',
        width: 32,
    },
    localBackupItem: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#F1F5F9',
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
    },
    localBackupItemInner: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    localBackupMeta: {
        color: '#94A3B8',
        fontSize: 12,
    },
    localBackupsHeaderContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    localBackupsList: {
        gap: 8,
    },
    mainTitleContainer: {
        marginBottom: 32,
    },
    newUserContainer: {
        gap: 12,
        marginBottom: 32,
    },
    otpBackButton: {
        alignSelf: 'flex-start',
        padding: 8,
    },
    restoreButton: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    restoreButtonText: {
        color: '#334155',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    subtitle: {
        color: '#64748B',
        fontSize: 16,
        marginBottom: 16,
    },
    successBox: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        width: '100%',
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIconWrapper: {
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        borderRadius: 999,
        height: 64,
        justifyContent: 'center',
        marginBottom: 16,
        width: 64,
    },
    termsText: {
        color: '#94A3B8',
        fontSize: 12,
        lineHeight: 18,
        marginTop: 32,
        textAlign: 'center',
    },
    title: {
        color: '#1E293B',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    toggleModeButton: {
        alignItems: 'center',
        marginTop: 24,
    },
});

export default AuthView;