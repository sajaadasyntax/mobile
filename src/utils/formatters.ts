export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ar-SD', {
    style: 'currency',
    currency: 'SDG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ar-SD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ar-SD', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ar-SD', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const roleLabels: Record<string, string> = {
  SALES_GROCERY: 'مبيعات بقالة',
  SALES_BAKERY: 'مبيعات أفران',
  INVENTORY: 'مخازن',
  PROCUREMENT: 'مشتريات',
  ACCOUNTANT: 'محاسب',
  AUDITOR: 'مراجع عام',
};

export const sectionLabels: Record<string, string> = {
  GROCERY: 'بقالة',
  BAKERY: 'أفران',
};

export const paymentStatusLabels: Record<string, string> = {
  PAID: 'مدفوع',
  PARTIAL: 'دفع جزئي',
  CREDIT: 'آجل',
};

export const deliveryStatusLabels: Record<string, string> = {
  DELIVERED: 'تم التسليم',
  NOT_DELIVERED: 'لم يتم التسليم',
};

export const paymentMethodLabels: Record<string, string> = {
  CASH: 'نقداً',
  BANK: 'بنك',
  BANK_NILE: 'بنك النيل',
};

export const procOrderStatusLabels: Record<string, string> = {
  CREATED: 'تم الإنشاء',
  RECEIVED: 'تم الاستلام',
  PARTIAL: 'استلام جزئي',
  CANCELLED: 'ملغي',
};

