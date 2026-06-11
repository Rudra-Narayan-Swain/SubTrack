import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from '../../firebase/auth';

export const PendingApprovalScreen = () => {
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOut();
        } catch (e) {
            console.warn('Sign out failed:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.container}>
                {/* Visual Icon */}
                <View style={s.iconWrap}>
                    <MaterialCommunityIcons name="account-clock-outline" size={48} color="#5b5fff" />
                </View>

                {/* Main Message */}
                <Text style={s.title}>Approval Pending</Text>
                <Text style={s.desc}>
                    Your account has been registered successfully. An administrator must accept your account before you can access the Subtrack dashboard.
                </Text>

                {/* Additional Info Box */}
                <View style={s.infoBox}>
                    <MaterialCommunityIcons name="info-outline" size={16} color="rgba(255,255,255,0.4)" />
                    <Text style={s.infoText}>
                        If you believe this is a mistake, please contact support or check back in a few minutes.
                    </Text>
                </View>

                {/* Actions */}
                <TouchableOpacity style={s.btn} onPress={handleSignOut} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="logout" size={18} color="#fff" style={s.btnIcon} />
                            <Text style={s.btnText}>Sign Out / Change Account</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#07080f' },
    container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
    iconWrap: { width: 96, height: 96, borderRadius: 28, backgroundColor: 'rgba(91, 95, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: 'rgba(91, 95, 255, 0.15)' },
    title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 12, textAlign: 'center' },
    desc: { fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 22, textAlign: 'center', paddingHorizontal: 12, marginBottom: 32 },
    infoBox: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 40, width: '100%' },
    infoText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 17 },
    btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', height: 50, borderRadius: 12, paddingHorizontal: 20, width: '100%' },
    btnIcon: { marginRight: 8 },
    btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
