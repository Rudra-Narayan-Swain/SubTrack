import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { signIn } from '../../firebase/auth';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

export const LoginScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handle = async () => {
        if (!email.trim() || !password) { setError('Please fill in all fields'); return; }
        setError(''); setLoading(true);
        try { await signIn(email.trim(), password); }
        catch (e: any) { setError(e.message || 'Sign in failed'); }
        finally { setLoading(false); }
    };

    return (
        <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
                {/* Logo */}
                <View style={s.logoWrap}>
                    <View style={s.logo}><Text style={s.logoText}>S</Text></View>
                    <Text style={s.appName}>Subtrack</Text>
                </View>

                <Text style={s.title}>Welcome back</Text>
                <Text style={s.sub}>Sign in to manage your subscriptions</Text>

                {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

                {/* Email */}
                <View style={s.field}>
                    <MaterialCommunityIcons name="email-outline" size={20} color="rgba(255,255,255,0.35)" style={s.icon} />
                    <TextInput style={s.input} placeholder="Email address" placeholderTextColor="rgba(255,255,255,0.25)"
                        value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                </View>

                {/* Password */}
                <View style={s.field}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color="rgba(255,255,255,0.35)" style={s.icon} />
                    <TextInput style={s.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.25)"
                        value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
                    <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                        <MaterialCommunityIcons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255,255,255,0.35)" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={s.forgot} onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={s.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handle} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
                </TouchableOpacity>

                <View style={s.footer}>
                    <Text style={s.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={s.link}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#07080f' },
    scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    logoWrap: { alignItems: 'center', marginBottom: 32 },
    logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#5b5fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#5b5fff', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16 },
    logoText: { fontSize: 36, fontWeight: '800', color: '#fff' },
    appName: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: 1 },
    title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 6 },
    sub: { fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 28 },
    errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
    errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
    field: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', height: 54, paddingHorizontal: 14, marginBottom: 14 },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#fff', fontSize: 15 },
    eyeBtn: { padding: 6 },
    forgot: { alignSelf: 'flex-end', marginBottom: 22 },
    forgotText: { color: '#5b5fff', fontSize: 13, fontWeight: '500' },
    btn: { backgroundColor: '#5b5fff', height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#5b5fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: { color: 'rgba(255,255,255,0.45)', fontSize: 15 },
    link: { color: '#5b5fff', fontSize: 15, fontWeight: '600' },
});
