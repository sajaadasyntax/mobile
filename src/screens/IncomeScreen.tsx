import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, DataTable, Chip } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface IncomeItem {
  id: string;
  amount: string;
  method: 'CASH' | 'BANK' | 'BANK_NILE';
  description: string;
  createdAt: string;
  creator?: {
    username: string;
  };
}

export default function IncomeScreen() {
  const [income, setIncome] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadIncome();
  }, []);

  const loadIncome = async () => {
    try {
      const data = await reportingAPI.getIncome();
      setIncome(data);
    } catch (error) {
      console.error('Error loading income:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadIncome();
  };

  const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const cashIncome = income
    .filter((item) => item.method === 'CASH')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const bankIncome = income
    .filter((item) => item.method === 'BANK')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const bankNileIncome = income
    .filter((item) => item.method === 'BANK_NILE')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'كاش',
      BANK: 'بنك',
      BANK_NILE: 'بنك النيل',
    };
    return labels[method] || method;
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      CASH: '#10b981',
      BANK: '#3b82f6',
      BANK_NILE: '#8b5cf6',
    };
    return colors[method] || '#6b7280';
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <Card style={[styles.card, { backgroundColor: '#10b981' }]}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.cardLabel}>
              إجمالي الإيرادات
            </Text>
            <Text variant="headlineMedium" style={styles.cardValue}>
              {formatCurrency(totalIncome)}
            </Text>
            <Text variant="bodySmall" style={styles.cardCount}>
              {income.length} إيراد
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.row}>
          <Card style={[styles.smallCard, { backgroundColor: '#10b981' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.cardLabel}>
                كاش
              </Text>
              <Text variant="titleMedium" style={styles.cardValue}>
                {formatCurrency(cashIncome)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.smallCard, { backgroundColor: '#3b82f6' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.cardLabel}>
                بنك
              </Text>
              <Text variant="titleMedium" style={styles.cardValue}>
                {formatCurrency(bankIncome)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.smallCard, { backgroundColor: '#8b5cf6' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.cardLabel}>
                بنك النيل
              </Text>
              <Text variant="titleMedium" style={styles.cardValue}>
                {formatCurrency(bankNileIncome)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Income List */}
      <Card style={styles.tableCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.tableTitle}>
            قائمة الإيرادات الأخرى
          </Text>

          {income.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                لا توجد إيرادات مسجلة
              </Text>
            </View>
          ) : (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>الوصف</DataTable.Title>
                <DataTable.Title numeric>المبلغ</DataTable.Title>
                <DataTable.Title>الطريقة</DataTable.Title>
              </DataTable.Header>

              {income.map((item) => (
                <DataTable.Row key={item.id}>
                  <DataTable.Cell>
                    <View>
                      <Text variant="bodyMedium" style={styles.description}>
                        {item.description}
                      </Text>
                      <Text variant="bodySmall" style={styles.metadata}>
                        {formatDateTime(item.createdAt)}
                      </Text>
                      {item.creator && (
                        <Text variant="bodySmall" style={styles.metadata}>
                          {item.creator.username}
                        </Text>
                      )}
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.amount}>
                      {formatCurrency(parseFloat(item.amount))}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      mode="flat"
                      style={[
                        styles.methodChip,
                        { backgroundColor: getMethodColor(item.method) },
                      ]}
                      textStyle={styles.methodChipText}
                    >
                      {getMethodLabel(item.method)}
                    </Chip>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
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
  cardsContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  smallCard: {
    flex: 1,
    borderRadius: 12,
  },
  cardLabel: {
    color: 'white',
    opacity: 0.9,
  },
  cardValue: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardCount: {
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
  },
  tableCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  tableTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
  },
  description: {
    fontWeight: '500',
  },
  metadata: {
    color: '#6b7280',
    marginTop: 2,
  },
  amount: {
    fontWeight: 'bold',
    color: '#10b981',
    fontSize: 16,
  },
  methodChip: {
    alignSelf: 'flex-start',
  },
  methodChipText: {
    color: 'white',
    fontSize: 11,
  },
});

