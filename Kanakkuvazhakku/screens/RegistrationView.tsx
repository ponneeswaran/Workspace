import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Globe, DollarSign, Check, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Dropdown } from 'react-native-element-dropdown';

type RegistrationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const RegistrationView: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<RegistrationScreenNavigationProp>();

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [language, setLanguage] = useState('en');
    const [currency, setCurrency] = useState('₹');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
    
    const [errors, setErrors] = useState<{name?: string, mobile?: string, email?: string, password?: string, confirmPassword?: string}>({});

    const languages = [
        { label: 'English', value: 'en' },
        { label: 'தமிழ்', value: 'ta' },
    ];

    const currencies = [
        { label: 'INR (₹)', value: '₹' },
        { label: 'USD ($)', value: '$' },
        { label: 'EUR (€)', value: '€' },
        { label: 'GBP (£)', value: '£' },
        { label: 'JPY (¥)', value: '¥' },
    ];

    const passwordChecks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[$!@#_&]/.test(password)
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!mobile.trim()) newErrors.mobile = 'Mobile number is required';
        if (!email.trim()) {
            newErrors.email = t('email_required');
        } else if (!email.includes('@')) {
            newErrors.email = 'Invalid email';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else {
            if (!passwordChecks.length || !passwordChecks.upper || !passwordChecks.number || !passwordChecks.special) {
                newErrors.password = t('Password too weak');
            }
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = t('passwords_mismatch');
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            // completeOnboarding({ name, mobile, email, language, currency, password });
            navigation.navigate('Main');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('create_your_account')}</Text>
                    <Text style={styles.subtitle}>{t('onboarding_subtitle')}</Text>
                </View>

                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('Full Name')} <Text style={styles.required}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.name ? styles.inputError : {}]}>
                            <User style={styles.icon} size={18} color="#94A3B8" />
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                                placeholder={t('name_placeholder')}
                            />
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Mobile */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('Mobile Number')} <Text style={styles.required}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.mobile ? styles.inputError : {}]}>
                            <Phone style={styles.icon} size={18} color="#94A3B8" />
                            <TextInput
                                value={mobile}
                                onChangeText={setMobile}
                                style={styles.input}
                                placeholder="+91 99999 99999"
                                keyboardType="phone-pad"
                            />
                        </View>
                        {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('Email Address')} <Text style={styles.required}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.email ? styles.inputError : {}]}>
                            <Mail style={styles.icon} size={18} color="#94A3B8" />
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                placeholder="you@example.com"
                                keyboardType="email-address"
                            />
                        </View>
                        {errors.email ? (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        ) : (
                            <Text style={styles.helperText}>{t('email_backup_note')}</Text>
                        )}
                    </View>

                    {/* Passwords */}
                    <View style={styles.passwordContainer}>
                        <View style={styles.passwordInputGroup}>
                            <Text style={styles.label}>{t('Password')} <Text style={styles.required}>*</Text></Text>
                            <View style={[styles.inputContainer, errors.password ? styles.inputError : {}]}>
                                <Lock style={styles.icon} size={18} color="#94A3B8" />
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setShowTooltip(true)}
                                    onBlur={() => setShowTooltip(false)}
                                    style={styles.input}
                                    placeholder="••••••"
                                    secureTextEntry
                                />
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>
                        <View style={styles.passwordInputGroup}>
                            <Text style={styles.label}>{t('Confirm Password')} <Text style={styles.required}>*</Text></Text>
                            <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : {}]}>
                                <Lock style={styles.icon} size={18} color="#94A3B8" />
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    style={styles.input}
                                    placeholder="••••••"
                                    secureTextEntry
                                />
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </View>
                    </View>

                    {showTooltip && (
                        <View style={styles.tooltip}>
                            <Text style={styles.tooltipTitle}>{t('Password Requirements')}:</Text>
                            <View style={styles.tooltipList}>
                                <Text style={[styles.tooltipItem, passwordChecks.length ? styles.valid : {}]}>✓ {t('At least 8 characters')}</Text>
                                <Text style={[styles.tooltipItem, passwordChecks.upper ? styles.valid : {}]}>✓ {t('One uppercase letter')}</Text>
                                <Text style={[styles.tooltipItem, passwordChecks.number ? styles.valid : {}]}>✓ {t('One number')}</Text>
                                <Text style={[styles.tooltipItem, passwordChecks.special ? styles.valid : {}]}>✓ {t('One special char ($!@#_&)')}</Text>
                            </View>
                        </View>
                    )}

                    {/* Language & Currency */}
                    <View style={styles.pickerRow}>
                        <View style={styles.pickerGroup}>
                            <Text style={styles.label}>{t('Language')}</Text>
                            <Dropdown
                                style={styles.dropdown}
                                data={languages}
                                labelField="label"
                                valueField="value"
                                value={language}
                                onChange={(item: { label: string; value: string }) => setLanguage(item.value)}
                                renderLeftIcon={() => <Globe style={styles.pickerIcon} size={18} color="#94A3B8" />}
                            />
                        </View>
                        <View style={styles.pickerGroup}>
                            <Text style={styles.label}>{t('Currency')}</Text>
                            <Dropdown
                                style={styles.dropdown}
                                data={currencies}
                                labelField="label"
                                valueField="value"
                                value={currency}
                                onChange={(item: { label: string; value: string }) => setCurrency(item.value)}
                                renderLeftIcon={() => <DollarSign style={styles.pickerIcon} size={18} color="#94A3B8" />}
                            />
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                        <Text style={styles.buttonText}>{t('Get Started')}</Text>
                        <Check size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
        flexGrow: 1,
    },
    dropdown: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderRadius: 12,
        borderWidth: 1,
        height: 50,
        paddingHorizontal: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginLeft: 4,
        marginTop: 4,
    },
    form: {
        gap: 16,
    },
    header: {
        marginBottom: 32,
    },
    helperText: {
        color: '#94A3B8',
        fontSize: 12,
        marginLeft: 4,
        marginTop: 4,
    },
    icon: {
        marginLeft: 12,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    input: {
        color: '#1E293B',
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    },
    inputContainer: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    inputGroup: {},
    label: {
        color: '#334155',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    passwordContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    passwordInputGroup: {
        flex: 1,
    },
    pickerGroup: {
        flex: 1,
    },
    pickerIcon: {
        marginRight: 10,
    },
    pickerRow: {
        flexDirection: 'row',
        gap: 16,
    },
    required: {
        color: '#EF4444',
    },
    subtitle: {
        color: '#64748B',
        fontSize: 16,
    },
    title: {
        color: '#1E293B',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    tooltip: {
        backgroundColor: '#1E293B',
        borderRadius: 8,
        marginBottom: 16,
        padding: 12,
    },
    tooltipItem: {
        color: '#94A3B8',
    },
    tooltipList: {
        gap: 6,
    },
    tooltipTitle: {
        borderBottomColor: '#475569',
        borderBottomWidth: 1,
        color: '#E2E8F0',
        fontWeight: 'bold',
        marginBottom: 8,
        paddingBottom: 4,
    },
    valid: {
        color: '#4ADE80',
    },
});

export default RegistrationView;
