import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip, Button, SegmentedButtons } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatNumber } from '../utils/formatters';

export default function InventoryScreen() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [selectedInventory, setSelectedInventory] = useState('');
  const [selectedSection, setSelectedSection] = useState('GROCERY');
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInventories();
  }, []);

  useEffect(() => {
    if (selectedInventory) {
      loadStocks();
    }
  }, [selectedInventory, selectedSection]);

  const loadInventories = async () => {
    try {
      const data = await reportingAPI.getInventories();
      setInventories(data);
      if (data.length > 0) {
        setSelectedInventory(data[0].id);
      }
    } catch (error) {
      console.error('Error loading inventories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStocks = async () => {
    try {
      const data = await reportingAPI.getInventoryStocks(selectedInventory, { section: selectedSection });
      setStocks(data);
    } catch (error) {
      console.error('Error loading stocks:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInventories();
  };

  const getDaysUntilExpiry = (expiryDate: string | null): number | null => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (stock: any) => {
    const expiryInfo = stock.expiryInfo;
    if (!expiryInfo) return null;

    if (expiryInfo.hasExpired) {
      return { label: 'منتهي الصلاحية', color: '#ef4444', bgColor: '#fee2e2' };
    }
    
    if (expiryInfo.expiringSoon) {
      const days = expiryInfo.earliestExpiry ? getDaysUntilExpiry(expiryInfo.earliestExpiry) : null;
      return { label: `ينتهي قريباً (${days} يوم)`, color: '#f97316', bgColor: '#fed7aa' };
    }
    
    if (expiryInfo.earliestExpiry) {
      const days = getDaysUntilExpiry(expiryInfo.earliestExpiry);
      if (days !== null && days <= 60) {
        return { label: `ينتهي خلال ${days} يوم`, color: '#eab308', bgColor: '#fef9c3' };
      }
    }
    
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  const totalItems = stocks.length;
  const totalQuantity = stocks.reduce((sum, stock) => sum + parseFloat(stock.quantity), 0);
  const lowStockItems = stocks.filter((stock) => parseFloat(stock.quantity) < 50).length;
  const outOfStockItems = stocks.filter((stock) => parseFloat(stock.quantity) === 0).length;
  const expiringSoonItems = stocks.filter((stock) => stock.expiryInfo?.expiringSoon).length;
  const expiredItems = stocks.filter((stock) => stock.expiryInfo?.hasExpired).length;

  return (
    <View style={styles.container}>
      {/* Filters */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.filterTitle}>المخزن</Text>
          <View style={styles.inventoryButtons}>
            {inventories.map((inv) => (
              <Button
                key={inv.id}
                mode={selectedInventory === inv.id ? 'contained' : 'outlined'}
                onPress={() => setSelectedInventory(inv.id)}
                style={styles.inventoryButton}
                compact
              >
                {inv.name}
              </Button>
            ))}
          </View>

          <Text variant="titleMedium" style={[styles.filterTitle, { marginTop: 16 }]}>القسم</Text>
          <SegmentedButtons
            value={selectedSection}
            onValueChange={(value) => setSelectedSection(value)}
            buttons={[
              { value: 'GROCERY', label: 'بقالة' },
              { value: 'BAKERY', label: 'أفران' },
            ]}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { backgroundColor: '#3b82f6' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي الأصناف</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>{totalItems}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>إجمالي الكمية</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>{formatNumber(totalQuantity)}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { backgroundColor: '#f97316' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>مخزون منخفض</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>{lowStockItems}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.summaryLabel}>نفذ من المخزون</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>{outOfStockItems}</Text>
          </Card.Content>
        </Card>
      </View>

      {(expiringSoonItems > 0 || expiredItems > 0) && (
        <View style={styles.summaryRow}>
          {expiringSoonItems > 0 && (
            <Card style={[styles.summaryCard, { backgroundColor: '#f97316' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>ينتهي قريباً</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>{expiringSoonItems}</Text>
              </Card.Content>
            </Card>
          )}

          {expiredItems > 0 && (
            <Card style={[styles.summaryCard, { backgroundColor: '#dc2626' }]}>
              <Card.Content>
                <Text variant="bodySmall" style={styles.summaryLabel}>منتهي الصلاحية</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>{expiredItems}</Text>
              </Card.Content>
            </Card>
          )}
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.stocksContainer}>
          {stocks.map((stock) => {
            const expiryStatus = getExpiryStatus(stock);
            const quantity = parseFloat(stock.quantity);
            const isLowStock = quantity < 50 && quantity > 0;
            const isOutOfStock = quantity === 0;

            return (
              <Card key={stock.itemId} style={styles.stockCard}>
                <Card.Content>
                  <View style={styles.stockHeader}>
                    <Text variant="titleMedium" style={styles.itemName}>
                      {stock.item.name}
                    </Text>
                    <Text variant="headlineSmall" style={styles.quantity}>
                      {formatNumber(quantity)}
                    </Text>
                  </View>

                  {expiryStatus && (
                    <Chip
                      mode="flat"
                      style={[styles.expiryChip, { backgroundColor: expiryStatus.bgColor }]}
                      textStyle={{ color: expiryStatus.color }}
                    >
                      {expiryStatus.label}
                    </Chip>
                  )}

                  {(isLowStock || isOutOfStock) && (
                    <Chip
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { backgroundColor: isOutOfStock ? '#fee2e2' : '#fed7aa' }
                      ]}
                      textStyle={{ color: isOutOfStock ? '#ef4444' : '#f97316' }}
                    >
                      {isOutOfStock ? 'نفذ من المخزون' : 'مخزون منخفض'}
                    </Chip>
                  )}

                  <View style={styles.priceRow}>
                    {stock.item.prices.find((p: any) => p.tier === 'WHOLESALE') && (
                      <Text variant="bodySmall" style={styles.price}>
                        جملة: {formatNumber(stock.item.prices.find((p: any) => p.tier === 'WHOLESALE').price)}
                      </Text>
                    )}
                    {stock.item.prices.find((p: any) => p.tier === 'RETAIL') && (
                      <Text variant="bodySmall" style={styles.price}>
                        قطاعي: {formatNumber(stock.item.prices.find((p: any) => p.tier === 'RETAIL').price)}
                      </Text>
                    )}
                  </View>
                </Card.Content>
              </Card>
            );
          })}

          {stocks.length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  لا توجد أصناف في هذا المخزن
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
  inventoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inventoryButton: {
    flex: 1,
    minWidth: '45%',
  },
  segmentedButtons: {
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
  stocksContainer: {
    padding: 16,
    paddingTop: 0,
  },
  stockCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontWeight: 'bold',
  },
  quantity: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  expiryChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  price: {
    color: '#666',
  },
  emptyCard: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

