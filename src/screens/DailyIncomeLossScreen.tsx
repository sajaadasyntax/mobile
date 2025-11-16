import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TextInput, Alert } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime, sanitizeErrorMessage } from '../utils/formatters';

export default function DailyIncomeLossScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (date) {
      loadReports();
    }
  }, [date]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = { date };
      const data = await reportingAPI.getDailyIncomeLoss(params);
      setReportData(data);
    } catch (error: any) {
      console.error('Error loading daily income/loss:', error);
      const errorMessage = error.response?.data?.error || error.message || 'فشل تحميل البيانات';
      if (error.response?.status === 403 || error.response?.status === 401) {
        Alert.alert('خطأ في الصلاحيات', sanitizeErrorMessage(errorMessage));
      } else {
        Alert.alert('خطأ', sanitizeErrorMessage(errorMessage));
      }
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
            
            <View style={styles.dateInputContainer}>
              <View style={styles.dateInputRow}>
                <Text variant="bodySmall" style={styles.dateLabel}>التاريخ:</Text>
                <TextInput
                  style={styles.dateInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.dateRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setDate(today);
                }}
                style={styles.dateButton}
                compact
              >
                اليوم
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  const today = new Date();
                  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                  setDate(yesterday.toISOString().split('T')[0]);
                }}
                style={styles.dateButton}
                compact
              >
                أمس
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setDate(weekAgo.toISOString().split('T')[0]);
                }}
                style={styles.dateButton}
                compact
              >
                آخر أسبوع
              </Button>
            </View>
            
            <Text variant="bodySmall" style={styles.selectedFilterText}>
              {date 
                ? `التاريخ المحدد: ${date}`
                : 'يرجى تحديد التاريخ'
              }
            </Text>
          </Card.Content>
        </Card>

        {/* Summary */}
        {reportData?.summary && (
          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>الإيرادات</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {formatCurrency(parseFloat(reportData.summary.totalIncome || '0'))}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>المنصرفات</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {formatCurrency(parseFloat(reportData.summary.totalLosses || '0'))}
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {reportData?.summary && (
          <Card style={[styles.netCard, { backgroundColor: parseFloat(reportData.summary.netProfit || '0') >= 0 ? '#10b981' : '#ef4444' }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.netLabel}>صافي الربح/الخسارة</Text>
              <Text variant="headlineMedium" style={styles.netValue}>
                {formatCurrency(parseFloat(reportData.summary.netProfit || '0'))}
              </Text>
            </Card.Content>
          </Card>
        )}
        <View style={styles.reportsContainer}>
          {/* Daily Reports */}
          {reportData?.dailyReports && reportData.dailyReports.length > 0 ? (
            reportData.dailyReports.map((day: any, index: number) => (
              <View key={index} style={styles.dayContainer}>
                <Text variant="titleLarge" style={styles.sectionHeader}>
                  {formatDateTime(day.date)}
                </Text>
                
                {/* Day Summary */}
                <View style={styles.daySummaryRow}>
                  <Card style={[styles.daySummaryCard, { backgroundColor: '#d1fae5' }]}>
                    <Card.Content>
                      <Text variant="bodySmall" style={styles.daySummaryLabel}>الإيرادات</Text>
                      <Text variant="titleMedium" style={styles.daySummaryValue}>
                        {formatCurrency(parseFloat(day.totalIncome || '0'))}
                      </Text>
                      <Text variant="bodySmall" style={styles.daySummaryCount}>
                        {day.incomeCount || 0} معاملة
                      </Text>
                    </Card.Content>
                  </Card>

                  <Card style={[styles.daySummaryCard, { backgroundColor: '#fee2e2' }]}>
                    <Card.Content>
                      <Text variant="bodySmall" style={styles.daySummaryLabel}>المنصرفات</Text>
                      <Text variant="titleMedium" style={styles.daySummaryValue}>
                        {formatCurrency(parseFloat(day.totalLosses || '0'))}
                      </Text>
                      <Text variant="bodySmall" style={styles.daySummaryCount}>
                        {day.lossesCount || 0} معاملة
                      </Text>
                    </Card.Content>
                  </Card>
                </View>

                {/* Income Items */}
                {day.income && day.income.length > 0 && (
                  <>
                    <Text variant="titleMedium" style={styles.daySectionHeader}>الإيرادات</Text>
                    {day.income.map((item: any) => (
                      <Card key={item.id} style={styles.incomeCard}>
                        <Card.Content>
                          <View style={styles.itemHeader}>
                            <Text variant="titleMedium" style={styles.itemName}>
                              {item.typeLabel || item.details?.description || 'إيراد'}
                            </Text>
                            <Text variant="headlineSmall" style={styles.itemAmount}>
                              {formatCurrency(parseFloat(item.amount || '0'))}
                            </Text>
                          </View>
                          <Text variant="bodySmall" style={styles.itemDate}>
                            {formatDateTime(item.date)}
                          </Text>
                          {item.details?.customer && (
                            <Text variant="bodySmall" style={styles.itemDetails}>
                              العميل: {item.details.customer}
                            </Text>
                          )}
                        </Card.Content>
                      </Card>
                    ))}
                  </>
                )}

                {/* Expense Items */}
                {day.losses && day.losses.length > 0 && (
                  <>
                    <Text variant="titleMedium" style={styles.daySectionHeader}>المنصرفات</Text>
                    {day.losses.map((item: any) => (
                      <Card key={item.id} style={styles.expenseCard}>
                        <Card.Content>
                          <View style={styles.itemHeader}>
                            <Text variant="titleMedium" style={styles.itemName}>
                              {item.typeLabel || item.details?.description || 'منصرف'}
                            </Text>
                            <Text variant="headlineSmall" style={styles.itemAmount}>
                              {formatCurrency(parseFloat(item.amount || '0'))}
                            </Text>
                          </View>
                          <Text variant="bodySmall" style={styles.itemDate}>
                            {formatDateTime(item.date)}
                          </Text>
                          {item.details?.supplier && (
                            <Text variant="bodySmall" style={styles.itemDetails}>
                              المورد: {item.details.supplier}
                            </Text>
                          )}
                        </Card.Content>
                      </Card>
                    ))}
                  </>
                )}
              </View>
            ))
          ) : (
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
  dateInputContainer: {
    marginBottom: 12,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dateLabel: {
    minWidth: 80,
    fontWeight: '500',
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
    minWidth: '30%',
  },
  selectedFilterText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
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
  dayContainer: {
    marginBottom: 24,
  },
  daySummaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  daySummaryCard: {
    flex: 1,
    borderRadius: 8,
  },
  daySummaryLabel: {
    color: '#374151',
    opacity: 0.9,
    fontSize: 12,
  },
  daySummaryValue: {
    color: '#374151',
    fontWeight: 'bold',
    marginTop: 4,
  },
  daySummaryCount: {
    color: '#374151',
    opacity: 0.7,
    marginTop: 4,
    fontSize: 11,
  },
  daySectionHeader: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
    color: '#374151',
  },
  itemDetails: {
    color: '#666',
    marginTop: 4,
  },
});

