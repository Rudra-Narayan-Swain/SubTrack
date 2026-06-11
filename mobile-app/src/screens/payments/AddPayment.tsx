import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';
import { addPayment } from '../../services/paymentService';
import type { PaymentMethod, PaymentStatus } from '../../types';

type Props = {
    navigation: NativeStackNavigationProp<AppStackParamList, 'AddPayment'>;
    route: RouteProp<AppStackParamList, 'AddPayment'>;
};

const METHODS: PaymentMethod[] = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'other'];
const METHOD_LABELS: Record<PaymentMethod, string> = { credit_card: 'Credit Card', debit_card: 'Debit Card', paypal: 'PayPal', bank_transfer: 'Bank Transfer', crypto: 'Crypto', other: 'Other' };

export const AddPayment = ({ navigation, route }: Props) => {
    const { user } = useStore();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<PaymentMethod>('credit_card');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handle = async () => {
        const a = parseFloat(amount);
        if (!amount || isNaN(a) || a <= 0) { setError('Enter a valid amount'); return; }
        setError(''); setLoading(true);
        try {
            await addPayment({
                userId: user!.uid,
                subscriptionId: route.params.subscriptionId,
                subscriptionName: route.params.subscriptionName,
                amount: a, currency: 'USD', date, method,
                status: 'completed' as PaymentStatus, notes: notes.trim() || undefined,
            });
            navigation.goBack();
        } catch (e: any) { setError(e.message || 'Failed to add payment'); }
        finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={s.safe}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="close" size={24} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Add Payment</Text>
                    <TouchableOpacity style={[s.saveBtn, loading && { opacity: 0.6 }]} onPress={handle} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Save</Text>}
                    </TouchableOpacity>
                </View>

                <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
                    <Text style={s.subLabel}>For: {route.params.subscriptionName}</Text>
                    {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

                    <Text style={s.label}>Amount (USD)</Text>
                    <TextInput style={s.input} placeholder="0.00" placeholderTextColor="rgba(255,255,255,0.25)"
                        value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

                    <Text style={s.label}>Date</Text>
                    <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="rgba(255,255,255,0.25)"
                        value={date} onChangeText={setDate} />

                    <Text style={s.label}>Payment Method</Text>
                    <View style={s.chips}>
                        {METHODS.map((m) => (
                            <TouchableOpacity key={m} style={[s.chip, method === m && s.chipActive]} onPress={() => setMethod(m)}>
                                <Text style={[s.chipText, method === m && s.chipTextActive]}>{METHOD_LABELS[m]}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>Notes (optional)</Text>
                    <TextInput style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                        placeholder="Add any notes..." placeholderTextColor="rgba(255,255,255,0.25)"
                        value={notes} onChangeText={setNotes} multiline />
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#07080f' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
    saveBtn: { backgroundColor: '#5b5fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    scroll: { padding: 20 },
    subLabel: { color: '#5b5fff', fontSize: 13, fontWeight: '500', marginBottom: 16 },
    errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
    errorText: { color: '#ef4444', fontSize: 13 },
    label: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 18 },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', height: 50, paddingHorizontal: 14, color: '#fff', fontSize: 15 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    chipActive: { backgroundColor: '#5b5fff', borderColor: '#5b5fff' },
    chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
    chipTextActive: { color: '#fff', fontWeight: '600' },
});
