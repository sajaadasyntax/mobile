import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, DataTable, Chip } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface ExpenseItem {
  id: string;
  amount: string;
  method: 'CASH' | 'BANK' | 'BANK_NILE';
  description: string;
  createdAt: string;
  creator?: {
    username: string;
  };
  inventory?: {
    name: string;
  };
}

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await reportingAPI.getExpenses();
      setExpenses(data);
    } catch (error: any) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses();
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const cashExpenses = expenses
    .filter((item) => item.method === 'CASH')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const bankExpenses = expenses
    .filter((item) => item.method === 'BANK')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const bankNileExpenses = expenses
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
      CASH: '#ef4444',
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
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <Card style={[styles.card, { backgroundColor: '#ef4444' }]}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.cardLabel}>
              إجمالي المنصرفات
            </Text>
            <Text variant="headlineMedium" style={styles.cardValue}>
              {formatCurrency(totalExpenses)}
            </Text>
            <Text variant="bodySmall" style={styles.cardCount}>
              {expenses.length} منصرف
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.row}>
          <Card style={[styles.smallCard, { backgroundColor: '#ef4444' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.cardLabel}>
                كاش
              </Text>
              <Text variant="titleMedium" style={styles.cardValue}>
                {formatCurrency(cashExpenses)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.smallCard, { backgroundColor: '#3b82f6' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.cardLabel}>
                بنك
              </Text>
              <Text variant="titleMedium" style={styles.cardValue}>
                {formatCurrency(bankExpenses)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.smallCard, { backgroundColor: '#8b5cf6' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.cardLabel}>
                بنك النيل
              </Text>
              <Text variant="titleMedium" style={styles.cardValue}>
                {formatCurrency(bankNileExpenses)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Expenses List */}
      <Card style={styles.tableCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.tableTitle}>
            قائمة المنصرفات
          </Text>

          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                لا توجد منصرفات مسجلة
              </Text>
            </View>
          ) : (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>الوصف</DataTable.Title>
                <DataTable.Title numeric>المبلغ</DataTable.Title>
                <DataTable.Title>الطريقة</DataTable.Title>
              </DataTable.Header>

              {expenses.map((item) => (
                <DataTable.Row key={item.id}>
                  <DataTable.Cell>
                    <View>
                      <Text variant="bodyMedium" style={styles.description}>
                        {item.description}
                      </Text>
                      {item.inventory && (
                        <Text variant="bodySmall" style={styles.metadata}>
                          {item.inventory.name}
                        </Text>
                      )}
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
  contentContainer: {
    paddingBottom: 20,
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
    flex: 1,
  },
  metadata: {
    color: '#6b7280',
    marginTop: 2,
  },
  amount: {
    fontWeight: 'bold',
    color: '#ef4444',
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

