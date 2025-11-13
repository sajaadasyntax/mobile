import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function CommissionReportScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
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

      const data = await reportingAPI.getCommissionReport(params);
      setReportData(data);
    } catch (error: any) {
      console.error('Error loading commission report:', error);
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
            <Card style={[styles.summaryCard, { backgroundColor: '#8b5cf6' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي العمولات</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {formatCurrency(reportData.summary.total || 0)}
                </Text>
                <Text variant="bodySmall" style={styles.summaryCount}>
                  {reportData.summary.count || 0} معاملة
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
        <View style={styles.reportsContainer}>
          {reportData?.data?.map((commission: any) => (
            <Card key={commission.id} style={styles.commissionCard}>
              <Card.Content>
                <View style={styles.commissionHeader}>
                  <Text variant="titleMedium" style={styles.orderNumber}>
                    {commission.orderNumber || 'غير متوفر'}
                  </Text>
                  <Text variant="headlineSmall" style={styles.amount}>
                    {formatCurrency(commission.amount)}
                  </Text>
                </View>

                <View style={styles.commissionDetails}>
                  <Text variant="bodyMedium" style={styles.detailText}>
                    المورد: {commission.supplier || 'غير متوفر'}
                  </Text>
                  <Text variant="bodySmall" style={styles.detailText}>
                    {formatDateTime(commission.date)}
                  </Text>
                  {commission.inventory && (
                    <Text variant="bodySmall" style={styles.detailText}>
                      المخزن: {commission.inventory}
                    </Text>
                  )}
                  {commission.recordedBy && (
                    <Text variant="bodySmall" style={styles.detailText}>
                      بواسطة: {commission.recordedBy}
                    </Text>
                  )}
                </View>

                {commission.notes && (
                  <Text variant="bodySmall" style={styles.notes}>
                    ملاحظات: {commission.notes}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}

          {(!reportData?.data || reportData.data.length === 0) && (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  لا توجد عمولات للفترة المحددة
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
  commissionCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  commissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  amount: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  commissionDetails: {
    marginBottom: 8,
  },
  detailText: {
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  emptyCard: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

