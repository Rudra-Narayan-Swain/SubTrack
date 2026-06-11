import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const { width } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }: Props) => {
    // ─── Animations Setup ────────────────────────────────────────────────────────
    const glowScale = useRef(new Animated.Value(0.85)).current;
    
    // Independent float values for cards to create offset organic movement
    const float1 = useRef(new Animated.Value(0)).current;
    const float2 = useRef(new Animated.Value(0)).current;
    const float3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 1. Breathing Glow Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowScale, {
                    toValue: 1.15,
                    duration: 4500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowScale, {
                    toValue: 0.85,
                    duration: 4500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // 2. Float Card 1 (Netflix)
        Animated.loop(
            Animated.sequence([
                Animated.timing(float1, {
                    toValue: 1,
                    duration: 3200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(float1, {
                    toValue: 0,
                    duration: 3200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // 3. Float Card 2 (Spotify) - slightly faster
        Animated.loop(
            Animated.sequence([
                Animated.timing(float2, {
                    toValue: 1,
                    duration: 2700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(float2, {
                    toValue: 0,
                    duration: 2700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // 4. Float Card 3 (iCloud) - slower
        Animated.loop(
            Animated.sequence([
                Animated.timing(float3, {
                    toValue: 1,
                    duration: 3800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(float3, {
                    toValue: 0,
                    duration: 3800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Interpolate animated translations
    const y1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
    const y2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
    const y3 = float3.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

    return (
        <SafeAreaView style={s.safe}>
            {/* Ambient Animated Glows */}
            <Animated.View style={[s.glow, { top: -90, left: -90, backgroundColor: '#5b5fff', transform: [{ scale: glowScale }] }]} />
            <Animated.View style={[s.glow, { bottom: 100, right: -120, backgroundColor: '#8b5cf6', transform: [{ scale: glowScale }] }]} />

            {/* Background Stardust Particles */}
            <View style={s.stardustContainer} pointerEvents="none">
                <View style={[s.star, { top: '15%', left: '20%', width: 2, height: 2, opacity: 0.3 }]} />
                <View style={[s.star, { top: '25%', left: '80%', width: 3, height: 3, opacity: 0.5 }]} />
                <View style={[s.star, { top: '45%', left: '10%', width: 2, height: 2, opacity: 0.2 }]} />
                <View style={[s.star, { top: '55%', left: '85%', width: 4, height: 4, opacity: 0.4 }]} />
                <View style={[s.star, { top: '70%', left: '30%', width: 3, height: 3, opacity: 0.3 }]} />
                <View style={[s.star, { top: '85%', left: '75%', width: 2, height: 2, opacity: 0.2 }]} />
            </View>

            <View style={s.container}>
                {/* Brand Logo Header */}
                <View style={s.logoWrap}>
                    <View style={s.logo}>
                        <Text style={s.logoText}>S</Text>
                    </View>
                    <Text style={s.appName}>Subtrack</Text>
                </View>

                {/* Glassmorphic Animated Hero Dashboard Widget */}
                <View style={s.widgetContainer}>
                    {/* Spotify Card (Float 2) */}
                    <Animated.View style={[s.illCard, s.illCard1, { transform: [{ rotate: '-12deg' }, { translateY: y2 }] }]}>
                        <View style={s.cardHead}>
                            <View style={[s.cardLogo, { backgroundColor: '#1DB954' }]}>
                                <MaterialCommunityIcons name="spotify" size={12} color="#fff" />
                            </View>
                            <Text style={s.cardCycle}>Monthly</Text>
                        </View>
                        <Text style={s.cardName} numberOfLines={1}>Spotify Premium</Text>
                        <Text style={s.cardPrice}>$10.99</Text>
                    </Animated.View>

                    {/* Netflix Card (Float 1) */}
                    <Animated.View style={[s.illCard, s.illCard2, { transform: [{ rotate: '12deg' }, { translateY: y1 }] }]}>
                        <View style={s.cardHead}>
                            <View style={[s.cardLogo, { backgroundColor: '#e50914' }]}>
                                <MaterialCommunityIcons name="netflix" size={12} color="#fff" />
                            </View>
                            <Text style={s.cardCycle}>Monthly</Text>
                        </View>
                        <Text style={s.cardName} numberOfLines={1}>Netflix 4K</Text>
                        <Text style={s.cardPrice}>$15.49</Text>
                    </Animated.View>

                    {/* iCloud Card (Float 3) */}
                    <Animated.View style={[s.illCard, s.illCard3, { transform: [{ rotate: '-2deg' }, { translateY: y3 }] }]}>
                        <View style={s.cardHead}>
                            <View style={[s.cardLogo, { backgroundColor: '#007aff' }]}>
                                <MaterialCommunityIcons name="cloud-outline" size={12} color="#fff" />
                            </View>
                            <Text style={s.cardCycle}>Monthly</Text>
                        </View>
                        <Text style={s.cardName} numberOfLines={1}>iCloud+</Text>
                        <Text style={s.cardPrice}>$2.99</Text>
                    </Animated.View>

                    {/* Mini Spending History Graph Widget */}
                    <View style={s.graphWidget}>
                        <View style={s.graphHeader}>
                            <Text style={s.graphTitle}>Spend History</Text>
                            <View style={s.activeIndicator} />
                        </View>
                        <View style={s.graphBody}>
                            {/* Spent Circular Ring */}
                            <View style={s.ringContainer}>
                                <View style={s.spendRing}>
                                    <Text style={s.ringPct}>68%</Text>
                                </View>
                            </View>
                            {/* Vertical Spending Bars */}
                            <View style={s.barsContainer}>
                                <View style={[s.bar, { height: '35%' }]} />
                                <View style={[s.bar, { height: '60%' }]} />
                                <View style={[s.bar, { height: '45%' }]} />
                                <View style={[s.bar, { height: '75%', backgroundColor: '#5b5fff' }]} />
                                <View style={[s.bar, { height: '50%' }]} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Hero Headers */}
                <View style={s.hero}>
                    <Text style={s.title}>
                        Take control of your <Text style={{ color: '#818cf8' }}>subscriptions</Text>
                    </Text>
                    <Text style={s.subtitle}>
                        Monitor recurring bills, receive smart notifications, and optimize your monthly spend.
                    </Text>
                </View>

                {/* Feature highlights */}
                <View style={s.features}>
                    <View style={s.feature}>
                        <View style={s.featIcon}>
                            <MaterialCommunityIcons name="bell-ring-outline" size={18} color="#5b5fff" />
                        </View>
                        <View style={s.featTextWrap}>
                            <Text style={s.featTitle}>Smart Reminders</Text>
                            <Text style={s.featDesc}>Never get surprised by unexpected auto-renewals.</Text>
                        </View>
                    </View>

                    <View style={s.feature}>
                        <View style={s.featIcon}>
                            <MaterialCommunityIcons name="chart-arc" size={18} color="#8b5cf6" />
                        </View>
                        <View style={s.featTextWrap}>
                            <Text style={s.featTitle}>Spend Metrics</Text>
                            <Text style={s.featDesc}>Understand your category spending habits in real-time.</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={s.actions}>
                    <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('Register')}>
                        <Text style={s.btnPrimaryText}>Get Started</Text>
                        <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate('Login')}>
                        <Text style={s.btnSecondaryText}>Log In to Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#07080f' },
    container: { flex: 1, padding: 24, justifyContent: 'space-between', zIndex: 10 },
    glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, opacity: 0.12, zIndex: 1 },
    
    // Background stardust
    stardustContainer: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
    star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 10 },

    // Header Logo
    logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
    logo: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#5b5fff', justifyContent: 'center', alignItems: 'center' },
    logoText: { fontSize: 18, fontWeight: '800', color: '#fff' },
    appName: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },

    // Animated Hero Widgets Container
    widgetContainer: { height: 180, position: 'relative', marginVertical: 8, width: '100%', alignSelf: 'center' },
    illCard: { position: 'absolute', width: 125, height: 82, borderRadius: 14, padding: 10, borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
    illCard1: { left: '4%', top: 12, backgroundColor: '#0c1511', borderColor: 'rgba(29, 185, 84, 0.15)' },
    illCard2: { right: '4%', top: 22, backgroundColor: '#140c0d', borderColor: 'rgba(229, 9, 20, 0.15)' },
    illCard3: { left: '26%', top: 38, zIndex: 20, backgroundColor: '#131422', borderColor: 'rgba(91, 95, 255, 0.25)', shadowColor: '#5b5fff', shadowOpacity: 0.2, shadowRadius: 10 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardLogo: { width: 22, height: 22, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    cardCycle: { fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase' },
    cardName: { fontSize: 11, fontWeight: '700', color: '#fff', marginBottom: 1 },
    cardPrice: { fontSize: 13, fontWeight: '800', color: '#fff' },

    // Graph Widget styling
    graphWidget: { position: 'absolute', bottom: -10, right: '6%', width: 140, height: 75, backgroundColor: 'rgba(255,255,255,0.025)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 8, zIndex: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
    graphHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    graphTitle: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase' },
    activeIndicator: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#22c55e' },
    graphBody: { flexDirection: 'row', flex: 1, alignItems: 'flex-end', justifyContent: 'space-between' },
    ringContainer: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
    spendRing: { width: 32, height: 32, borderRadius: 16, borderWidth: 3.5, borderColor: '#8b5cf6', borderLeftColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    ringPct: { fontSize: 8, color: '#fff', fontWeight: '700' },
    barsContainer: { flexDirection: 'row', flex: 1, height: '100%', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 4, marginLeft: 12 },
    bar: { width: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.08)' },

    // Hero details
    hero: { gap: 6, marginTop: 10 },
    title: { fontSize: 32, fontWeight: '800', color: '#fff', lineHeight: 38, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 18 },
    
    // Sleek Badge Feature panels
    features: { gap: 12, marginVertical: 6 },
    feature: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
    featIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    featTextWrap: { flex: 1, gap: 1 },
    featTitle: { fontSize: 13, fontWeight: '600', color: '#fff' },
    featDesc: { fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 15 },
    
    // Action CTAs
    actions: { gap: 10, marginBottom: 4 },
    btnPrimary: { flexDirection: 'row', gap: 6, height: 50, borderRadius: 12, backgroundColor: '#5b5fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#5b5fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
    btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    btnSecondary: { height: 50, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.025)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    btnSecondaryText: { color: 'rgba(255,255,255,0.65)', fontSize: 15, fontWeight: '600' },
});
