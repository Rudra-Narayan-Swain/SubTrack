import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { scheduleLocalNotification, requestPermissions } from '../../services/notificationService';

type Props = {
    navigation: NativeStackNavigationProp<AppStackParamList, 'ReminderSettings'>;
    route: RouteProp<AppStackParamList, 'ReminderSettings'>;
};

const OPTIONS = [1, 2, 3, 5, 7, 14];

export const ReminderSettings = ({ navigation, route }: Props) => {
    const [selected, setSelected] = useState<number>(3);
    const [loading, setLoading] = useState(false);

    const handle = async () => {
        setLoading(true);
        try {
            const granted = await requestPermissions();
            if (!granted) {
                Alert.alert('Permission Required', 'Please enable notifications in your device settings to use reminders.');
                return;
            }
            const triggerDate = new Date();
            triggerDate.setDate(triggerDate.getDate() + selected);
            triggerDate.setHours(9, 0, 0, 0);
            await scheduleLocalNotification(
                `${route.params.subscriptionName} renews soon`,
                `Your subscription renews in ${selected} day${selected > 1 ? 's' : ''}. Make sure your payment method is up to date.`,
                triggerDate
            );
            Alert.alert('Reminder Set', `You'll be notified ${selected} day${selected > 1 ? 's' : ''} before the renewal.`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to set reminder');
        } finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={s.title} numberOfLines={1}>Reminder — {route.params.subscriptionName}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll}>
                <View style={s.iconWrap}>
                    <MaterialCommunityIcons name="bell-ring-outline" size={48} color="#5b5fff" />
                </View>
                <Text style={s.heading}>When should we remind you?</Text>
                <Text style={s.sub}>A notification will be sent this many days before the renewal date.</Text>

                <View style={s.grid}>
                    {OPTIONS.map((days) => (
                        <TouchableOpacity key={days} style={[s.option, selected === days && s.optionActive]} onPress={() => setSelected(days)}>
                            <Text style={[s.optionNum, selected === days && s.optionNumActive]}>{days}</Text>
                            <Text style={[s.optionLabel, selected === days && s.optionLabelActive]}>day{days > 1 ? 's' : ''}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handle} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <>
                        <MaterialCommunityIcons name="bell-plus-outline" size={18} color="#fff" />
                        <Text style={s.btnText}>Set Reminder</Text>
                    </>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#07080f' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingHorizontal: 20 },
    title: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center', marginHorizontal: 8 },
    scroll: { padding: 24, alignItems: 'center' },
    iconWrap: { width: 90, height: 90, borderRadius: 24, backgroundColor: 'rgba(91,95,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    heading: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
    sub: { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 32, paddingHorizontal: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 32 },
    option: { width: 90, height: 90, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    optionActive: { backgroundColor: '#5b5fff', borderColor: '#5b5fff', shadowColor: '#5b5fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    optionNum: { fontSize: 28, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
    optionNumActive: { color: '#fff' },
    optionLabel: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
    optionLabelActive: { color: 'rgba(255,255,255,0.8)' },
    btn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5b5fff', height: 54, borderRadius: 14, width: '100%', shadowColor: '#5b5fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
