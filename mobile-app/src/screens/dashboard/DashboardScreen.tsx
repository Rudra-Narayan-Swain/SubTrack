import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';
import { SubscriptionCard } from '../../components/SubscriptionCard';
import { formatCurrency, toMonthlyCost } from '../../utils/currencyUtils';
import { isUpcoming } from '../../utils/dateUtils';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList, 'Tabs'> };

export const DashboardScreen = ({ navigation }: Props) => {
    const { user, subscriptions } = useStore();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    const active = subscriptions.filter((s) => s.status === 'active');
    const monthlySpend = active.reduce((sum, s) => sum + toMonthlyCost(s.price, s.billingCycle), 0);
    const upcoming = active.filter((s) => isUpcoming(s.nextBillingDate, 14))
        .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
        .slice(0, 5);

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView style={s.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5b5fff" />}>
                {/* Header */}
                <View style={s.header}>
                    <View>
                        <Text style={s.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
                        <Text style={s.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                    </View>
                    <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddSubscription')}>
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Spend Card */}
                <View style={s.spendCard}>
                    <Text style={s.spendLabel}>Monthly Spend</Text>
                    <Text style={s.spendAmount}>{formatCurrency(monthlySpend)}</Text>
                    <View style={s.spendRow}>
                        <Text style={s.spendSub}>{active.length} active subscriptions</Text>
                    </View>
                    <View style={[s.glow, { top: -40, right: -20, backgroundColor: '#5b5fff' }]} />
                    <View style={[s.glow, { bottom: -30, right: 60, backgroundColor: '#8b5cf6' }]} />
                </View>

                {/* Stats */}
                <View style={s.statsRow}>
                    <View style={s.stat}>
                        <MaterialCommunityIcons name="clock-alert-outline" size={22} color="#f59e0b" />
                        <Text style={s.statNum}>{upcoming.length}</Text>
                        <Text style={s.statLbl}>Upcoming</Text>
                    </View>
                    <View style={s.stat}>
                        <MaterialCommunityIcons name="cancel" size={22} color="#6b7280" />
                        <Text style={s.statNum}>{subscriptions.length - active.length}</Text>
                        <Text style={s.statLbl}>Inactive</Text>
                    </View>
                    <View style={s.stat}>
                        <MaterialCommunityIcons name="calendar-month-outline" size={22} color="#22c55e" />
                        <Text style={s.statNum}>{subscriptions.length}</Text>
                        <Text style={s.statLbl}>Total</Text>
                    </View>
                </View>

                {/* Upcoming Renewals */}
                <View style={s.section}>
                    <View style={s.sectionHead}>
                        <Text style={s.sectionTitle}>Upcoming Renewals</Text>
                        <TouchableOpacity onPress={() => (navigation as any).navigate('Subscriptions')}>
                            <Text style={s.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {upcoming.length > 0 ? upcoming.map((sub) => (
                        <SubscriptionCard key={sub.id} subscription={sub}
                            onPress={(id) => navigation.navigate('SubscriptionDetails', { id })} />
                    )) : (
                        <View style={s.empty}>
                            <MaterialCommunityIcons name="check-circle-outline" size={40} color="rgba(255,255,255,0.15)" />
                            <Text style={s.emptyText}>No renewals in the next 14 days</Text>
                        </View>
                    )}
                </View>
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#07080f' },
    container: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, marginTop: 4 },
    greeting: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 2 },
    date: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
    addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#5b5fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#5b5fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
    spendCard: { backgroundColor: '#131629', borderRadius: 20, padding: 22, marginBottom: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(91,95,255,0.15)' },
    spendLabel: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 6 },
    spendAmount: { fontSize: 38, fontWeight: '800', color: '#fff', marginBottom: 12 },
    spendRow: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 12 },
    spendSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
    glow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, opacity: 0.18 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
    stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.035)', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    statNum: { fontSize: 22, fontWeight: '700', color: '#fff' },
    statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
    section: { marginBottom: 8 },
    sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
    seeAll: { fontSize: 13, color: '#5b5fff', fontWeight: '500' },
    empty: { alignItems: 'center', paddingVertical: 32, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 10 },
    emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },
});
