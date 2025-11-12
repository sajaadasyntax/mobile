import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function AssetsLiabilitiesScreen() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await reportingAPI.getAssetsLiabilities();
      setReportData(data);
    } catch (error) {
      console.error('Error loading assets & liabilities:', error);
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.reportsContainer}>
          {/* Assets */}
          {reportData?.assets && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.sectionTitle}>الأصول (له)</Text>
                <View style={styles.summaryRow}>
                  <Text variant="headlineMedium" style={styles.totalAmount}>
                    {formatCurrency(reportData.assets.total || 0)}
                  </Text>
                </View>
                {reportData.assets.items && reportData.assets.items.map((item: any, index: number) => (
                  <View key={index} style={styles.itemRow}>
                    <Text variant="bodyMedium" style={styles.itemName}>{item.name}</Text>
                    <Text variant="bodyMedium" style={styles.itemAmount}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Liabilities */}
          {reportData?.liabilities && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.sectionTitle}>الالتزامات (عليه)</Text>
                <View style={styles.summaryRow}>
                  <Text variant="headlineMedium" style={styles.totalAmount}>
                    {formatCurrency(reportData.liabilities.total || 0)}
                  </Text>
                </View>
                {reportData.liabilities.items && reportData.liabilities.items.map((item: any, index: number) => (
                  <View key={index} style={styles.itemRow}>
                    <Text variant="bodyMedium" style={styles.itemName}>{item.name}</Text>
                    <Text variant="bodyMedium" style={styles.itemAmount}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Net */}
          {reportData && (
            <Card style={[styles.netCard, { backgroundColor: (reportData.net || 0) >= 0 ? '#10b981' : '#ef4444' }]}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.netLabel}>صافي الأصول</Text>
                <Text variant="headlineLarge" style={styles.netValue}>
                  {formatCurrency(reportData.net || 0)}
                </Text>
              </Card.Content>
            </Card>
          )}

          {!reportData && (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  لا توجد بيانات متاحة
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
  reportsContainer: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#374151',
  },
  summaryRow: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemName: {
    flex: 1,
  },
  itemAmount: {
    fontWeight: '500',
    color: '#666',
  },
  netCard: {
    marginTop: 8,
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
  emptyCard: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

