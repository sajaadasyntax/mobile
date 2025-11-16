import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TextInput, Alert } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime, paymentMethodLabels, sanitizeErrorMessage } from '../utils/formatters';

export default function CustomerReportScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadReports();
    }
  }, [startDate, endDate]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await reportingAPI.getCustomerReport(params);
      setReportData(data);
    } catch (error: any) {
      console.error('Error loading customer report:', error);
      const errorMessage = error.response?.data?.error || error.message || 'فشل تحميل البيانات';
      if (error.response?.status === 403 || error.response?.status === 401) {
        Alert.alert('خطأ في الصلاحيات', sanitizeErrorMessage(errorMessage));
      } else {
        Alert.alert('خطأ', sanitizeErrorMessage(errorMessage));
      }
      setReportData({ summary: null, data: [] });
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
        {/* Date Filters */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.filterTitle}>الفترة الزمنية</Text>
            
            <View style={styles.dateInputContainer}>
              <View style={styles.dateInputRow}>
                <Text variant="bodySmall" style={styles.dateLabel}>من تاريخ:</Text>
                <TextInput
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.dateInputRow}>
                <Text variant="bodySmall" style={styles.dateLabel}>إلى تاريخ:</Text>
                <TextInput
                  style={styles.dateInput}
                  value={endDate}
                  onChangeText={setEndDate}
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
                  setStartDate(today);
                  setEndDate(today);
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
                  const dateStr = yesterday.toISOString().split('T')[0];
                  setStartDate(dateStr);
                  setEndDate(dateStr);
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
                  setStartDate(weekAgo.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
                style={styles.dateButton}
                compact
              >
                آخر أسبوع
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  const today = new Date();
                  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  setStartDate(monthAgo.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
                style={styles.dateButton}
                compact
              >
                آخر شهر
              </Button>
            </View>
            
            <Text variant="bodySmall" style={styles.selectedFilterText}>
              {startDate && endDate 
                ? `من ${startDate} إلى ${endDate}`
                : 'يرجى تحديد الفترة الزمنية'
              }
            </Text>
          </Card.Content>
        </Card>

        {/* Summary */}
        {reportData?.summary && (
          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, { backgroundColor: '#3b82f6' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي الفواتير</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {reportData.summary.totalInvoices || 0}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي المبيعات</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {formatCurrency(parseFloat(reportData.summary.totalSales || '0'))}
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
        <View style={styles.reportsContainer}>
          {reportData?.data?.map((invoice: any, index: number) => (
            <Card key={invoice.invoiceNumber || index} style={styles.invoiceCard}>
              <Card.Content>
                <View style={styles.invoiceHeader}>
                  <Text variant="titleMedium" style={styles.invoiceNumber}>
                    {invoice.invoiceNumber}
                  </Text>
                  <Text variant="headlineSmall" style={styles.invoiceTotal}>
                    {formatCurrency(parseFloat(invoice.total || '0'))}
                  </Text>
                </View>

                <View style={styles.invoiceDetails}>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    العميل: {invoice.customer || 'عميل عام'}
                  </Text>
                  <Text variant="bodySmall" style={styles.detailText}>
                    {formatDateTime(invoice.date)}
                  </Text>
                </View>

                <View style={styles.chipRow}>
                  <Chip
                    mode="flat"
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          invoice.paymentStatus === 'PAID'
                            ? '#10b981'
                            : invoice.paymentStatus === 'PARTIAL'
                            ? '#f97316'
                            : '#ef4444',
                      },
                    ]}
                    textStyle={styles.chipText}
                  >
                    {invoice.paymentStatus === 'PAID'
                      ? 'مدفوع'
                      : invoice.paymentStatus === 'PARTIAL'
                      ? 'جزئي'
                      : invoice.paymentStatus === 'CREDIT'
                      ? 'آجل'
                      : 'آجل'}
                  </Chip>
                  <Chip
                    mode="flat"
                    style={styles.methodChip}
                    textStyle={styles.chipText}
                  >
                    {paymentMethodLabels[invoice.paymentMethod] || invoice.paymentMethod}
                  </Chip>
                </View>

                {invoice.items && invoice.items.length > 0 && (
                  <View style={styles.itemsSection}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>الأصناف</Text>
                    {invoice.items.slice(0, 3).map((item: any, idx: number) => (
                      <Text key={idx} variant="bodySmall" style={styles.itemText}>
                        {item.itemName} ({item.quantity})
                      </Text>
                    ))}
                    {invoice.items.length > 3 && (
                      <Text variant="bodySmall" style={styles.moreItems}>
                        و {invoice.items.length - 3} صنف آخر...
                      </Text>
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>
          ))}

          {(!reportData?.data || reportData.data.length === 0) && (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  لا توجد فواتير للفترة المحددة
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
    minWidth: '22%',
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
  reportsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  invoiceCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  invoiceTotal: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  invoiceDetails: {
    marginBottom: 12,
  },
  detailText: {
    color: '#666',
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  methodChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
  },
  chipText: {
    color: 'white',
    fontSize: 11,
  },
  itemsSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemText: {
    color: '#666',
    marginBottom: 4,
  },
  moreItems: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyCard: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

