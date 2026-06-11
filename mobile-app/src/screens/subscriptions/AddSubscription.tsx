import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';
import { addSubscription } from '../../services/subscriptionService';
import { getNextBillingDate } from '../../utils/dateUtils';
import type { BillingCycle, SubscriptionStatus } from '../../types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList, 'AddSubscription'> };

const CYCLES: BillingCycle[] = ['monthly', 'weekly', 'quarterly', 'yearly'];
const CATEGORIES = ['Streaming', 'Music', 'Gaming', 'Software', 'Cloud', 'Fitness', 'News', 'Education', 'Finance', 'Other'];

export const AddSubscription = ({ navigation }: Props) => {
    const { user } = useStore();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Other');
    const [cycle, setCycle] = useState<BillingCycle>('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handle = async () => {
        if (!name.trim()) { setError('Subscription name is required'); return; }
        const p = parseFloat(price);
        if (!price || isNaN(p) || p <= 0) { setError('Enter a valid price'); return; }
        setError(''); setLoading(true);
        try {
            const nextBillingDate = getNextBillingDate(startDate, cycle);
            await addSubscription({
                userId: user!.uid, name: name.trim(), price: p, currency: 'USD',
                category: category.toLowerCase(), billingCycle: cycle,
                startDate, nextBillingDate, status: 'active' as SubscriptionStatus,
            });
            navigation.goBack();
        } catch (e: any) {
            setError(e.message || 'Failed to add subscription');
        } finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={s.safe}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="close" size={24} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>New Subscription</Text>
                    <TouchableOpacity style={[s.saveBtn, loading && { opacity: 0.6 }]} onPress={handle} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Save</Text>}
                    </TouchableOpacity>
                </View>
                <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
                    {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

                    <Text style={s.label}>Name</Text>
                    <TextInput style={s.input} placeholder="e.g. Netflix" placeholderTextColor="rgba(255,255,255,0.25)"
                        value={name} onChangeText={setName} />

                    <Text style={s.label}>Price (USD)</Text>
                    <TextInput style={s.input} placeholder="0.00" placeholderTextColor="rgba(255,255,255,0.25)"
                        value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

                    <Text style={s.label}>Billing Cycle</Text>
                    <View style={s.chips}>
                        {CYCLES.map((c) => (
                            <TouchableOpacity key={c} style={[s.chip, cycle === c && s.chipActive]} onPress={() => setCycle(c)}>
                                <Text style={[s.chipText, cycle === c && s.chipTextActive]}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>Category</Text>
                    <View style={s.chips}>
                        {CATEGORIES.map((c) => (
                            <TouchableOpacity key={c} style={[s.chip, category === c && s.chipActive]} onPress={() => setCategory(c)}>
                                <Text style={[s.chipText, category === c && s.chipTextActive]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>Start Date</Text>
                    <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="rgba(255,255,255,0.25)"
                        value={startDate} onChangeText={setStartDate} />
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
