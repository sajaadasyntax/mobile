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
            options={{ title: 'لوحة التحكم - مراجع عام' }}
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

