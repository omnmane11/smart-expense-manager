export enum IncomeCategory {
  RENT = 'Rent',
  BANK_WITHDRAWAL = 'Bank Withdraw/FD',
  AGRICULTURE = 'Agricultural Income',
  SAVINGS = 'Savings',
  OTHER = 'Other'
}

export interface IncomeEntry {
  id: string;
  date: string;
  category: IncomeCategory | string;
  amount: number;
}

export interface ExpenseEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface LedgerState {
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
}

export const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * Formats YYYY-MM-DD to DD-MM-YYYY
 */
export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};