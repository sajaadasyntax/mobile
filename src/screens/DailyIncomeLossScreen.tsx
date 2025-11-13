import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function DailyIncomeLossScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = { date };
      const data = await reportingAPI.getDailyIncomeLoss(params);
      setReportData(data);
    } catch (error: any) {
      console.error('Error loading daily income/loss:', error);
      setReportData(null);
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Filter */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.filterTitle}>التاريخ</Text>
            <View style={styles.dateRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setDate(today);
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
                  setDate(yesterday.toISOString().split('T')[0]);
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
        {reportData && (
          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>الإيرادات</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {formatCurrency(reportData.totalIncome || 0)}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>المنصرفات</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {formatCurrency(reportData.totalExpenses || 0)}
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {reportData && (
          <Card style={[styles.netCard, { backgroundColor: (reportData.netIncome || 0) >= 0 ? '#10b981' : '#ef4444' }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.netLabel}>صافي الربح/الخسارة</Text>
              <Text variant="headlineMedium" style={styles.netValue}>
                {formatCurrency(reportData.netIncome || 0)}
              </Text>
            </Card.Content>
          </Card>
        )}
        <View style={styles.reportsContainer}>
          {/* Income */}
          {reportData?.income && reportData.income.length > 0 && (
            <>
              <Text variant="titleLarge" style={styles.sectionHeader}>الإيرادات</Text>
              {reportData.income.map((item: any) => (
                <Card key={item.id} style={styles.incomeCard}>
                  <Card.Content>
                    <View style={styles.itemHeader}>
                      <Text variant="titleMedium" style={styles.itemName}>
                        {item.description || 'إيراد'}
                      </Text>
                      <Text variant="headlineSmall" style={styles.itemAmount}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.itemDate}>
                      {formatDateTime(item.createdAt)}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}

          {/* Expenses */}
          {reportData?.expenses && reportData.expenses.length > 0 && (
            <>
              <Text variant="titleLarge" style={styles.sectionHeader}>المنصرفات</Text>
              {reportData.expenses.map((item: any) => (
                <Card key={item.id} style={styles.expenseCard}>
                  <Card.Content>
                    <View style={styles.itemHeader}>
                      <Text variant="titleMedium" style={styles.itemName}>
                        {item.description || 'منصرف'}
                      </Text>
                      <Text variant="headlineSmall" style={styles.itemAmount}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.itemDate}>
                      {formatDateTime(item.createdAt)}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}

          {(!reportData?.income || reportData.income.length === 0) &&
            (!reportData?.expenses || reportData.expenses.length === 0) && (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    لا توجد بيانات للتاريخ المحدد
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
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
    minWidth: '45%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
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
  netCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
  },
  netLabel: {
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  netValue: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  reportsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
    color: '#374151',
  },
  incomeCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
  },
  expenseCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontWeight: 'bold',
    flex: 1,
  },
  itemAmount: {
    fontWeight: 'bold',
  },
  itemDate: {
    color: '#666',
  },
  emptyCard: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

