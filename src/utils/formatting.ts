// Utility functions for formatting numbers and dates in the ledger

export const formatCurrency = (value: number): string => {
  if (value === 0) return '';
  return value.toFixed(2);
};

export const parseCurrency = (value: string): number => {
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const calculateDueDate = (startDate: string, daysToRun: number): string => {
  const date = new Date(startDate + 'T00:00:00');
  date.setDate(date.getDate() + daysToRun);
  return date.toISOString().split('T')[0];
};

export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dueDate: string): boolean => {
  return getDaysUntilDue(dueDate) < 0;
};

// Generate ledger folio reference
export const generateFolio = (page: number, line: number): string => {
  return `${page}-${line.toString().padStart(2, '0')}`;
};

// Validate that debits equal credits for an entry
export const validateEntry = (
  debits: number[],
  credits: number[]
): { isValid: boolean; difference: number } => {
  const totalDebits = debits.reduce((sum, val) => sum + val, 0);
  const totalCredits = credits.reduce((sum, val) => sum + val, 0);
  const difference = Math.abs(totalDebits - totalCredits);
  
  return {
    isValid: difference < 0.01,
    difference: totalDebits - totalCredits,
  };
};

// Format large numbers with thousands separator (period-appropriate)
export const formatLargeNumber = (value: number): string => {
  if (value === 0) return '';
  const parts = value.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};
