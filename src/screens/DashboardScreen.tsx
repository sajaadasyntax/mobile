import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={styles.welcome}>
            مرحباً، {user?.username}
          </Text>
          <Text variant="bodyMedium" style={styles.role}>
            {user?.role === 'AUDITOR' ? 'مراجع عام' : user?.role === 'ACCOUNTANT' ? 'محاسب' : 'مدير'}
          </Text>
        </View>
        <IconButton
          icon="logout"
          size={24}
          onPress={handleLogout}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          المخازن
        </Text>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="warehouse"
              onPress={() => navigation.navigate('Inventory')}
              style={styles.actionButton}
            >
              المخازن والمخزون
            </Button>
          </Card.Content>
        </Card>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          التقارير
        </Text>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="chart-bar"
              onPress={() => navigation.navigate('BalanceSheet')}
              style={styles.actionButton}
            >
              الميزانية وقائمة الدخل
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="cart"
              onPress={() => navigation.navigate('SalesReport')}
              style={styles.actionButton}
            >
              تقرير المبيعات
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="package"
              onPress={() => navigation.navigate('ProcurementReport')}
              style={styles.actionButton}
            >
              تقرير المشتريات
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="account"
              onPress={() => navigation.navigate('CustomerReport')}
              style={styles.actionButton}
            >
              تقرير العملاء
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="truck-delivery"
              onPress={() => navigation.navigate('Suppliers')}
              style={styles.actionButton}
            >
              تقرير الموردين
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="cash"
              onPress={() => navigation.navigate('LiquidCash')}
              style={styles.actionButton}
            >
              التقرير النقدي السائل
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="history"
              onPress={() => navigation.navigate('BalanceSessions')}
              style={styles.actionButton}
            >
              جلسات الميزانية السابقة
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="calendar-today"
              onPress={() => navigation.navigate('DailyReport')}
              style={styles.actionButton}
            >
              التقرير اليومي
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="cash-plus"
              onPress={() => navigation.navigate('Income')}
              style={styles.actionButton}
            >
              الإيرادات الأخرى
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="cash-minus"
              onPress={() => navigation.navigate('Expenses')}
              style={styles.actionButton}
            >
              المنصرفات
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="account-alert"
              onPress={() => navigation.navigate('OutstandingFees')}
              style={styles.actionButton}
            >
              تقرير المتأخرات
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="percent"
              onPress={() => navigation.navigate('CommissionReport')}
              style={styles.actionButton}
            >
              تقرير العمولات
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="chart-line"
              onPress={() => navigation.navigate('DailyIncomeLoss')}
              style={styles.actionButton}
            >
              الإيرادات والمنصرفات
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="bank"
              onPress={() => navigation.navigate('BankTransactions')}
              style={styles.actionButton}
            >
              المعاملات البنكية
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              icon="scale-balance"
              onPress={() => navigation.navigate('AssetsLiabilities')}
              style={styles.actionButton}
            >
              له و عليه (الأصول والالتزامات)
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  welcome: {
    fontWeight: 'bold',
  },
  role: {
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  actionButton: {
    borderRadius: 8,
  },
});

