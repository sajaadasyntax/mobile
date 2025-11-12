import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip, Searchbar } from 'react-native-paper';
import { auditAPI } from '../services/api';
import { formatDateTime, roleLabels } from '../utils/formatters';

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await auditAPI.getAuditLogs({ limit: 100 });
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('OPEN')) return '#10b981';
    if (action.includes('UPDATE') || action.includes('EDIT')) return '#3b82f6';
    if (action.includes('DELETE') || action.includes('CANCEL')) return '#ef4444';
    if (action.includes('RECEIVE') || action.includes('DELIVER')) return '#f97316';
    return '#6b7280';
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
      <Searchbar
        placeholder="بحث في السجلات..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.logsContainer}>
          {filteredLogs.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>لا توجد سجلات</Text>
              </Card.Content>
            </Card>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id} style={styles.logCard}>
                <Card.Content>
                  <View style={styles.logHeader}>
                    <Chip
                      mode="flat"
                      style={[styles.actionChip, { backgroundColor: getActionColor(log.action) }]}
                      textStyle={styles.chipText}
                    >
                      {log.action}
                    </Chip>
                    <Text variant="bodySmall" style={styles.timestamp}>
                      {formatDateTime(log.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.logDetails}>
                    <View style={styles.detailRow}>
                      <Text variant="bodySmall" style={styles.label}>المستخدم:</Text>
                      <Text variant="bodyMedium" style={styles.value}>
                        {log.user?.username} ({roleLabels[log.user?.role] || log.user?.role})
                      </Text>
                    </View>

                    {log.targetModel && (
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={styles.label}>النموذج:</Text>
                        <Text variant="bodyMedium" style={styles.value}>{log.targetModel}</Text>
                      </View>
                    )}

                    {log.description && (
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={styles.label}>الوصف:</Text>
                        <Text variant="bodyMedium" style={styles.value}>{log.description}</Text>
                      </View>
                    )}

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <View style={styles.metadataContainer}>
                        <Text variant="bodySmall" style={styles.label}>تفاصيل إضافية:</Text>
                        <View style={styles.metadata}>
                          {Object.entries(log.metadata).map(([key, value]: any) => (
                            <Text key={key} variant="bodySmall" style={styles.metadataItem}>
                              • {key}: {JSON.stringify(value)}
                            </Text>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  logsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  logCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  timestamp: {
    color: '#666',
  },
  logDetails: {
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
  value: {
    flex: 1,
  },
  metadataContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  metadata: {
    marginTop: 4,
    paddingLeft: 8,
  },
  metadataItem: {
    color: '#666',
    marginBottom: 2,
  },
  emptyCard: {
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

