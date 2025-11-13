import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, useTheme, DataTable, Chip } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function LiquidCashScreen({ navigation }: any) {
  const theme = useTheme();
  const [liquidCash, setLiquidCash] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await reportingAPI.getLiquidCash();
      setLiquidCash(data);
    } catch (error: any) {
      console.error('Error loading liquid cash:', error);
      setLiquidCash(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  if (!liquidCash) {
    return (
      <View style={styles.center}>
        <Text>لا توجد بيانات للعرض</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            التقرير النقدي السائل
          </Text>
          
          {liquidCash && (
            <View style={styles.summary}>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.summaryTitle}>
                    إجمالي النقد السائل
                  </Text>
                  <Text variant="headlineMedium" style={styles.summaryAmount}>
                    {formatCurrency(parseFloat(liquidCash.net?.total || '0'))}
                  </Text>
                </Card.Content>
              </Card>

              <View style={styles.paymentMethods}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    حسب طريقة الدفع
                  </Text>
                  
                  {liquidCash.net && (
                    <>
                      <Card style={styles.methodCard}>
                        <Card.Content>
                          <View style={styles.methodRow}>
                            <Text variant="titleMedium">كاش</Text>
                            <Text variant="headlineSmall" style={styles.methodAmount}>
                              {formatCurrency(parseFloat(liquidCash.net.cash || '0'))}
                            </Text>
                          </View>
                        </Card.Content>
                      </Card>
                      <Card style={styles.methodCard}>
                        <Card.Content>
                          <View style={styles.methodRow}>
                            <Text variant="titleMedium">بنكك</Text>
                            <Text variant="headlineSmall" style={styles.methodAmount}>
                              {formatCurrency(parseFloat(liquidCash.net.bank || '0'))}
                            </Text>
                          </View>
                        </Card.Content>
                      </Card>
                      <Card style={styles.methodCard}>
                        <Card.Content>
                          <View style={styles.methodRow}>
                            <Text variant="titleMedium">بنك النيل</Text>
                            <Text variant="headlineSmall" style={styles.methodAmount}>
                              {formatCurrency(parseFloat(liquidCash.net.bankNile || '0'))}
                            </Text>
                          </View>
                        </Card.Content>
                      </Card>
                    </>
                  )}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summary: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#e3f2fd',
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  summaryAmount: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1976d2',
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  paymentMethods: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: '#f5f5f5',
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodAmount: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  methodCount: {
    color: '#666',
  },
});
