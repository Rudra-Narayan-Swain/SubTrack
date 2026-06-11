import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/currencyUtils';
import { getDueDateLabel, isOverdue } from '../utils/dateUtils';
import type { Subscription } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
    streaming: 'play-circle-outline',
    music: 'music-circle-outline',
    gaming: 'gamepad-variant-outline',
    software: 'laptop',
    cloud: 'cloud-outline',
    fitness: 'run-fast',
    news: 'newspaper-variant-outline',
    education: 'school-outline',
    finance: 'bank-outline',
    other: 'apps',
};

interface Props {
    subscription: Subscription;
    onPress: (id: string) => void;
}

export const SubscriptionCard = ({ subscription, onPress }: Props) => {
    const overdue = isOverdue(subscription.nextBillingDate);
    const dueLabel = getDueDateLabel(subscription.nextBillingDate);
    const icon = CATEGORY_ICONS[subscription.category?.toLowerCase()] ?? 'apps';

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(subscription.id)} activeOpacity={0.75}>
            <View style={[styles.iconBox, { backgroundColor: overdue ? 'rgba(239,68,68,0.15)' : 'rgba(91,95,255,0.15)' }]}>
                <MaterialCommunityIcons name={icon as any} size={22} color={overdue ? '#ef4444' : '#5b5fff'} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{subscription.name}</Text>
                <Text style={[styles.due, overdue && styles.overdueDue]}>{dueLabel}</Text>
            </View>
            <View style={styles.right}>
                <Text style={styles.price}>{formatCurrency(subscription.price, subscription.currency)}</Text>
                <Text style={styles.cycle}>/{(subscription.billingCycle || 'monthly').slice(0, 2)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: { flex: 1 },
    name: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
    due: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
    overdueDue: { color: '#ef4444' },
    right: { alignItems: 'flex-end' },
    price: { color: '#fff', fontSize: 15, fontWeight: '700' },
    cycle: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
});
