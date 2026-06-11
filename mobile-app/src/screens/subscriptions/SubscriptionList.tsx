import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';
import { SubscriptionCard } from '../../components/SubscriptionCard';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList, 'Tabs'> };

export const SubscriptionList = ({ navigation }: Props) => {
    const { subscriptions } = useStore();

    const active = subscriptions.filter((s) => s.status === 'active');
    const paused = subscriptions.filter((s) => s.status !== 'active');

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
                <Text style={s.title}>Subscriptions</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddSubscription')}>
                    <MaterialCommunityIcons name="plus" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={subscriptions}
                keyExtractor={(i) => i.id}
                contentContainerStyle={s.list}
                ListHeaderComponent={subscriptions.length > 0 ? (
                    <Text style={s.sectionLabel}>Active ({active.length})</Text>
                ) : null}
                ListEmptyComponent={(
                    <View style={s.empty}>
                        <MaterialCommunityIcons name="card-bulleted-off-outline" size={52} color="rgba(255,255,255,0.1)" />
                        <Text style={s.emptyTitle}>No subscriptions yet</Text>
                        <Text style={s.emptyText}>Tap + to add your first subscription</Text>
                        <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('AddSubscription')}>
                            <Text style={s.emptyBtnText}>Add Subscription</Text>
                        </TouchableOpacity>
                    </View>
                )}
                renderItem={({ item }) => (
                    <SubscriptionCard subscription={item} onPress={(id) => navigation.navigate('SubscriptionDetails', { id })} />
                )}
            />
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#07080f' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: '700', color: '#fff' },
    addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#5b5fff', justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20, paddingTop: 8 },
    sectionLabel: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
    empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
    emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
    emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
    emptyBtn: { marginTop: 12, backgroundColor: '#5b5fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
