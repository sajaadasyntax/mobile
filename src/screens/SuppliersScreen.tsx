import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime, paymentMethodLabels } from '../utils/formatters';

export default function SuppliersScreen() {
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
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await reportingAPI.getSupplierReport(params);
      setReportData(data);
    } catch (error: any) {
      console.error('Error loading supplier report:', error);
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
                <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي الأوامر</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {reportData.summary.totalOrders || 0}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي المشتريات</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {formatCurrency(reportData.summary.totalPurchases || 0)}
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
        <View style={styles.reportsContainer}>
          {reportData?.data?.map((order: any, index: number) => (
            <Card key={order.orderNumber || index} style={styles.orderCard}>
              <Card.Content>
                <View style={styles.orderHeader}>
                  <Text variant="titleMedium" style={styles.orderNumber}>
                    {order.orderNumber}
                  </Text>
                  <Text variant="headlineSmall" style={styles.orderTotal}>
                    {formatCurrency(order.total)}
                  </Text>
                </View>

                <View style={styles.orderDetails}>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    المورد: {order.supplier || 'مورد عام'}
                  </Text>
                  <Text variant="bodySmall" style={styles.detailText}>
                    {formatDateTime(order.date)}
                  </Text>
                </View>

                <View style={styles.chipRow}>
                  <Chip
                    mode="flat"
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          order.paymentStatus === 'PAID'
                            ? '#10b981'
                            : order.paymentStatus === 'PARTIAL'
                            ? '#f97316'
                            : '#ef4444',
                      },
                    ]}
                    textStyle={styles.chipText}
                  >
                    {order.paymentStatus === 'PAID'
                      ? 'مدفوع'
                      : order.paymentStatus === 'PARTIAL'
                      ? 'جزئي'
                      : 'آجل'}
                  </Chip>
                  {order.paymentMethod && (
                    <Chip
                      mode="flat"
                      style={styles.methodChip}
                      textStyle={styles.chipText}
                    >
                      {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                    </Chip>
                  )}
                </View>

                {order.items && order.items.length > 0 && (
                  <View style={styles.itemsSection}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>الأصناف</Text>
                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                      <Text key={idx} variant="bodySmall" style={styles.itemText}>
                        {item.itemName} ({item.quantity})
                      </Text>
                    ))}
                    {order.items.length > 3 && (
                      <Text variant="bodySmall" style={styles.moreItems}>
                        و {order.items.length - 3} صنف آخر...
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
                  لا توجد أوامر شراء للفترة المحددة
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
  reportsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  orderTotal: {
    fontWeight: 'bold',
    color: '#ef4444',
  },
  orderDetails: {
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

