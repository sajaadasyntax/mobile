import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, DataTable, Chip } from 'react-native-paper';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface Salary {
  id: string;
  amount: string;
  month: number;
  year: number;
  paymentMethod: 'CASH' | 'BANK' | 'BANK_NILE';
  paidAt: string | null;
  notes?: string;
  createdAt: string;
  creator?: {
    username: string;
  };
}

interface Advance {
  id: string;
  amount: string;
  reason: string;
  paymentMethod: 'CASH' | 'BANK' | 'BANK_NILE';
  paidAt: string | null;
  notes?: string;
  createdAt: string;
  creator?: {
    username: string;
  };
}

interface Employee {
  id: string;
  name: string;
  position: string;
  phone?: string;
  address?: string;
  salary: string;
  isActive: boolean;
  salaries: Salary[];
  advances: Advance[];
}

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await reportingAPI.getEmployees();
      setEmployees(data);
    } catch (error: any) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEmployees();
  };

  const getTotalSalaries = () => {
    return employees.reduce((sum, emp) => {
      return sum + emp.salaries.reduce((s, sal) => s + parseFloat(sal.amount), 0);
    }, 0);
  };

  const getTotalAdvances = () => {
    return employees.reduce((sum, emp) => {
      return sum + emp.advances.reduce((a, adv) => a + parseFloat(adv.amount), 0);
    }, 0);
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'كاش',
      BANK: 'بنك',
      BANK_NILE: 'بنك النيل',
    };
    return labels[method] || method;
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      CASH: '#10b981',
      BANK: '#3b82f6',
      BANK_NILE: '#8b5cf6',
    };
    return colors[method] || '#6b7280';
  };

  const getMonthName = (month: number) => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[month - 1] || month.toString();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
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
      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <Card style={[styles.card, { backgroundColor: '#3b82f6' }]}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.cardLabel}>
              إجمالي الموظفين
            </Text>
            <Text variant="headlineMedium" style={styles.cardValue}>
              {employees.length}
            </Text>
            <Text variant="bodySmall" style={styles.cardCount}>
              {employees.filter(e => e.isActive).length} نشط
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.row}>
          <Card style={[styles.smallCard, { backgroundColor: '#10b981' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.cardLabel}>
                إجمالي الرواتب
              </Text>
              <Text variant="titleMedium" style={styles.cardValue}>
                {formatCurrency(getTotalSalaries())}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.smallCard, { backgroundColor: '#f97316' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.cardLabel}>
                إجمالي السلف
              </Text>
              <Text variant="titleMedium" style={styles.cardValue}>
                {formatCurrency(getTotalAdvances())}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Employees List */}
      {employees.map((employee) => {
        const totalSalaries = employee.salaries.reduce((sum, sal) => sum + parseFloat(sal.amount), 0);
        const totalAdvances = employee.advances.reduce((sum, adv) => sum + parseFloat(adv.amount), 0);
        const paidSalaries = employee.salaries.filter(sal => sal.paidAt).length;
        const unpaidSalaries = employee.salaries.filter(sal => !sal.paidAt).length;

        return (
          <Card key={employee.id} style={styles.employeeCard}>
            <Card.Content>
              <View style={styles.employeeHeader}>
                <View>
                  <Text variant="titleLarge" style={styles.employeeName}>
                    {employee.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.employeePosition}>
                    {employee.position}
                  </Text>
                </View>
                <Chip
                  mode="flat"
                  style={[
                    styles.statusChip,
                    { backgroundColor: employee.isActive ? '#10b981' : '#6b7280' },
                  ]}
                  textStyle={styles.statusChipText}
                >
                  {employee.isActive ? 'نشط' : 'غير نشط'}
                </Chip>
              </View>

              {employee.phone && (
                <Text variant="bodySmall" style={styles.employeeInfo}>
                  الهاتف: {employee.phone}
                </Text>
              )}

              <View style={styles.financeRow}>
                <View style={styles.financeItem}>
                  <Text variant="bodySmall" style={styles.financeLabel}>الراتب الأساسي</Text>
                  <Text variant="titleMedium" style={styles.financeValue}>
                    {formatCurrency(parseFloat(employee.salary))}
                  </Text>
                </View>
                <View style={styles.financeItem}>
                  <Text variant="bodySmall" style={styles.financeLabel}>إجمالي الرواتب</Text>
                  <Text variant="titleMedium" style={styles.financeValue}>
                    {formatCurrency(totalSalaries)}
                  </Text>
                </View>
                <View style={styles.financeItem}>
                  <Text variant="bodySmall" style={styles.financeLabel}>إجمالي السلف</Text>
                  <Text variant="titleMedium" style={styles.financeValue}>
                    {formatCurrency(totalAdvances)}
                  </Text>
                </View>
              </View>

              {employee.salaries.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    الرواتب ({paidSalaries} مدفوعة، {unpaidSalaries} غير مدفوعة)
                  </Text>
                  {employee.salaries.slice(0, 5).map((salary) => (
                    <View key={salary.id} style={styles.transactionItem}>
                      <View style={styles.transactionInfo}>
                        <Text variant="bodyMedium" style={styles.transactionText}>
                          {getMonthName(salary.month)} {salary.year}
                        </Text>
                        <Text variant="bodySmall" style={styles.transactionMeta}>
                          {formatCurrency(parseFloat(salary.amount))}
                          {salary.paidAt && ` - ${formatDateTime(salary.paidAt)}`}
                          {!salary.paidAt && ' - غير مدفوع'}
                        </Text>
                      </View>
                      <Chip
                        mode="flat"
                        style={[
                          styles.methodChip,
                          { backgroundColor: getMethodColor(salary.paymentMethod) },
                        ]}
                        textStyle={styles.methodChipText}
                        compact
                      >
                        {getMethodLabel(salary.paymentMethod)}
                      </Chip>
                    </View>
                  ))}
                  {employee.salaries.length > 5 && (
                    <Text variant="bodySmall" style={styles.moreText}>
                      و {employee.salaries.length - 5} راتب آخر...
                    </Text>
                  )}
                </View>
              )}

              {employee.advances.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    السلف ({employee.advances.length})
                  </Text>
                  {employee.advances.slice(0, 5).map((advance) => (
                    <View key={advance.id} style={styles.transactionItem}>
                      <View style={styles.transactionInfo}>
                        <Text variant="bodyMedium" style={styles.transactionText}>
                          {advance.reason}
                        </Text>
                        <Text variant="bodySmall" style={styles.transactionMeta}>
                          {formatCurrency(parseFloat(advance.amount))}
                          {advance.paidAt && ` - ${formatDateTime(advance.paidAt)}`}
                          {!advance.paidAt && ' - غير مدفوع'}
                        </Text>
                      </View>
                      <Chip
                        mode="flat"
                        style={[
                          styles.methodChip,
                          { backgroundColor: getMethodColor(advance.paymentMethod) },
                        ]}
                        textStyle={styles.methodChipText}
                        compact
                      >
                        {getMethodLabel(advance.paymentMethod)}
                      </Chip>
                    </View>
                  ))}
                  {employee.advances.length > 5 && (
                    <Text variant="bodySmall" style={styles.moreText}>
                      و {employee.advances.length - 5} سلفة أخرى...
                    </Text>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        );
      })}

      {employees.length === 0 && (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.emptyText}>
              لا يوجد موظفين مسجلين
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  smallCard: {
    flex: 1,
    borderRadius: 12,
  },
  cardLabel: {
    color: 'white',
    opacity: 0.9,
  },
  cardValue: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardCount: {
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
  },
  employeeCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  employeePosition: {
    color: '#666',
  },
  employeeInfo: {
    color: '#666',
    marginBottom: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: 'white',
    fontSize: 11,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  financeItem: {
    alignItems: 'center',
    flex: 1,
  },
  financeLabel: {
    color: '#666',
    marginBottom: 4,
  },
  financeValue: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  section: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionText: {
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionMeta: {
    color: '#666',
  },
  methodChip: {
    alignSelf: 'flex-start',
  },
  methodChipText: {
    color: 'white',
    fontSize: 10,
  },
  moreText: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyCard: {
    margin: 16,
    marginTop: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

