import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime, paymentMethodLabels } from '../utils/formatters';

export default function BankTransactionsScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await reportingAPI.getBankTransactions(params);
      setReportData(data);
    } catch (error) {
      console.error('Error loading bank transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Filters */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.filterTitle}>الفترة الزمنية</Text>
          <View style={styles.dateRow}>
            <Button
              mode="outlined"
              onPress={() => {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
                loadReports();
              }}
              style={styles.dateButton}
            >
              اليوم
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                const today = new Date();
                const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                const dateStr = yesterday.toISOString().split('T')[0];
                setStartDate(dateStr);
                setEndDate(dateStr);
                loadReports();
              }}
              style={styles.dateButton}
            >
              أمس
            </Button>
          </View>
          <Button
            mode="contained"
            onPress={loadReports}
            style={styles.applyButton}
          >
            تحديث التقرير
          </Button>
        </Card.Content>
      </Card>

      {/* Summary */}
      {reportData?.summary && (
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { backgroundColor: '#3b82f6' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي المعاملات</Text>
              <Text variant="headlineSmall" style={styles.summaryValue}>
                {formatCurrency(reportData.summary.total || 0)}
              </Text>
              <Text variant="bodySmall" style={styles.summaryCount}>
                {reportData.summary.count || 0} معاملة
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.reportsContainer}>
          {reportData?.transactions?.map((transaction: any) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <Card.Content>
                <View style={styles.transactionHeader}>
                  <Text variant="titleMedium" style={styles.transactionType}>
                    {transaction.type === 'INCOME' ? 'إيداع' : 'سحب'}
                  </Text>
                  <Text variant="headlineSmall" style={[
                    styles.amount,
                    { color: transaction.type === 'INCOME' ? '#10b981' : '#ef4444' }
                  ]}>
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>

                <View style={styles.transactionDetails}>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    {paymentMethodLabels[transaction.method] || transaction.method}
                  </Text>
                  <Text variant="bodySmall" style={styles.detailText}>
                    {formatDateTime(transaction.date)}
                  </Text>
                  {transaction.description && (
                    <Text variant="bodySmall" style={styles.detailText}>
                      {transaction.description}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}

          {(!reportData?.transactions || reportData.transactions.length === 0) && (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  لا توجد معاملات بنكية للفترة المحددة
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCard: {
    margin: 16,
    marginBottom: 8,
  },
  filterTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
  },
  applyButton: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingTop: 0,
  },
  summaryCard: {
    flex: 1,
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
  summaryCount: {
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
    fontSize: 11,
  },
  reportsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  transactionCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionType: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  amount: {
    fontWeight: 'bold',
  },
  transactionDetails: {
    marginBottom: 8,
  },
  detailText: {
    color: '#666',
    marginBottom: 4,
  },
  emptyCard: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

