import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip, Searchbar, SegmentedButtons, Button } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime, procOrderStatusLabels, sectionLabels } from '../utils/formatters';

export default function ProcurementReportScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const params: any = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await reportingAPI.getProcurementReports(params);
      setReportData(data);
    } catch (error) {
      console.error('Error loading procurement reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Period Selector */}
        <View style={styles.header}>
          <SegmentedButtons
            value={period}
            onValueChange={handlePeriodChange}
            buttons={[
              { value: 'daily', label: 'يومي' },
              { value: 'monthly', label: 'شهري' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Date Filters */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.filterTitle}>فلترة التاريخ</Text>
            <View style={styles.dateRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setStartDate(today);
                  setEndDate(today);
                }}
                style={styles.dateButton}
              >
                اليوم
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
              >
                آخر شهر
              </Button>
            </View>
            <Button
              mode="contained"
              onPress={applyDateFilter}
              style={styles.applyButton}
            >
              تطبيق الفلتر
            </Button>
          </Card.Content>
        </Card>

        {/* Summary Cards */}
        {reportData?.summary && (
          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي الأوامر</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>{reportData.summary.totalOrders}</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: '#f97316' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي المشتريات</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>{formatCurrency(reportData.summary.totalAmount)}</Text>
              </Card.Content>
            </Card>
          </View>
        )}
        <View style={styles.reportsContainer}>
          {reportData?.data?.map((periodData: any, index: number) => (
            <Card key={index} style={styles.periodCard}>
              <Card.Content>
                <View style={styles.periodHeader}>
                  <Text variant="titleMedium" style={styles.periodTitle}>
                    {period === 'daily' 
                      ? formatDateTime(periodData.date)
                      : periodData.month
                    }
                  </Text>
                  <Text variant="bodySmall" style={styles.periodStats}>
                    {periodData.orderCount} أمر - {formatCurrency(periodData.totalAmount)}
                  </Text>
                </View>

                {/* Status Summary */}
                <View style={styles.section}>
                  <Text variant="titleSmall" style={styles.sectionTitle}>حالات الأوامر</Text>
                  <View style={styles.chipRow}>
                    {Object.entries(periodData.statuses).map(([status, data]: [string, any]) => (
                      <Chip
                        key={status}
                        mode="flat"
                        style={[
                          styles.chip,
                          { backgroundColor: 
                            status === 'RECEIVED' ? '#10b981' : 
                            status === 'PARTIAL' ? '#f97316' :
                            status === 'CANCELLED' ? '#ef4444' : '#3b82f6'
                          }
                        ]}
                        textStyle={styles.chipText}
                      >
                        {procOrderStatusLabels[status]}: {data.count}
                      </Chip>
                    ))}
                  </View>
                </View>

                {/* Suppliers Summary */}
                <View style={styles.section}>
                  <Text variant="titleSmall" style={styles.sectionTitle}>الموردين</Text>
                  <View style={styles.chipRow}>
                    {Object.entries(periodData.suppliers).slice(0, 3).map(([supplierName, data]: [string, any]) => (
                      <Chip
                        key={supplierName}
                        mode="flat"
                        style={styles.chip}
                        textStyle={styles.chipText}
                      >
                        {supplierName}: {data.count}
                      </Chip>
                    ))}
                  </View>
                </View>

                {/* Items Summary */}
                <View style={styles.section}>
                  <Text variant="titleSmall" style={styles.sectionTitle}>الأصناف المشتراة</Text>
                  {Object.entries(periodData.items).slice(0, 5).map(([itemName, itemData]: [string, any]) => (
                    <View key={itemName} style={styles.itemRow}>
                      <Text variant="bodyMedium" style={styles.itemName}>{itemName}</Text>
                      <Text variant="bodySmall" style={styles.itemDetails}>
                        {itemData.quantity} × {formatCurrency(itemData.unitCost)} = {formatCurrency(itemData.totalAmount)}
                      </Text>
                    </View>
                  ))}
                  {Object.keys(periodData.items).length > 5 && (
                    <Text variant="bodySmall" style={styles.moreItems}>
                      و {Object.keys(periodData.items).length - 5} صنف آخر...
                    </Text>
                  )}
                </View>

                {/* Recent Orders */}
                <View style={styles.section}>
                  <Text variant="titleSmall" style={styles.sectionTitle}>آخر الأوامر</Text>
                  {periodData.orders.slice(0, 3).map((order: any) => (
                    <View key={order.id} style={styles.orderRow}>
                      <Text variant="bodyMedium" style={styles.orderNumber}>
                        {order.orderNumber}
                      </Text>
                      <Text variant="bodySmall" style={styles.orderDetails}>
                        {order.supplier.name} - {formatCurrency(order.total)}
                      </Text>
                      <View style={styles.orderChips}>
                        <Chip
                          mode="flat"
                          style={[
                            styles.statusChip,
                            { backgroundColor: 
                              order.status === 'RECEIVED' ? '#10b981' : 
                              order.status === 'PARTIAL' ? '#f97316' :
                              order.status === 'CANCELLED' ? '#ef4444' : '#3b82f6'
                            }
                          ]}
                          textStyle={styles.chipText}
                        >
                          {procOrderStatusLabels[order.status]}
                        </Chip>
                        {order.paymentConfirmed && (
                          <Chip
                            mode="flat"
                            style={[styles.statusChip, { backgroundColor: '#10b981' }]}
                            textStyle={styles.chipText}
                          >
                            تم تأكيد الدفع
                          </Chip>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          ))}
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
    minWidth: '30%',
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
    color: '#ef4444',
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
  orderRow: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  orderNumber: {
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 4,
  },
  orderDetails: {
    color: '#666',
    marginBottom: 8,
  },
  orderChips: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
});

