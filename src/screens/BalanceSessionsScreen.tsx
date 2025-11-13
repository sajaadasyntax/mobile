import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, useTheme, Chip, DataTable } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function BalanceSessionsScreen({ navigation }: any) {
  const theme = useTheme();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await reportingAPI.getBalanceSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading balance sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED': return '#4caf50';
      case 'PARTIAL': return '#ff9800';
      case 'CANCELLED': return '#f44336';
      default: return '#2196f3';
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>جاري التحميل...</Text>
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
      <Text variant="headlineSmall" style={styles.title}>
        جلسات الميزانية السابقة
      </Text>

      {sessions.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.emptyText}>
              لا توجد جلسات ميزانية سابقة
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              ستظهر جلسات الميزانية هنا بعد إقفال الحساب
            </Text>
          </Card.Content>
        </Card>
      ) : (
        sessions.map((session, index) => (
          <Card key={session.id} style={styles.sessionCard}>
            <Card.Content>
              <View style={styles.sessionHeader}>
                <Text variant="titleLarge" style={styles.sessionTitle}>
                  جلسة الميزانية #{sessions.length - index}
                </Text>
                <Chip 
                  style={[styles.statusChip, { backgroundColor: getStatusColor(session.status) + '20' }]}
                  textStyle={{ color: getStatusColor(session.status) }}
                >
                  {session.status === 'RECEIVED' ? 'مستلمة' : 
                   session.status === 'PARTIAL' ? 'جزئية' : 
                   session.status === 'CANCELLED' ? 'ملغية' : 'معلقة'}
                </Chip>
              </View>

              <View style={styles.sessionInfo}>
                <Text variant="bodyMedium" style={styles.infoText}>
                  تاريخ الفتح: {formatDateTime(session.openedAt)}
                </Text>
                <Text variant="bodyMedium" style={styles.infoText}>
                  تاريخ الإقفال: {session.closedAt ? formatDateTime(session.closedAt) : 'لم يتم الإقفال بعد'}
                </Text>
                {session.notes && (
                  <Text variant="bodyMedium" style={styles.infoText}>
                    ملاحظات: {session.notes}
                  </Text>
                )}
              </View>

              <View style={styles.summaryGrid}>
                <Card style={styles.summaryCard}>
                  <Card.Content>
                    <Text variant="titleSmall" style={styles.summaryTitle}>
                      الإيرادات المحصلة
                    </Text>
                    <Text variant="headlineSmall" style={styles.summaryAmount}>
                      {formatCurrency(session.summary?.sales?.received || 0)}
                    </Text>
                    <Text variant="bodySmall" style={styles.summaryCount}>
                      {session.summary?.sales?.count || 0} فاتورة
                    </Text>
                  </Card.Content>
                </Card>

                <Card style={styles.summaryCard}>
                  <Card.Content>
                    <Text variant="titleSmall" style={styles.summaryTitle}>
                      إجمالي التكاليف
                    </Text>
                    <Text variant="headlineSmall" style={styles.summaryAmount}>
                      {formatCurrency(
                        (parseFloat(session.summary?.procurement?.total || 0) + 
                         parseFloat(session.summary?.expenses?.total || 0))
                      )}
                    </Text>
                    <Text variant="bodySmall" style={styles.summaryCount}>
                      {session.summary?.procurement?.count || 0} مشتريات + {session.summary?.expenses?.count || 0} منصرفات
                    </Text>
                  </Card.Content>
                </Card>

                <Card style={styles.summaryCard}>
                  <Card.Content>
                    <Text variant="titleSmall" style={styles.summaryTitle}>
                      {parseFloat(session.summary?.profit || 0) >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                    </Text>
                    <Text variant="headlineSmall" style={[
                      styles.summaryAmount,
                      { color: parseFloat(session.summary?.profit || 0) >= 0 ? '#4caf50' : '#f44336' }
                    ]}>
                      {formatCurrency(Math.abs(parseFloat(session.summary?.profit || 0)))}
                    </Text>
                  </Card.Content>
                </Card>

                <Card style={styles.summaryCard}>
                  <Card.Content>
                    <Text variant="titleSmall" style={styles.summaryTitle}>
                      الرصيد النهائي
                    </Text>
                    <Text variant="headlineSmall" style={styles.summaryAmount}>
                      {formatCurrency(session.summary?.netBalance || 0)}
                    </Text>
                    <Text variant="bodySmall" style={styles.summaryCount}>
                      رصيد افتتاحي: {formatCurrency(session.amount)}
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
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
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    marginTop: 8,
  },
  sessionCard: {
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  sessionInfo: {
    marginBottom: 16,
  },
  infoText: {
    marginBottom: 4,
    color: '#666',
  },
  summaryGrid: {
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  summaryAmount: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryCount: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});
