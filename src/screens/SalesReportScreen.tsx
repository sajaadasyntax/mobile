import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip, Searchbar } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime, paymentStatusLabels, deliveryStatusLabels, sectionLabels } from '../utils/formatters';

export default function SalesReportScreen() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await reportingAPI.getSalesInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSales = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const totalPaid = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.paidAmount), 0);

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
        <Card style={[styles.summaryCard, { backgroundColor: '#3b82f6' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي المبيعات</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>{formatCurrency(totalSales)}</Text>
            <Text variant="bodySmall" style={styles.summaryLabel}>{filteredInvoices.length} فاتورة</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>المحصل</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>{formatCurrency(totalPaid)}</Text>
          </Card.Content>
        </Card>
      </View>

      <Searchbar
        placeholder="بحث بالفاتورة أو العميل..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.invoicesContainer}>
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} style={styles.invoiceCard}>
              <Card.Content>
                <View style={styles.invoiceHeader}>
                  <Text variant="titleMedium" style={styles.invoiceNumber}>
                    {invoice.invoiceNumber}
                  </Text>
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {formatDateTime(invoice.createdAt)}
                  </Text>
                </View>

                <View style={styles.invoiceDetails}>
                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.label}>العميل:</Text>
                    <Text variant="bodyMedium">{invoice.customer?.name}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.label}>القسم:</Text>
                    <Text variant="bodyMedium">{sectionLabels[invoice.section]}</Text>
                  </View>

                  <View style={styles.chipRow}>
                    <Chip
                      mode="flat"
                      style={[
                        styles.chip,
                        { backgroundColor: invoice.paymentStatus === 'PAID' ? '#10b981' : invoice.paymentStatus === 'PARTIAL' ? '#f97316' : '#ef4444' }
                      ]}
                      textStyle={styles.chipText}
                    >
                      {paymentStatusLabels[invoice.paymentStatus]}
                    </Chip>

                    <Chip
                      mode="flat"
                      style={[
                        styles.chip,
                        { backgroundColor: invoice.deliveryStatus === 'DELIVERED' ? '#10b981' : '#f97316' }
                      ]}
                      textStyle={styles.chipText}
                    >
                      {deliveryStatusLabels[invoice.deliveryStatus]}
                    </Chip>
                  </View>

                  <View style={styles.amountRow}>
                    <View style={styles.amountItem}>
                      <Text variant="bodySmall" style={styles.label}>المجموع</Text>
                      <Text variant="titleMedium" style={styles.total}>
                        {formatCurrency(invoice.total)}
                      </Text>
                    </View>

                    <View style={styles.amountItem}>
                      <Text variant="bodySmall" style={styles.label}>المدفوع</Text>
                      <Text variant="titleMedium" style={styles.paid}>
                        {formatCurrency(invoice.paidAmount)}
                      </Text>
                    </View>

                    {parseFloat(invoice.total) - parseFloat(invoice.paidAmount) > 0 && (
                      <View style={styles.amountItem}>
                        <Text variant="bodySmall" style={styles.label}>المتبقي</Text>
                        <Text variant="titleMedium" style={styles.remaining}>
                          {formatCurrency(parseFloat(invoice.total) - parseFloat(invoice.paidAmount))}
                        </Text>
                      </View>
                    )}
                  </View>
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
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 0,
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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  invoicesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  invoiceCard: {
    marginBottom: 12,
    borderRadius: 8,
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
  timestamp: {
    color: '#666',
  },
  invoiceDetails: {
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  amountItem: {
    alignItems: 'center',
  },
  total: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  paid: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  remaining: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
});

