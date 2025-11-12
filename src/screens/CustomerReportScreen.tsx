import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime, paymentMethodLabels } from '../utils/formatters';

export default function CustomerReportScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Load today's report by default
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

      const data = await reportingAPI.getCustomerReport(params);
      setReportData(data);
    } catch (error) {
      console.error('Error loading customer report:', error);
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
                {formatCurrency(reportData.summary.totalSales || 0)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.reportsContainer}>
          {reportData?.data?.map((invoice: any, index: number) => (
            <Card key={invoice.invoiceNumber || index} style={styles.invoiceCard}>
              <Card.Content>
                <View style={styles.invoiceHeader}>
                  <Text variant="titleMedium" style={styles.invoiceNumber}>
                    {invoice.invoiceNumber}
                  </Text>
                  <Text variant="headlineSmall" style={styles.invoiceTotal}>
                    {formatCurrency(invoice.total)}
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

