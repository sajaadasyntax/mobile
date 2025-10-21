import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip, Searchbar } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime, procOrderStatusLabels, sectionLabels } from '../utils/formatters';

export default function ProcurementReportScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await reportingAPI.getProcurementOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOrders = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Card style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي المشتريات</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>{formatCurrency(totalOrders)}</Text>
            <Text variant="bodySmall" style={styles.summaryLabel}>{filteredOrders.length} أمر شراء</Text>
          </Card.Content>
        </Card>
      </View>

      <Searchbar
        placeholder="بحث بالأمر أو المورد..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.ordersContainer}>
          {filteredOrders.map((order) => (
            <Card key={order.id} style={styles.orderCard}>
              <Card.Content>
                <View style={styles.orderHeader}>
                  <Text variant="titleMedium" style={styles.orderNumber}>
                    {order.orderNumber}
                  </Text>
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {formatDateTime(order.createdAt)}
                  </Text>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.label}>المورد:</Text>
                    <Text variant="bodyMedium">{order.supplier?.name}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.label}>المخزن:</Text>
                    <Text variant="bodyMedium">{order.inventory?.name}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.label}>القسم:</Text>
                    <Text variant="bodyMedium">{sectionLabels[order.section]}</Text>
                  </View>

                  <View style={styles.chipRow}>
                    <Chip
                      mode="flat"
                      style={[
                        styles.chip,
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
                        style={[styles.chip, { backgroundColor: '#10b981' }]}
                        textStyle={styles.chipText}
                      >
                        تم تأكيد الدفع
                      </Chip>
                    )}
                  </View>

                  <View style={styles.amountRow}>
                    <Text variant="bodySmall" style={styles.label}>المجموع</Text>
                    <Text variant="titleLarge" style={styles.total}>
                      {formatCurrency(order.total)}
                    </Text>
                  </View>

                  {order.creator && (
                    <View style={styles.detailRow}>
                      <Text variant="bodySmall" style={styles.label}>تم الإنشاء بواسطة:</Text>
                      <Text variant="bodySmall">{order.creator.username}</Text>
                    </View>
                  )}
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
    paddingBottom: 0,
  },
  summaryCard: {
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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  ordersContainer: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 8,
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
  timestamp: {
    color: '#666',
  },
  orderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    color: '#666',
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: 'white',
    fontSize: 11,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  total: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
});

