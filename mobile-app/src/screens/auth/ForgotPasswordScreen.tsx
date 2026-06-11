import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { resetPassword } from '../../firebase/auth';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'> };

export const ForgotPasswordScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handle = async () => {
        if (!email.trim()) { setError('Enter your email address'); return; }
        setError(''); setLoading(true);
        try { await resetPassword(email.trim()); setSent(true); }
        catch (e: any) { setError(e.message || 'Failed to send reset email'); }
        finally { setLoading(false); }
    };

    return (
        <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={s.inner}>
                <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={s.title}>Reset Password</Text>
                <Text style={s.sub}>Enter your email and we'll send a reset link.</Text>

                {sent ? (
                    <View style={s.successBox}>
                        <MaterialCommunityIcons name="check-circle-outline" size={40} color="#22c55e" />
                        <Text style={s.successText}>Reset email sent! Check your inbox.</Text>
                        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                            <Text style={s.backBtnText}>Back to Sign In</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}
                        <View style={s.field}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="rgba(255,255,255,0.35)" style={s.icon} />
                            <TextInput style={s.input} placeholder="Email address" placeholderTextColor="rgba(255,255,255,0.25)"
                                value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                        </View>
                        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handle} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send Reset Link</Text>}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#07080f' },
    inner: { flex: 1, padding: 24, paddingTop: 56 },
    back: { marginBottom: 28 },
    title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
    sub: { fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 28 },
    errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
    errorText: { color: '#ef4444', fontSize: 13 },
    field: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', height: 54, paddingHorizontal: 14, marginBottom: 20 },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#fff', fontSize: 15 },
    btn: { backgroundColor: '#5b5fff', height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    successBox: { alignItems: 'center', marginTop: 40, gap: 16 },
    successText: { color: '#22c55e', fontSize: 15, textAlign: 'center' },
    backBtn: { marginTop: 8, backgroundColor: 'rgba(34,197,94,0.12)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    backBtnText: { color: '#22c55e', fontSize: 15, fontWeight: '600' },
});
