import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { SubscriptionList } from '../screens/subscriptions/SubscriptionList';
import { AddSubscription } from '../screens/subscriptions/AddSubscription';
import { SubscriptionDetails } from '../screens/subscriptions/SubscriptionDetails';
import { PaymentHistory } from '../screens/payments/PaymentHistory';
import { AddPayment } from '../screens/payments/AddPayment';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ReminderSettings } from '../screens/reminders/ReminderSettings';

export type AppStackParamList = {
    Tabs: undefined;
    AddSubscription: undefined;
    SubscriptionDetails: { id: string };
    AddPayment: { subscriptionId: string; subscriptionName: string };
    ReminderSettings: { subscriptionId: string; subscriptionName: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

const Tabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#0d0e1a',
                borderTopColor: 'rgba(255,255,255,0.06)',
                borderTopWidth: 1,
                height: 62,
                paddingBottom: 8,
                paddingTop: 6,
            },
            tabBarActiveTintColor: '#5b5fff',
            tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
            tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        }}
    >
        <Tab.Screen name="Home" component={DashboardScreen}
            options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} /> }} />
        <Tab.Screen name="Subscriptions" component={SubscriptionList}
            options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="card-bulleted-outline" color={color} size={size} /> }} />
        <Tab.Screen name="Payments" component={PaymentHistory}
            options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cash-multiple" color={color} size={size} /> }} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen}
            options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-bar" color={color} size={size} /> }} />
        <Tab.Screen name="Profile" component={ProfileScreen}
            options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} /> }} />
    </Tab.Navigator>
);

export const AppNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#07080f' } }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="AddSubscription" component={AddSubscription} options={{ presentation: 'modal' }} />
        <Stack.Screen name="SubscriptionDetails" component={SubscriptionDetails} />
        <Stack.Screen name="AddPayment" component={AddPayment} options={{ presentation: 'modal' }} />
        <Stack.Screen name="ReminderSettings" component={ReminderSettings} />
    </Stack.Navigator>
);
