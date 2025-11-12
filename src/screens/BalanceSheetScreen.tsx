import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Divider } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function BalanceSheetScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const balance = await reportingAPI.getBalanceSummary();
      setData(balance);
    } catch (error) {
      console.error('Error loading balance sheet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loading}>
        <Text>لا توجد بيانات</Text>
      </View>
    );
  }

  const revenue = parseFloat(data.sales.total);
  const collected = parseFloat(data.sales.collected);
  const receivables = revenue - collected;
  const costs = parseFloat(data.procurement.total) + parseFloat(data.expenses.total);
  const netProfit = revenue - costs;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Income Statement */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          قائمة الدخل
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>الإيرادات</Text>
            
            <View style={styles.row}>
              <Text>إجمالي المبيعات</Text>
              <Text style={styles.amount}>{formatCurrency(revenue)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text>المحصل</Text>
              <Text style={[styles.amount, styles.positive]}>{formatCurrency(collected)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text>المستحقات (ذمم)</Text>
              <Text style={[styles.amount, styles.warning]}>{formatCurrency(receivables)}</Text>
            </View>

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={styles.cardTitle}>التكاليف</Text>
            
            <View style={styles.row}>
              <Text>المشتريات</Text>
              <Text style={[styles.amount, styles.negative]}>{formatCurrency(data.procurement.total)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text>المنصرفات</Text>
              <Text style={[styles.amount, styles.negative]}>{formatCurrency(data.expenses.total)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.bold}>إجمالي التكاليف</Text>
              <Text style={[styles.amount, styles.bold, styles.negative]}>{formatCurrency(costs)}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text variant="titleMedium" style={styles.bold}>صافي الربح/الخسارة</Text>
              <Text variant="titleLarge" style={[styles.amount, styles.bold, netProfit >= 0 ? styles.positive : styles.negative]}>
                {formatCurrency(netProfit)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text>هامش الربح</Text>
              <Text style={[styles.amount, profitMargin >= 0 ? styles.positive : styles.negative]}>
                {profitMargin.toFixed(2)}%
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Balance Sheet */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          الميزانية العمومية
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>الأصول</Text>
            
            <View style={styles.row}>
              <Text>الرصيد النقدي (كاش + بنك)</Text>
              <Text style={styles.amount}>{formatCurrency(collected)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text>الذمم المدينة (مستحقات العملاء)</Text>
              <Text style={styles.amount}>{formatCurrency(receivables)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.bold}>إجمالي الأصول</Text>
              <Text style={[styles.amount, styles.bold]}>{formatCurrency(collected + receivables)}</Text>
            </View>

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={styles.cardTitle}>حقوق الملكية</Text>
            
            <View style={styles.row}>
              <Text>رأس المال الافتتاحي</Text>
              <Text style={styles.amount}>{formatCurrency(data.openingBalance || 0)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text>الأرباح المحتجزة</Text>
              <Text style={[styles.amount, netProfit >= 0 ? styles.positive : styles.negative]}>
                {formatCurrency(netProfit)}
              </Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.bold}>إجمالي حقوق الملكية</Text>
              <Text style={[styles.amount, styles.bold]}>
                {formatCurrency((data.openingBalance || 0) + netProfit)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>المحصل</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(collected)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>التكاليف</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(costs)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: netProfit >= 0 ? '#3b82f6' : '#f97316' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>صافي الربح</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(netProfit)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#6b7280' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>الرصيد النقدي</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(collected)}
            </Text>
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
  contentContainer: {
    paddingBottom: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 8,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  amount: {
    fontWeight: '500',
  },
  bold: {
    fontWeight: 'bold',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  warning: {
    color: '#f97316',
  },
  divider: {
    marginVertical: 12,
  },
  summaryContainer: {
    padding: 16,
    paddingTop: 0,
  },
  summaryCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  summaryLabel: {
    color: 'white',
    opacity: 0.9,
  },
  summaryValue: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
});

