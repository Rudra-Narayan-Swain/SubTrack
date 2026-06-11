import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';

export const PaymentHistory = () => {
    const { payments } = useStore();

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
                <Text style={s.title}>Payments</Text>
                <Text style={s.total}>Total: {formatCurrency(totalSpent)}</Text>
            </View>
            <FlatList
                data={payments}
                keyExtractor={(p) => p.id}
                contentContainerStyle={s.list}
                ListEmptyComponent={(
                    <View style={s.empty}>
                        <MaterialCommunityIcons name="credit-card-off-outline" size={52} color="rgba(255,255,255,0.1)" />
                        <Text style={s.emptyTitle}>No payment records yet</Text>
                        <Text style={s.emptyText}>Payment records appear when you mark subscriptions as paid</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={s.item}>
                        <View style={s.itemIcon}>
                            <MaterialCommunityIcons name="cash-check" size={20} color={item.status === 'completed' ? '#22c55e' : item.status === 'pending' ? '#f59e0b' : '#ef4444'} />
                        </View>
                        <View style={s.itemInfo}>
                            <Text style={s.itemName} numberOfLines={1}>{item.subscriptionName}</Text>
                            <Text style={s.itemDate}>{formatDate(item.date)}</Text>
                        </View>
                        <View style={s.itemRight}>
                            <Text style={s.itemAmount}>{formatCurrency(item.amount, item.currency)}</Text>
                            <Text style={[s.itemStatus, { color: item.status === 'completed' ? '#22c55e' : '#f59e0b' }]}>{item.status}</Text>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#07080f' },
    header: { padding: 20, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '700', color: '#fff' },
    total: { color: '#5b5fff', fontWeight: '600', fontSize: 14 },
    list: { padding: 20, paddingTop: 8, gap: 10 },
    empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
    emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
    emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', paddingHorizontal: 32 },
    item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    itemIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
    itemDate: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    itemRight: { alignItems: 'flex-end' },
    itemAmount: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
    itemStatus: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
});
