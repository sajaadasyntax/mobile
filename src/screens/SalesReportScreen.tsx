import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip, Searchbar, SegmentedButtons, Button } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime, paymentStatusLabels, deliveryStatusLabels, sectionLabels, paymentMethodLabels } from '../utils/formatters';

export default function SalesReportScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState(''); // Single date only

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      // Single date only
      if (date) {
        params.date = date;
      }

      const data = await reportingAPI.getSalesReports(params);
      setReportData(data);
    } catch (error: any) {
      console.error('Error loading sales reports:', error);
      // Set empty data structure to prevent white screen
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

  const applyDateFilter = () => {
    loadReports();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  if (!reportData && !loading) {
    return (
      <View style={styles.loading}>
        <Text>لا توجد بيانات للعرض</Text>
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
            <Text variant="titleMedium" style={styles.filterTitle}>اختر التاريخ</Text>
            <View style={styles.dateRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setDate(today);
                  applyDateFilter();
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
                  applyDateFilter();
                }}
                style={styles.dateButton}
              >
                أمس
              </Button>
            </View>
            <Text variant="bodyMedium" style={styles.dateLabel}>
              التاريخ المحدد: {date || 'لم يتم التحديد'}
            </Text>
            <Button
              mode="contained"
              onPress={applyDateFilter}
              style={styles.applyButton}
            >
              تحديث التقرير
            </Button>
          </Card.Content>
        </Card>

        {/* Summary Cards */}
        {reportData?.summary && (
          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, { backgroundColor: '#3b82f6' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي الفواتير</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>{reportData.summary.totalInvoices || 0}</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي المبيعات</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>{formatCurrency(reportData.summary.totalSales || 0)}</Text>
              </Card.Content>
            </Card>
          </View>
        )}
        <View style={styles.reportsContainer}>
          {reportData?.data && reportData.data.length > 0 ? (
            reportData.data.map((periodData: any, index: number) => (
              <Card key={index} style={styles.periodCard}>
                <Card.Content>
                  <View style={styles.periodHeader}>
                    <Text variant="titleMedium" style={styles.periodTitle}>
                      {periodData.date ? formatDateTime(periodData.date) : (date ? formatDateTime(date) : 'التاريخ غير محدد')}
                    </Text>
                    <Text variant="bodySmall" style={styles.periodStats}>
                      {periodData.invoiceCount || periodData.count || 0} فاتورة - {formatCurrency(periodData.totalSales || periodData.totalAmount || 0)}
                    </Text>
                  </View>

                  {/* Payment Methods */}
                  {periodData.paymentMethods && Object.keys(periodData.paymentMethods).length > 0 && (
                    <View style={styles.section}>
                      <Text variant="titleSmall" style={styles.sectionTitle}>طرق الدفع</Text>
                      <View style={styles.chipRow}>
                        {Object.entries(periodData.paymentMethods).map(([method, data]: [string, any]) => (
                          <Chip
                            key={method}
                            mode="flat"
                            style={styles.chip}
                            textStyle={styles.chipText}
                          >
                            {paymentMethodLabels[method] || method}: {data?.count || 0}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Items Summary */}
                  {periodData.items && Object.keys(periodData.items).length > 0 && (
                    <View style={styles.section}>
                      <Text variant="titleSmall" style={styles.sectionTitle}>الأصناف المباعة</Text>
                      {Object.entries(periodData.items).slice(0, 5).map(([itemName, itemData]: [string, any]) => (
                        <View key={itemName} style={styles.itemRow}>
                          <Text variant="bodyMedium" style={styles.itemName}>{itemName}</Text>
                          <Text variant="bodySmall" style={styles.itemDetails}>
                            {itemData.quantity || 0} × {formatCurrency(itemData.unitPrice || itemData.price || 0)} = {formatCurrency(itemData.totalAmount || 0)}
                          </Text>
                        </View>
                      ))}
                      {Object.keys(periodData.items).length > 5 && (
                        <Text variant="bodySmall" style={styles.moreItems}>
                          و {Object.keys(periodData.items).length - 5} صنف آخر...
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Recent Invoices */}
                  {periodData.invoices && periodData.invoices.length > 0 && (
                    <View style={styles.section}>
                      <Text variant="titleSmall" style={styles.sectionTitle}>آخر الفواتير</Text>
                      {periodData.invoices.slice(0, 3).map((invoice: any) => (
                        <View key={invoice.id} style={styles.invoiceRow}>
                          <Text variant="bodyMedium" style={styles.invoiceNumber}>
                            {invoice.invoiceNumber || invoice.number || 'N/A'}
                          </Text>
                          <Text variant="bodySmall" style={styles.invoiceDetails}>
                            {invoice.customer?.name || 'عميل'} - {formatCurrency(invoice.total || 0)}
                          </Text>
                          <View style={styles.invoiceChips}>
                            {invoice.paymentStatus && (
                              <Chip
                                mode="flat"
                                style={[
                                  styles.statusChip,
                                  { backgroundColor: invoice.paymentStatus === 'PAID' ? '#10b981' : invoice.paymentStatus === 'PARTIAL' ? '#f97316' : '#ef4444' }
                                ]}
                                textStyle={styles.chipText}
                              >
                                {paymentStatusLabels[invoice.paymentStatus] || invoice.paymentStatus}
                              </Chip>
                            )}
                            {invoice.deliveryStatus && (
                              <Chip
                                mode="flat"
                                style={[
                                  styles.statusChip,
                                  { backgroundColor: invoice.deliveryStatus === 'DELIVERED' ? '#10b981' : '#f97316' }
                                ]}
                                textStyle={styles.chipText}
                              >
                                {deliveryStatusLabels[invoice.deliveryStatus] || invoice.deliveryStatus}
                              </Chip>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.periodCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  لا توجد بيانات للعرض. يرجى اختيار تاريخ وتحديث التقرير.
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  filterCard: {
    margin: 16,
    marginTop: 0,
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
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
  applyButton: {
    marginTop: 8,
  },
  dateLabel: {
    marginTop: 12,
    marginBottom: 8,
    color: '#666',
    textAlign: 'center',
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
  periodCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  periodHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  periodTitle: {
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  periodStats: {
    color: '#666',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: 'white',
    fontSize: 11,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemName: {
    flex: 1,
    fontWeight: '500',
  },
  itemDetails: {
    color: '#666',
    fontSize: 12,
  },
  moreItems: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  invoiceRow: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  invoiceNumber: {
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  invoiceDetails: {
    color: '#666',
    marginBottom: 8,
  },
  invoiceChips: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
});

