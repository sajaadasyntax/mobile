export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ar-SD', {
    style: 'currency',
    currency: 'SDG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatNumber = (num: number | string): string => {
  const number = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('ar-SD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
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
  AGENT_GROCERY: 'وكيل بقالة',
  AGENT_BAKERY: 'وكيل أفران',
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
  PARTIAL: 'تسليم جزئي',
  REJECTED: 'مرفوضة',
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

export const customerTypeLabels: Record<string, string> = {
  WHOLESALE: 'جملة',
  RETAIL: 'قطاعي',
  AGENT: 'وكيل',
};

/**
 * Sanitizes error messages by replacing "ليس" with appropriate alternatives
 */
export const sanitizeErrorMessage = (errorMessage: string): string => {
  if (!errorMessage) return errorMessage;
  
  // Map specific error messages containing "ليس" to cleaner versions
  const errorMappings: Record<string, string> = {
    'ليس لديك صلاحية للوصول': 'لا توجد لديك صلاحية للوصول',
    'ليس لديك صلاحية للوصول لهذا المخزن': 'لا توجد لديك صلاحية للوصول لهذا المخزن',
    'ليست لديك صلاحية نقل أصناف من هذا المخزن لهذا القسم': 'لا توجد لديك صلاحية نقل أصناف من هذا المخزن لهذا القسم',
    'هذا المنصرف ليس دينًا': 'هذا المنصرف لا يعتبر دينًا',
    'هذا الإيراد ليس دينًا': 'هذا الإيراد لا يعتبر دينًا',
  };

  // Check for exact matches first
  if (errorMappings[errorMessage]) {
    return errorMappings[errorMessage];
  }

  // Replace "ليس" with "لا" in general cases
  return errorMessage.replace(/ليس/gi, 'لا').replace(/ليست/gi, 'لا توجد');
};

