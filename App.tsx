import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AuditLogsScreen from './src/screens/AuditLogsScreen';
import BalanceSheetScreen from './src/screens/BalanceSheetScreen';
import SalesReportScreen from './src/screens/SalesReportScreen';
import ProcurementReportScreen from './src/screens/ProcurementReportScreen';
import LiquidCashScreen from './src/screens/LiquidCashScreen';
import BalanceSessionsScreen from './src/screens/BalanceSessionsScreen';
import DailyReportScreen from './src/screens/DailyReportScreen';
import IncomeScreen from './src/screens/IncomeScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import CustomerReportScreen from './src/screens/CustomerReportScreen';
import OutstandingFeesScreen from './src/screens/OutstandingFeesScreen';
import CommissionReportScreen from './src/screens/CommissionReportScreen';
import DailyIncomeLossScreen from './src/screens/DailyIncomeLossScreen';
import BankTransactionsScreen from './src/screens/BankTransactionsScreen';
import AssetsLiabilitiesScreen from './src/screens/AssetsLiabilitiesScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const Stack = createNativeStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563eb',
    secondary: '#7c3aed',
  },
};

function Navigation() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      {!user ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'لوحة التحكم' }}
          />
          <Stack.Screen 
            name="Inventory" 
            component={InventoryScreen}
            options={{ title: 'المخازن والمخزون' }}
          />
          <Stack.Screen 
            name="AuditLogs" 
            component={AuditLogsScreen}
            options={{ title: 'سجلات المراجعة' }}
          />
          <Stack.Screen 
            name="BalanceSheet" 
            component={BalanceSheetScreen}
            options={{ title: 'الميزانية' }}
          />
          <Stack.Screen 
            name="SalesReport" 
            component={SalesReportScreen}
            options={{ title: 'تقرير المبيعات' }}
          />
          <Stack.Screen 
            name="ProcurementReport" 
            component={ProcurementReportScreen}
            options={{ title: 'تقرير المشتريات' }}
          />
          <Stack.Screen 
            name="CustomerReport" 
            component={CustomerReportScreen}
            options={{ title: 'تقرير العملاء' }}
          />
          <Stack.Screen 
            name="OutstandingFees" 
            component={OutstandingFeesScreen}
            options={{ title: 'تقرير المتأخرات' }}
          />
          <Stack.Screen 
            name="CommissionReport" 
            component={CommissionReportScreen}
            options={{ title: 'تقرير العمولات' }}
          />
          <Stack.Screen 
            name="DailyIncomeLoss" 
            component={DailyIncomeLossScreen}
            options={{ title: 'الإيرادات والمنصرفات' }}
          />
          <Stack.Screen 
            name="BankTransactions" 
            component={BankTransactionsScreen}
            options={{ title: 'المعاملات البنكية' }}
          />
          <Stack.Screen 
            name="AssetsLiabilities" 
            component={AssetsLiabilitiesScreen}
            options={{ title: 'له و عليه' }}
          />
          <Stack.Screen 
            name="LiquidCash" 
            component={LiquidCashScreen}
            options={{ title: 'التقرير النقدي السائل' }}
          />
          <Stack.Screen 
            name="BalanceSessions" 
            component={BalanceSessionsScreen}
            options={{ title: 'جلسات الميزانية' }}
          />
          <Stack.Screen 
            name="DailyReport"
            component={DailyReportScreen}
            options={{ title: 'التقرير اليومي' }}
          />
          <Stack.Screen 
            name="Income"
            component={IncomeScreen}
            options={{ title: 'الإيرادات الأخرى' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}

