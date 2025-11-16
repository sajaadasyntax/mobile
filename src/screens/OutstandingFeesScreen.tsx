import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function OutstandingFeesScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useDateRange, setUseDateRange] = useState(false);

  useEffect(() => {
    loadReports();
  }, [period, startDate, endDate, useDateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (useDateRange && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (!useDateRange) {
        params.period = period;
      }
      
      const data = await reportingAPI.getOutstandingFees(params);
      setReportData(data);
    } catch (error: any) {
      console.error('Error loading outstanding fees:', error);
      setReportData({ summary: null, customers: [], suppliers: [] });
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
        {/* Period Filter */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.filterTitle}>الفترة</Text>
            
            <View style={styles.filterModeRow}>
              <Button
                mode={!useDateRange ? 'contained' : 'outlined'}
                onPress={() => setUseDateRange(false)}
                style={styles.modeButton}
                compact
              >
                فترة محددة
              </Button>
              <Button
                mode={useDateRange ? 'contained' : 'outlined'}
                onPress={() => setUseDateRange(true)}
                style={styles.modeButton}
                compact
              >
                نطاق زمني
              </Button>
            </View>

            {!useDateRange ? (
              <View style={styles.periodRow}>
                <Button
                  mode={period === 'today' ? 'contained' : 'outlined'}
                  onPress={() => setPeriod('today')}
                  style={styles.periodButton}
                  compact
                >
                  اليوم
                </Button>
                <Button
                  mode={period === 'week' ? 'contained' : 'outlined'}
                  onPress={() => setPeriod('week')}
                  style={styles.periodButton}
                  compact
                >
                  أسبوع
                </Button>
                <Button
                  mode={period === 'month' ? 'contained' : 'outlined'}
                  onPress={() => setPeriod('month')}
                  style={styles.periodButton}
                  compact
                >
                  شهر
                </Button>
                <Button
                  mode={period === 'year' ? 'contained' : 'outlined'}
                  onPress={() => setPeriod('year')}
                  style={styles.periodButton}
                  compact
                >
                  سنة
                </Button>
              </View>
            ) : (
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
                <View style={styles.quickDateRow}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setStartDate(today);
                      setEndDate(today);
                    }}
                    style={styles.quickDateButton}
                    compact
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
                    style={styles.quickDateButton}
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
                    style={styles.quickDateButton}
                    compact
                  >
                    آخر شهر
                  </Button>
                </View>
              </View>
            )}
            
            <Text variant="bodySmall" style={styles.selectedFilterText}>
              {!useDateRange 
                ? `الفترة المحددة: ${period === 'today' ? 'اليوم' : period === 'week' ? 'آخر أسبوع' : period === 'month' ? 'آخر شهر' : 'آخر سنة'}`
                : startDate && endDate 
                  ? `من ${startDate} إلى ${endDate}`
                  : 'يرجى تحديد نطاق زمني'
              }
            </Text>
          </Card.Content>
        </Card>

        {/* Summary */}
        {reportData?.summary && (
          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, { backgroundColor: '#3b82f6' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>ذمم العملاء</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {formatCurrency(reportData.summary.customersOwesUs || 0)}
                </Text>
                <Text variant="bodySmall" style={styles.summaryCount}>
                  {reportData.summary.totalCustomersOutstanding || 0} عميل
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>ذمم الموردين</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {formatCurrency(reportData.summary.weOweSuppliers || 0)}
                </Text>
                <Text variant="bodySmall" style={styles.summaryCount}>
                  {reportData.summary.totalSuppliersOutstanding || 0} مورد
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
        <View style={styles.reportsContainer}>
          {/* Customers */}
          {reportData?.customers && reportData.customers.length > 0 && (
            <>
              <Text variant="titleLarge" style={styles.sectionHeader}>العملاء</Text>
              {reportData.customers.map((customer: any) => (
                <Card key={customer.id} style={styles.customerCard}>
                  <Card.Content>
                    <View style={styles.customerHeader}>
                      <Text variant="titleMedium" style={styles.customerName}>
                        {customer.name}
                      </Text>
                      <Text variant="headlineSmall" style={styles.outstandingAmount}>
                        {formatCurrency(customer.outstanding)}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.customerDetails}>
                      {customer.invoiceCount} فاتورة
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}

          {/* Suppliers */}
          {reportData?.suppliers && reportData.suppliers.length > 0 && (
            <>
              <Text variant="titleLarge" style={styles.sectionHeader}>الموردين</Text>
              {reportData.suppliers.map((supplier: any) => (
                <Card key={supplier.id} style={styles.supplierCard}>
                  <Card.Content>
                    <View style={styles.supplierHeader}>
                      <Text variant="titleMedium" style={styles.supplierName}>
                        {supplier.name}
                      </Text>
                      <Text variant="headlineSmall" style={styles.outstandingAmount}>
                        {formatCurrency(supplier.outstanding)}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.supplierDetails}>
                      {supplier.orderCount} أمر شراء
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}

          {(!reportData?.customers || reportData.customers.length === 0) &&
            (!reportData?.suppliers || reportData.suppliers.length === 0) && (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    لا توجد ذمم متأخرة للفترة المحددة
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
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    minWidth: '22%',
  },
  filterModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
  },
  dateInputContainer: {
    marginTop: 8,
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
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickDateButton: {
    flex: 1,
  },
  selectedFilterText: {
    marginTop: 12,
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
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
    color: '#374151',
  },
  customerCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontWeight: 'bold',
    flex: 1,
  },
  outstandingAmount: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  customerDetails: {
    color: '#666',
  },
  supplierCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontWeight: 'bold',
    flex: 1,
  },
  supplierDetails: {
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

