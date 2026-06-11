import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';
import { deleteSubscription, markSubscriptionPaid, updateSubscription } from '../../services/subscriptionService';
import { formatCurrency, toMonthlyCost } from '../../utils/currencyUtils';
import { formatDate, getDueDateLabel, isOverdue } from '../../utils/dateUtils';
import type { Subscription } from '../../types';

type Props = {
    navigation: NativeStackNavigationProp<AppStackParamList, 'SubscriptionDetails'>;
    route: RouteProp<AppStackParamList, 'SubscriptionDetails'>;
};

const Info = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={s.infoRow}>
        <MaterialCommunityIcons name={icon as any} size={18} color="rgba(255,255,255,0.4)" style={{ width: 26 }} />
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
    </View>
);

export const SubscriptionDetails = ({ navigation, route }: Props) => {
    const { subscriptions, removeSubscription, updateSubscription: updateStore } = useStore();
    const sub = subscriptions.find((s) => s.id === route.params.id);
    const [loading, setLoading] = useState(false);

    if (!sub) {
        return (
            <SafeAreaView style={s.safe}>
                <View style={[s.center, { flex: 1 }]}>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Subscription not found</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
                        <Text style={{ color: '#5b5fff' }}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const overdue = isOverdue(sub.nextBillingDate);

    const handleDelete = () => {
        Alert.alert('Delete Subscription', `Remove "${sub.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await deleteSubscription(sub.id);
                    removeSubscription(sub.id);
                    navigation.goBack();
                }
            },
        ]);
    };

    const handleToggleStatus = async () => {
        const newStatus = sub.status === 'active' ? 'paused' : 'active';
        setLoading(true);
        try {
            await updateSubscription(sub.id, { status: newStatus });
            updateStore(sub.id, { status: newStatus });
        } finally { setLoading(false); }
    };

    const handleMarkPaid = async () => {
        setLoading(true);
        try { await markSubscriptionPaid(sub); }
        finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle} numberOfLines={1}>{sub.name}</Text>
                <TouchableOpacity onPress={handleDelete}>
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.scroll}>
                {/* Price card */}
                <View style={s.priceCard}>
                    <Text style={s.priceName}>{sub.name}</Text>
                    <Text style={s.priceAmount}>{formatCurrency(sub.price, sub.currency)}</Text>
                    <Text style={s.priceCycle}>per {sub.billingCycle} · {formatCurrency(toMonthlyCost(sub.price, sub.billingCycle))}/mo</Text>
                    <View style={[s.badge, sub.status === 'active' ? s.badgeActive : s.badgePaused]}>
                        <Text style={[s.badgeText, { color: sub.status === 'active' ? '#22c55e' : '#9ca3af' }]}>{sub.status.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Due banner */}
                {overdue && (
                    <View style={s.overdueBanner}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#ef4444" />
                        <Text style={s.overdueText}>Payment overdue — {getDueDateLabel(sub.nextBillingDate)}</Text>
                    </View>
                )}

                {/* Details */}
                <View style={s.card}>
                    <Info icon="calendar-outline" label="Next billing" value={formatDate(sub.nextBillingDate)} />
                    <Info icon="calendar-start" label="Start date" value={formatDate(sub.startDate)} />
                    <Info icon="tag-outline" label="Category" value={(sub.category || 'other').charAt(0).toUpperCase() + (sub.category || 'other').slice(1)} />
                    <Info icon="refresh" label="Cycle" value={(sub.billingCycle || 'monthly').charAt(0).toUpperCase() + (sub.billingCycle || 'monthly').slice(1)} />
                    {sub.lastPaidDate && <Info icon="check-circle-outline" label="Last paid" value={formatDate(sub.lastPaidDate)} />}
                </View>

                {/* Actions */}
                <TouchableOpacity style={s.primaryBtn} onPress={handleMarkPaid} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <>
                        <MaterialCommunityIcons name="check" size={18} color="#fff" />
                        <Text style={s.primaryBtnText}>Mark as Paid</Text>
                    </>}
                </TouchableOpacity>

                <TouchableOpacity style={s.secondaryBtn} onPress={handleToggleStatus} disabled={loading}>
                    <MaterialCommunityIcons name={sub.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'} size={18} color="rgba(255,255,255,0.7)" />
                    <Text style={s.secondaryBtnText}>{sub.status === 'active' ? 'Pause Subscription' : 'Resume Subscription'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate('AddPayment', { subscriptionId: sub.id, subscriptionName: sub.name })}>
                    <MaterialCommunityIcons name="cash-plus" size={18} color="rgba(255,255,255,0.7)" />
                    <Text style={s.secondaryBtnText}>Add Payment Record</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate('ReminderSettings', { subscriptionId: sub.id, subscriptionName: sub.name })}>
                    <MaterialCommunityIcons name="bell-outline" size={18} color="rgba(255,255,255,0.7)" />
                    <Text style={s.secondaryBtnText}>Set Reminder</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#07080f' },
    center: { alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingHorizontal: 20 },
    headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 17, fontWeight: '600', marginHorizontal: 12 },
    scroll: { padding: 20, gap: 12 },
    priceCard: { backgroundColor: '#131629', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(91,95,255,0.15)' },
    priceName: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 8 },
    priceAmount: { color: '#fff', fontSize: 40, fontWeight: '800', marginBottom: 4 },
    priceCycle: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 14 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    badgeActive: { backgroundColor: 'rgba(34,197,94,0.15)' },
    badgePaused: { backgroundColor: 'rgba(107,114,128,0.2)' },
    badgeText: { fontSize: 11, fontWeight: '700', color: '#22c55e', letterSpacing: 0.5 },
    overdueBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    overdueText: { color: '#ef4444', fontSize: 13, flex: 1 },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
    infoLabel: { flex: 1, color: 'rgba(255,255,255,0.45)', fontSize: 14 },
    infoValue: { color: '#fff', fontSize: 14, fontWeight: '500' },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#5b5fff', height: 50, borderRadius: 12 },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', height: 50, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    secondaryBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500' },
});
