import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { signUp, updateUserProfile } from '../../firebase/auth';
import { getDb } from '../../firebase/firebaseConfig';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export const RegisterScreen = ({ navigation }: Props) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handle = async () => {
        if (!name.trim() || !email.trim() || !password) { setError('Please fill in all fields'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setError(''); setLoading(true);
        try {
            const cred = await signUp(email.trim(), password);
            await updateUserProfile(cred.user, { displayName: name.trim() });
            const now = new Date().toISOString();
            await setDoc(doc(getDb(), 'users', cred.user.uid), {
                uid: cred.user.uid, name: name.trim(), email: email.trim(),
                status: 'pending',
                notificationPrefs: { reminders: true, paymentConfirmations: true, broadcasts: true },
                createdAt: now, updatedAt: now,
            });
        } catch (e: any) {
            setError(e.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
                <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={s.title}>Create Account</Text>
                <Text style={s.sub}>Start tracking your subscriptions today</Text>

                {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

                {[
                    { icon: 'account-outline', placeholder: 'Full Name', value: name, set: setName, type: 'default' as const },
                    { icon: 'email-outline', placeholder: 'Email address', value: email, set: setEmail, type: 'email-address' as const },
                ].map(({ icon, placeholder, value, set, type }) => (
                    <View key={icon} style={s.field}>
                        <MaterialCommunityIcons name={icon as any} size={20} color="rgba(255,255,255,0.35)" style={s.icon} />
                        <TextInput style={s.input} placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.25)"
                            value={value} onChangeText={set} autoCapitalize={type === 'email-address' ? 'none' : 'words'}
                            keyboardType={type} />
                    </View>
                ))}

                <View style={s.field}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color="rgba(255,255,255,0.35)" style={s.icon} />
                    <TextInput style={s.input} placeholder="Password (min 6 chars)" placeholderTextColor="rgba(255,255,255,0.25)"
                        value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
                    <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                        <MaterialCommunityIcons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255,255,255,0.35)" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handle} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
                </TouchableOpacity>

                <View style={s.footer}>
                    <Text style={s.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.link}>Sign in</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#07080f' },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 56 },
    back: { marginBottom: 28 },
    title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
    sub: { fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 28 },
    errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
    errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
    field: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', height: 54, paddingHorizontal: 14, marginBottom: 14 },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#fff', fontSize: 15 },
    eyeBtn: { padding: 6 },
    btn: { backgroundColor: '#5b5fff', height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, shadowColor: '#5b5fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
    footerText: { color: 'rgba(255,255,255,0.45)', fontSize: 15 },
    link: { color: '#5b5fff', fontSize: 15, fontWeight: '600' },
});
