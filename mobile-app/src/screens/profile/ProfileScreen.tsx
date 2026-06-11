import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { signOut } from '../../firebase/auth';
import { formatCurrency, toMonthlyCost } from '../../utils/currencyUtils';

const Row = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={s.row}>
        <MaterialCommunityIcons name={icon as any} size={18} color="#5b5fff" style={{ width: 26 }} />
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowValue} numberOfLines={1}>{value}</Text>
    </View>
);

export const ProfileScreen = () => {
    const { user, subscriptions, payments } = useStore();
    const [loading, setLoading] = useState(false);

    const active = subscriptions.filter((s) => s.status === 'active');
    const monthly = active.reduce((sum, s) => sum + toMonthlyCost(s.price, s.billingCycle), 0);

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive', onPress: async () => {
                    setLoading(true);
                    try { await signOut(); } catch (e) { console.warn(e); }
                    finally { setLoading(false); }
                }
            },
        ]);
    };

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}><Text style={s.title}>Profile</Text></View>
            <ScrollView contentContainerStyle={s.scroll}>
                {/* Avatar */}
                <View style={s.avatarSection}>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={s.userName}>{user?.name}</Text>
                    <Text style={s.userEmail}>{user?.email}</Text>
                </View>

                {/* Stats */}
                <View style={s.statsRow}>
                    <View style={s.statBox}>
                        <Text style={s.statNum}>{active.length}</Text>
                        <Text style={s.statLbl}>Active Subs</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statBox}>
                        <Text style={s.statNum}>{formatCurrency(monthly)}</Text>
                        <Text style={s.statLbl}>Monthly</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statBox}>
                        <Text style={s.statNum}>{payments.length}</Text>
                        <Text style={s.statLbl}>Payments</Text>
                    </View>
                </View>

                {/* Account info */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Account</Text>
                    <Row icon="account-outline" label="Name" value={user?.name ?? '—'} />
                    <Row icon="email-outline" label="Email" value={user?.email ?? '—'} />
                    <Row icon="shield-check-outline" label="Account type" value={user?.isAdmin ? 'Admin' : 'User'} />
                </View>

                {/* Sign out */}
                <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} disabled={loading}>
                    {loading ? <ActivityIndicator color="#ef4444" /> : <>
                        <MaterialCommunityIcons name="logout" size={18} color="#ef4444" />
                        <Text style={s.signOutText}>Sign Out</Text>
                    </>}
                </TouchableOpacity>
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#07080f' },
    header: { padding: 20, paddingBottom: 12 },
    title: { fontSize: 24, fontWeight: '700', color: '#fff' },
    scroll: { padding: 20, paddingTop: 4, gap: 14 },
    avatarSection: { alignItems: 'center', paddingVertical: 16 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#5b5fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#5b5fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    avatarText: { fontSize: 36, fontWeight: '700', color: '#fff' },
    userName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
    userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.45)' },
    statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    statBox: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
    statNum: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
    statLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingBottom: 0 },
    cardTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, padding: 12, paddingBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    rowLabel: { flex: 1, color: 'rgba(255,255,255,0.5)', fontSize: 14, marginLeft: 4 },
    rowValue: { color: '#fff', fontSize: 14, fontWeight: '500', maxWidth: '55%' },
    signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, height: 50, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    signOutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
