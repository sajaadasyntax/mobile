import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Constants from 'expo-constants';
import { reportingAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:4000/api';

interface DailyReportData {
  date: string;
  sales: {
    invoices: number;
    total: number;
    received: number;
    pending: number;
    invoiceList: Array<{
      number: string;
      customer: string;
      total: number;
      paid: number;
      status: string;
    }>;
  };
  procurement: {
    orders: number;
    total: number;
    paid: number;
    pending: number;
    orderList: Array<{
      number: string;
      supplier: string;
      total: number;
      paid: number;
      status: string;
    }>;
  };
  expenses: {
    count: number;
    total: number;
    items: Array<{
      description: string;
      amount: number;
      method: string;
    }>;
  };
  summary: {
    netCashFlow: number;
    totalRevenue: number;
    totalCosts: number;
  };
}

export default function DailyReportScreen() {
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const loadDailyReport = async (date?: string) => {
    setLoading(true);
    try {
      const data = await reportingAPI.getDailyReport(date);
      setReportData(data);
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'فشل تحميل التقرير اليومي');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyReport(selectedDate);
  }, []);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadDailyReport(date);
  };

  const generatePDF = () => {
    if (!reportData) return;
    
    // For mobile, we'll use the web API to generate PDF
    const pdfUrl = `${API_URL}/accounting/daily-report/pdf?date=${selectedDate}`;
    
    // Open PDF in browser or download
    Alert.alert(
      'تصدير PDF',
      'سيتم فتح التقرير في المتصفح',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'فتح', 
          onPress: () => {
            // This would open the PDF URL in the device's browser
            // For React Native, you might need to use Linking.openURL
            console.log('Opening PDF:', pdfUrl);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>جاري تحميل التقرير...</Text>
      </View>
    );
  }

  if (!reportData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>لا توجد بيانات للعرض</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>التقرير اليومي</Text>
        <TextInput
          style={styles.dateInput}
          value={selectedDate}
          onChangeText={handleDateChange}
          placeholder="YYYY-MM-DD"
        />
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <Text style={styles.pdfButtonText}>📄 تصدير PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Sales Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ملخص المبيعات</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>عدد الفواتير:</Text>
            <Text style={styles.summaryValue}>{reportData.sales.invoices}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>إجمالي المبيعات:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(reportData.sales.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المحصل فعلياً:</Text>
            <Text style={[styles.summaryValue, styles.positive]}>
              {formatCurrency(reportData.sales.received)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المتبقي (ذمم):</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(reportData.sales.pending)}
            </Text>
          </View>
        </View>
      </View>

      {/* Procurement Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ملخص المشتريات</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>عدد أوامر الشراء:</Text>
            <Text style={styles.summaryValue}>{reportData.procurement.orders}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>إجمالي المشتريات:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(reportData.procurement.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المدفوع:</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(reportData.procurement.paid)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المتبقي:</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(reportData.procurement.pending)}
            </Text>
          </View>
        </View>
      </View>

      {/* Expenses Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ملخص المنصرفات</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>عدد المنصرفات:</Text>
            <Text style={styles.summaryValue}>{reportData.expenses.count}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>إجمالي المنصرفات:</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(reportData.expenses.total)}
            </Text>
          </View>
        </View>
      </View>

      {/* Financial Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الملخص المالي</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>إجمالي الإيرادات:</Text>
            <Text style={[styles.summaryValue, styles.positive]}>
              {formatCurrency(reportData.summary.totalRevenue)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>إجمالي التكاليف:</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(reportData.summary.totalCosts)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.summaryLabel}>صافي التدفق النقدي:</Text>
            <Text style={[
              styles.summaryValue,
              reportData.summary.netCashFlow >= 0 ? styles.positive : styles.negative
            ]}>
              {formatCurrency(reportData.summary.netCashFlow)}
            </Text>
          </View>
        </View>
      </View>

      {/* Sales Details */}
      {reportData.sales.invoices > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل فواتير المبيعات</Text>
          {reportData.sales.invoiceList.map((invoice, index) => (
            <View key={index} style={styles.detailCard}>
              <Text style={styles.detailTitle}>فاتورة #{invoice.number}</Text>
              <Text style={styles.detailText}>العميل: {invoice.customer}</Text>
              <Text style={styles.detailText}>المجموع: {formatCurrency(invoice.total)}</Text>
              <Text style={styles.detailText}>المدفوع: {formatCurrency(invoice.paid)}</Text>
              <Text style={styles.detailText}>
                الحالة: {invoice.status === 'PAID' ? 'مدفوعة' : 
                        invoice.status === 'PARTIAL' ? 'جزئية' : 'آجلة'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Procurement Details */}
      {reportData.procurement.orders > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل أوامر الشراء</Text>
          {reportData.procurement.orderList.map((order, index) => (
            <View key={index} style={styles.detailCard}>
              <Text style={styles.detailTitle}>أمر شراء #{order.number}</Text>
              <Text style={styles.detailText}>المورد: {order.supplier}</Text>
              <Text style={styles.detailText}>المجموع: {formatCurrency(order.total)}</Text>
              <Text style={styles.detailText}>المدفوع: {formatCurrency(order.paid)}</Text>
              <Text style={styles.detailText}>
                الحالة: {order.status === 'CONFIRMED' ? 'مؤكد' : 'في الانتظار'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Expenses Details */}
      {reportData.expenses.count > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل المنصرفات</Text>
          {reportData.expenses.items.map((expense, index) => (
            <View key={index} style={styles.detailCard}>
              <Text style={styles.detailTitle}>{expense.description}</Text>
              <Text style={styles.detailText}>المبلغ: {formatCurrency(expense.amount)}</Text>
              <Text style={styles.detailText}>
                طريقة الدفع: {expense.method === 'CASH' ? 'نقدي' : 
                              expense.method === 'BANK' ? 'بنكك' : 'بنك النيل'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  dateInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '80%',
    textAlign: 'center',
  },
  pdfButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  pdfButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#374151',
    marginTop: 10,
    paddingTop: 15,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'right',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  detailCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
    textAlign: 'right',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 3,
    textAlign: 'right',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});
