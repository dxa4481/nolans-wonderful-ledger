// Types for Baker's Synoptic System and Selden's Condensed Ledger

export interface SynopticEntry {
  id: string;
  date: string;
  description: string;
  ledgerFolio: string;
  // Cash columns
  cashDr: number;
  cashCr: number;
  // Persons (We Sell To) - Accounts Receivable
  personsSellDr: number;
  personsSellCr: number;
  // Persons (We Buy From) - Accounts Payable
  personsBuyDr: number;
  personsBuyCr: number;
  // Merchandise
  merchandiseDr: number;
  merchandiseCr: number;
  // Expense (usually Dr only, but we track both for flexibility)
  expenseDr: number;
  expenseCr: number;
  // Bills Receivable
  billsRecDr: number;
  billsRecCr: number;
  // Bills Payable
  billsPayDr: number;
  billsPayCr: number;
  // Interest/Discount
  interestDr: number;
  interestCr: number;
  // Sundries
  sundriesDr: number;
  sundriesCr: number;
  // Metadata
  isClosingEntry: boolean;
  isBalanced: boolean;
  source?: 'manual' | 'payroll' | 'purchase' | 'sales' | 'bills' | 'closing';
}

export interface SeldenEntry {
  id: string;
  date: string;
  particulars: string;
  account: string;
  // Distribution
  distributionDr: number;
  distributionCr: number;
  // Brought Forward
  broughtForwardDr: number;
  broughtForwardCr: number;
  // Aggregates
  aggregatesDr: number;
  aggregatesCr: number;
  // Totals
  totalsDr: number;
  totalsCr: number;
  // Balances
  balancesDr: number;
  balancesCr: number;
}

export interface FloatingOrder {
  id: string;
  date: string;
  orderNumber: string;
  payee: string;
  purpose: string;
  amount: number;
  issuedDate: string;
  paidDate?: string;
  isPaid: boolean;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  daysWorked: number;
  rate: number;
  totalEarned: number;
  isPaid: boolean;
}

export interface PayrollPeriod {
  id: string;
  startDate: string;
  endDate: string;
  employees: Employee[];
  totalPaid: number;
  synopticEntryId?: string;
}

export interface PurchaseInvoice {
  id: string;
  date: string;
  vendor: string;
  description: string;
  amount: number;
  isPaid: boolean;
  synopticEntryId?: string;
}

export interface SalesInvoice {
  id: string;
  date: string;
  customer: string;
  description: string;
  amount: number;
  isPaid: boolean;
  synopticEntryId?: string;
}

export interface BillReceivable {
  id: string;
  date: string;
  fromWhom: string;
  description: string;
  amount: number;
  timeToRun: number; // days
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  synopticEntryId?: string;
}

export interface BillPayable {
  id: string;
  date: string;
  toWhom: string;
  description: string;
  amount: number;
  timeToRun: number; // days
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  synopticEntryId?: string;
}

export interface ClosingData {
  actualInventory: number;
  merchandiseBalance: number;
  grossProfitLoss: number;
  totalExpenses: number;
  interestDiscountNet: number;
  netProfitLoss: number;
  capitalDistribution: PartnerDistribution[];
}

export interface PartnerDistribution {
  partnerId: string;
  name: string;
  ownershipPercent: number;
  share: number;
}

export interface ColumnTotals {
  cashDr: number;
  cashCr: number;
  personsSellDr: number;
  personsSellCr: number;
  personsBuyDr: number;
  personsBuyCr: number;
  merchandiseDr: number;
  merchandiseCr: number;
  expenseDr: number;
  expenseCr: number;
  billsRecDr: number;
  billsRecCr: number;
  billsPayDr: number;
  billsPayCr: number;
  interestDr: number;
  interestCr: number;
  sundriesDr: number;
  sundriesCr: number;
  totalDr: number;
  totalCr: number;
  cashOnHand: number;
}

export type ViewMode = 'synoptic' | 'selden' | 'payroll' | 'purchases' | 'sales' | 'bills' | 'closing';
export type ColumnPreset = 'standard' | 'banker';

// Banker's preset column names mapping
export const BANKER_COLUMN_NAMES = {
  personsSell: 'Depositors',
  personsBuy: 'Banks & Bankers',
  merchandise: 'Loans & Discounts',
  billsRec: 'Certificates',
  billsPay: 'Exchange',
} as const;

export const STANDARD_COLUMN_NAMES = {
  personsSell: 'Persons (We Sell To)',
  personsBuy: 'Persons (We Buy From)',
  merchandise: 'Merchandise',
  billsRec: 'Bills Receivable',
  billsPay: 'Bills Payable',
} as const;
