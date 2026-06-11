import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { formatCurrency, toMonthlyCost, toYearlyCost } from '../../utils/currencyUtils';
import type { BillingCycle } from '../../types';

interface StatProps {
    label: string;
    value: string;
    icon: string;
    color: string;
}

const Stat = ({ label, value, icon, color }: StatProps) => (
    <View style={s.stat}>
        <View style={[s.statIcon, { backgroundColor: `${color}20` }]}>
            <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        </View>
        <Text style={s.statValue}>{value}</Text>
        <Text style={s.statLabel}>{label}</Text>
    </View>
);

export const AnalyticsScreen = () => {
    const { subscriptions, payments } = useStore();

    const active = subscriptions.filter((s) => s.status === 'active');
    const monthly = active.reduce((sum, s) => sum + toMonthlyCost(s.price, s.billingCycle), 0);
    const yearly = active.reduce((sum, s) => sum + toYearlyCost(s.price, s.billingCycle), 0);
    const totalPaid = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    active.forEach((s) => {
        const cat = s.category || 'other';
        byCategory[cat] = (byCategory[cat] || 0) + toMonthlyCost(s.price, s.billingCycle);
    });
    const topCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Group by cycle
    const byCycle: Record<string, number> = {};
    active.forEach((s) => { byCycle[s.billingCycle] = (byCycle[s.billingCycle] || 0) + 1; });

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}><Text style={s.title}>Analytics</Text></View>
            <ScrollView contentContainerStyle={s.scroll}>
                {/* Overview */}
                <View style={s.statsGrid}>
                    <Stat label="Monthly" value={formatCurrency(monthly)} icon="calendar-month" color="#5b5fff" />
                    <Stat label="Yearly" value={formatCurrency(yearly)} icon="calendar" color="#8b5cf6" />
                    <Stat label="Active" value={String(active.length)} icon="check-circle-outline" color="#22c55e" />
                    <Stat label="Total Paid" value={formatCurrency(totalPaid)} icon="cash-check" color="#f59e0b" />
                </View>

                {/* By Category */}
                {topCats.length > 0 && (
                    <View style={s.card}>
                        <Text style={s.cardTitle}>Spend by Category</Text>
                        {topCats.map(([cat, amt]) => {
                            const pct = monthly > 0 ? (amt / monthly) * 100 : 0;
                            return (
                                <View key={cat}>
                                    <View style={s.catRow}>
                                        <Text style={s.catName}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                                        <Text style={s.catAmt}>{formatCurrency(amt)}</Text>
                                    </View>
                                    <View style={s.barBg}>
                                        <View style={[s.barFill, { width: `${Math.min(pct, 100)}%` as any }]} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* By Billing Cycle */}
                {Object.keys(byCycle).length > 0 && (
                    <View style={s.card}>
                        <Text style={s.cardTitle}>Subscriptions by Cycle</Text>
                        {Object.entries(byCycle).map(([cycle, count]) => (
                            <View key={cycle} style={s.cycleRow}>
                                <MaterialCommunityIcons name="refresh" size={16} color="rgba(255,255,255,0.4)" />
                                <Text style={s.cycleName}>{cycle.charAt(0).toUpperCase() + cycle.slice(1)}</Text>
                                <Text style={s.cycleCount}>{count} sub{count > 1 ? 's' : ''}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {active.length === 0 && (
                    <View style={s.empty}>
                        <MaterialCommunityIcons name="chart-bar-stacked" size={52} color="rgba(255,255,255,0.1)" />
                        <Text style={s.emptyText}>Add subscriptions to see analytics</Text>
                    </View>
                )}
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
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    stat: { width: '47%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 2 },
    statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 12 },
    cardTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    catName: { color: '#fff', fontSize: 14 },
    catAmt: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
    barBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 8 },
    barFill: { height: 4, backgroundColor: '#5b5fff', borderRadius: 2 },
    cycleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cycleName: { flex: 1, color: '#fff', fontSize: 14 },
    cycleCount: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
    empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 14 },
});
