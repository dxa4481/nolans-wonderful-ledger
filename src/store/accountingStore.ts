import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  SynopticEntry,
  SeldenEntry,
  FloatingOrder,
  Employee,
  PayrollPeriod,
  PurchaseInvoice,
  SalesInvoice,
  BillReceivable,
  BillPayable,
  ClosingData,
  PartnerDistribution,
  ColumnTotals,
  ViewMode,
  ColumnPreset,
} from '../types/accounting';

interface AccountingState {
  // View state
  currentView: ViewMode;
  columnPreset: ColumnPreset;
  currentDate: string;

  // Synoptic Ledger data
  synopticEntries: SynopticEntry[];
  
  // Selden's Condensed Ledger data
  seldenEntries: SeldenEntry[];
  floatingOrders: FloatingOrder[];
  
  // Auxiliary books
  payrollPeriods: PayrollPeriod[];
  purchaseInvoices: PurchaseInvoice[];
  salesInvoices: SalesInvoice[];
  billsReceivable: BillReceivable[];
  billsPayable: BillPayable[];
  
  // Partners for closing
  partners: PartnerDistribution[];
  
  // Closing data
  closingData: ClosingData | null;

  // Actions
  setCurrentView: (view: ViewMode) => void;
  setColumnPreset: (preset: ColumnPreset) => void;
  setCurrentDate: (date: string) => void;

  // Synoptic actions
  addSynopticEntry: (entry: Omit<SynopticEntry, 'id' | 'isBalanced'>) => string;
  updateSynopticEntry: (id: string, entry: Partial<SynopticEntry>) => void;
  deleteSynopticEntry: (id: string) => void;
  getColumnTotals: () => ColumnTotals;

  // Selden actions
  addSeldenEntry: (entry: Omit<SeldenEntry, 'id'>) => void;
  updateSeldenEntry: (id: string, entry: Partial<SeldenEntry>) => void;
  deleteSeldenEntry: (id: string) => void;

  // Floating Orders actions
  addFloatingOrder: (order: Omit<FloatingOrder, 'id'>) => void;
  payFloatingOrder: (id: string) => void;
  deleteFloatingOrder: (id: string) => void;

  // Payroll actions
  addPayrollPeriod: (period: Omit<PayrollPeriod, 'id' | 'totalPaid'>) => void;
  addEmployee: (periodId: string, employee: Omit<Employee, 'id' | 'totalEarned' | 'isPaid'>) => void;
  updateEmployee: (periodId: string, employeeId: string, employee: Partial<Employee>) => void;
  processPayroll: (periodId: string) => void;

  // Purchase/Sales actions
  addPurchaseInvoice: (invoice: Omit<PurchaseInvoice, 'id' | 'isPaid' | 'synopticEntryId'>) => void;
  recordPurchase: (id: string) => void;
  addSalesInvoice: (invoice: Omit<SalesInvoice, 'id' | 'isPaid' | 'synopticEntryId'>) => void;
  recordSale: (id: string) => void;

  // Bills actions
  addBillReceivable: (bill: Omit<BillReceivable, 'id' | 'isPaid' | 'synopticEntryId'>) => void;
  collectBillReceivable: (id: string) => void;
  addBillPayable: (bill: Omit<BillPayable, 'id' | 'isPaid' | 'synopticEntryId'>) => void;
  payBillPayable: (id: string) => void;

  // Partners
  addPartner: (partner: Omit<PartnerDistribution, 'partnerId' | 'share'>) => void;
  updatePartner: (partnerId: string, partner: Partial<PartnerDistribution>) => void;
  removePartner: (partnerId: string) => void;

  // Closing actions
  performClosing: (actualInventory: number) => void;
  resetClosing: () => void;
}

// Helper to check if entry is balanced
const isEntryBalanced = (entry: Omit<SynopticEntry, 'id' | 'isBalanced'>): boolean => {
  const totalDr = 
    entry.cashDr + entry.personsSellDr + entry.personsBuyDr + 
    entry.merchandiseDr + entry.expenseDr + entry.billsRecDr + 
    entry.billsPayDr + entry.interestDr + entry.sundriesDr;
  
  const totalCr = 
    entry.cashCr + entry.personsSellCr + entry.personsBuyCr + 
    entry.merchandiseCr + entry.expenseCr + entry.billsRecCr + 
    entry.billsPayCr + entry.interestCr + entry.sundriesCr;
  
  return Math.abs(totalDr - totalCr) < 0.01;
};

// Create empty synoptic entry
export const createEmptySynopticEntry = (date: string): Omit<SynopticEntry, 'id' | 'isBalanced'> => ({
  date,
  description: '',
  ledgerFolio: '',
  cashDr: 0,
  cashCr: 0,
  personsSellDr: 0,
  personsSellCr: 0,
  personsBuyDr: 0,
  personsBuyCr: 0,
  merchandiseDr: 0,
  merchandiseCr: 0,
  expenseDr: 0,
  expenseCr: 0,
  billsRecDr: 0,
  billsRecCr: 0,
  billsPayDr: 0,
  billsPayCr: 0,
  interestDr: 0,
  interestCr: 0,
  sundriesDr: 0,
  sundriesCr: 0,
  isClosingEntry: false,
  source: 'manual',
});

export const useAccountingStore = create<AccountingState>((set, get) => ({
  // Initial state
  currentView: 'synoptic',
  columnPreset: 'standard',
  currentDate: new Date().toISOString().split('T')[0],
  synopticEntries: [],
  seldenEntries: [],
  floatingOrders: [],
  payrollPeriods: [],
  purchaseInvoices: [],
  salesInvoices: [],
  billsReceivable: [],
  billsPayable: [],
  partners: [],
  closingData: null,

  // View actions
  setCurrentView: (view) => set({ currentView: view }),
  setColumnPreset: (preset) => set({ columnPreset: preset }),
  setCurrentDate: (date) => set({ currentDate: date }),

  // Synoptic actions
  addSynopticEntry: (entry) => {
    const id = uuidv4();
    const isBalanced = isEntryBalanced(entry);
    set((state) => ({
      synopticEntries: [...state.synopticEntries, { ...entry, id, isBalanced }],
    }));
    return id;
  },

  updateSynopticEntry: (id, entry) => {
    set((state) => ({
      synopticEntries: state.synopticEntries.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...entry };
          return { ...updated, isBalanced: isEntryBalanced(updated) };
        }
        return e;
      }),
    }));
  },

  deleteSynopticEntry: (id) => {
    set((state) => ({
      synopticEntries: state.synopticEntries.filter((e) => e.id !== id),
    }));
  },

  getColumnTotals: () => {
    const entries = get().synopticEntries;
    const totals: ColumnTotals = {
      cashDr: 0,
      cashCr: 0,
      personsSellDr: 0,
      personsSellCr: 0,
      personsBuyDr: 0,
      personsBuyCr: 0,
      merchandiseDr: 0,
      merchandiseCr: 0,
      expenseDr: 0,
      expenseCr: 0,
      billsRecDr: 0,
      billsRecCr: 0,
      billsPayDr: 0,
      billsPayCr: 0,
      interestDr: 0,
      interestCr: 0,
      sundriesDr: 0,
      sundriesCr: 0,
      totalDr: 0,
      totalCr: 0,
      cashOnHand: 0,
    };

    entries.forEach((e) => {
      totals.cashDr += e.cashDr;
      totals.cashCr += e.cashCr;
      totals.personsSellDr += e.personsSellDr;
      totals.personsSellCr += e.personsSellCr;
      totals.personsBuyDr += e.personsBuyDr;
      totals.personsBuyCr += e.personsBuyCr;
      totals.merchandiseDr += e.merchandiseDr;
      totals.merchandiseCr += e.merchandiseCr;
      totals.expenseDr += e.expenseDr;
      totals.expenseCr += e.expenseCr;
      totals.billsRecDr += e.billsRecDr;
      totals.billsRecCr += e.billsRecCr;
      totals.billsPayDr += e.billsPayDr;
      totals.billsPayCr += e.billsPayCr;
      totals.interestDr += e.interestDr;
      totals.interestCr += e.interestCr;
      totals.sundriesDr += e.sundriesDr;
      totals.sundriesCr += e.sundriesCr;
    });

    totals.totalDr = 
      totals.cashDr + totals.personsSellDr + totals.personsBuyDr +
      totals.merchandiseDr + totals.expenseDr + totals.billsRecDr +
      totals.billsPayDr + totals.interestDr + totals.sundriesDr;

    totals.totalCr = 
      totals.cashCr + totals.personsSellCr + totals.personsBuyCr +
      totals.merchandiseCr + totals.expenseCr + totals.billsRecCr +
      totals.billsPayCr + totals.interestCr + totals.sundriesCr;

    totals.cashOnHand = totals.cashDr - totals.cashCr;

    return totals;
  },

  // Selden actions
  addSeldenEntry: (entry) => {
    set((state) => ({
      seldenEntries: [...state.seldenEntries, { ...entry, id: uuidv4() }],
    }));
  },

  updateSeldenEntry: (id, entry) => {
    set((state) => ({
      seldenEntries: state.seldenEntries.map((e) =>
        e.id === id ? { ...e, ...entry } : e
      ),
    }));
  },

  deleteSeldenEntry: (id) => {
    set((state) => ({
      seldenEntries: state.seldenEntries.filter((e) => e.id !== id),
    }));
  },

  // Floating Orders actions
  addFloatingOrder: (order) => {
    set((state) => ({
      floatingOrders: [...state.floatingOrders, { ...order, id: uuidv4() }],
    }));
  },

  payFloatingOrder: (id) => {
    const order = get().floatingOrders.find((o) => o.id === id);
    if (!order) return;

    // Create synoptic entry for payment
    const entry: Omit<SynopticEntry, 'id' | 'isBalanced'> = {
      ...createEmptySynopticEntry(get().currentDate),
      description: `Paid Warrant #${order.orderNumber} - ${order.payee}`,
      cashCr: order.amount,
      sundriesDr: order.amount,
      source: 'manual',
    };

    get().addSynopticEntry(entry);

    set((state) => ({
      floatingOrders: state.floatingOrders.map((o) =>
        o.id === id ? { ...o, isPaid: true, paidDate: state.currentDate } : o
      ),
    }));
  },

  deleteFloatingOrder: (id) => {
    set((state) => ({
      floatingOrders: state.floatingOrders.filter((o) => o.id !== id),
    }));
  },

  // Payroll actions
  addPayrollPeriod: (period) => {
    const employees = period.employees.map((emp) => ({
      ...emp,
      id: uuidv4(),
      totalEarned: emp.daysWorked * emp.rate,
      isPaid: false,
    }));
    const totalPaid = employees.reduce((sum, e) => sum + e.totalEarned, 0);
    
    set((state) => ({
      payrollPeriods: [
        ...state.payrollPeriods,
        { ...period, id: uuidv4(), employees, totalPaid },
      ],
    }));
  },

  addEmployee: (periodId, employee) => {
    set((state) => ({
      payrollPeriods: state.payrollPeriods.map((p) => {
        if (p.id !== periodId) return p;
        const newEmployee: Employee = {
          ...employee,
          id: uuidv4(),
          totalEarned: employee.daysWorked * employee.rate,
          isPaid: false,
        };
        const employees = [...p.employees, newEmployee];
        return {
          ...p,
          employees,
          totalPaid: employees.reduce((sum, e) => sum + e.totalEarned, 0),
        };
      }),
    }));
  },

  updateEmployee: (periodId, employeeId, employee) => {
    set((state) => ({
      payrollPeriods: state.payrollPeriods.map((p) => {
        if (p.id !== periodId) return p;
        const employees = p.employees.map((e) => {
          if (e.id !== employeeId) return e;
          const updated = { ...e, ...employee };
          return { ...updated, totalEarned: updated.daysWorked * updated.rate };
        });
        return {
          ...p,
          employees,
          totalPaid: employees.reduce((sum, e) => sum + e.totalEarned, 0),
        };
      }),
    }));
  },

  processPayroll: (periodId) => {
    const period = get().payrollPeriods.find((p) => p.id === periodId);
    if (!period) return;

    // Create synoptic entry: Credit Cash, Debit Merchandise (Labor)
    const entry: Omit<SynopticEntry, 'id' | 'isBalanced'> = {
      ...createEmptySynopticEntry(get().currentDate),
      description: `Payroll ${period.startDate} to ${period.endDate}`,
      cashCr: period.totalPaid,
      merchandiseDr: period.totalPaid,
      source: 'payroll',
    };

    const entryId = get().addSynopticEntry(entry);

    set((state) => ({
      payrollPeriods: state.payrollPeriods.map((p) => {
        if (p.id !== periodId) return p;
        return {
          ...p,
          synopticEntryId: entryId,
          employees: p.employees.map((e) => ({ ...e, isPaid: true })),
        };
      }),
    }));
  },

  // Purchase/Sales actions
  addPurchaseInvoice: (invoice) => {
    set((state) => ({
      purchaseInvoices: [
        ...state.purchaseInvoices,
        { ...invoice, id: uuidv4(), isPaid: false },
      ],
    }));
  },

  recordPurchase: (id) => {
    const invoice = get().purchaseInvoices.find((i) => i.id === id);
    if (!invoice) return;

    // Debit Merchandise, Credit Persons (We Buy From)
    const entry: Omit<SynopticEntry, 'id' | 'isBalanced'> = {
      ...createEmptySynopticEntry(invoice.date),
      description: `Purchase from ${invoice.vendor}: ${invoice.description}`,
      merchandiseDr: invoice.amount,
      personsBuyCr: invoice.amount,
      source: 'purchase',
    };

    const entryId = get().addSynopticEntry(entry);

    set((state) => ({
      purchaseInvoices: state.purchaseInvoices.map((i) =>
        i.id === id ? { ...i, isPaid: true, synopticEntryId: entryId } : i
      ),
    }));
  },

  addSalesInvoice: (invoice) => {
    set((state) => ({
      salesInvoices: [
        ...state.salesInvoices,
        { ...invoice, id: uuidv4(), isPaid: false },
      ],
    }));
  },

  recordSale: (id) => {
    const invoice = get().salesInvoices.find((i) => i.id === id);
    if (!invoice) return;

    // Debit Persons (We Sell To), Credit Merchandise
    const entry: Omit<SynopticEntry, 'id' | 'isBalanced'> = {
      ...createEmptySynopticEntry(invoice.date),
      description: `Sale to ${invoice.customer}: ${invoice.description}`,
      personsSellDr: invoice.amount,
      merchandiseCr: invoice.amount,
      source: 'sales',
    };

    const entryId = get().addSynopticEntry(entry);

    set((state) => ({
      salesInvoices: state.salesInvoices.map((i) =>
        i.id === id ? { ...i, isPaid: true, synopticEntryId: entryId } : i
      ),
    }));
  },

  // Bills actions
  addBillReceivable: (bill) => {
    set((state) => ({
      billsReceivable: [
        ...state.billsReceivable,
        { ...bill, id: uuidv4(), isPaid: false },
      ],
    }));
  },

  collectBillReceivable: (id) => {
    const bill = get().billsReceivable.find((b) => b.id === id);
    if (!bill) return;

    // Credit Bills Receivable, Debit Cash
    const entry: Omit<SynopticEntry, 'id' | 'isBalanced'> = {
      ...createEmptySynopticEntry(get().currentDate),
      description: `Collected note from ${bill.fromWhom}`,
      cashDr: bill.amount,
      billsRecCr: bill.amount,
      source: 'bills',
    };

    const entryId = get().addSynopticEntry(entry);

    set((state) => ({
      billsReceivable: state.billsReceivable.map((b) =>
        b.id === id ? { ...b, isPaid: true, paidDate: state.currentDate, synopticEntryId: entryId } : b
      ),
    }));
  },

  addBillPayable: (bill) => {
    set((state) => ({
      billsPayable: [
        ...state.billsPayable,
        { ...bill, id: uuidv4(), isPaid: false },
      ],
    }));
  },

  payBillPayable: (id) => {
    const bill = get().billsPayable.find((b) => b.id === id);
    if (!bill) return;

    // Debit Bills Payable, Credit Cash
    const entry: Omit<SynopticEntry, 'id' | 'isBalanced'> = {
      ...createEmptySynopticEntry(get().currentDate),
      description: `Paid note to ${bill.toWhom}`,
      billsPayDr: bill.amount,
      cashCr: bill.amount,
      source: 'bills',
    };

    const entryId = get().addSynopticEntry(entry);

    set((state) => ({
      billsPayable: state.billsPayable.map((b) =>
        b.id === id ? { ...b, isPaid: true, paidDate: state.currentDate, synopticEntryId: entryId } : b
      ),
    }));
  },

  // Partners
  addPartner: (partner) => {
    set((state) => ({
      partners: [...state.partners, { ...partner, partnerId: uuidv4(), share: 0 }],
    }));
  },

  updatePartner: (partnerId, partner) => {
    set((state) => ({
      partners: state.partners.map((p) =>
        p.partnerId === partnerId ? { ...p, ...partner } : p
      ),
    }));
  },

  removePartner: (partnerId) => {
    set((state) => ({
      partners: state.partners.filter((p) => p.partnerId !== partnerId),
    }));
  },

  // Closing actions
  performClosing: (actualInventory) => {
    const totals = get().getColumnTotals();
    const partners = get().partners;
    const currentDate = get().currentDate;

    // Calculate merchandise balance (Dr - Cr)
    const merchandiseBalance = totals.merchandiseDr - totals.merchandiseCr;
    
    // Gross Profit/Loss = Actual Inventory - Merchandise Balance
    const grossProfitLoss = actualInventory - merchandiseBalance;

    // Total expenses (Dr side of expense)
    const totalExpenses = totals.expenseDr - totals.expenseCr;

    // Interest/Discount Net
    const interestDiscountNet = totals.interestDr - totals.interestCr;

    // Net Profit/Loss = Gross Profit - Expenses - Interest Net
    const netProfitLoss = grossProfitLoss - totalExpenses - interestDiscountNet;

    // Calculate partner distributions
    const distributions: PartnerDistribution[] = partners.map((p) => ({
      ...p,
      share: (netProfitLoss * p.ownershipPercent) / 100,
    }));

    // Create closing entries (marked with red ink styling)
    const closingEntries: Omit<SynopticEntry, 'id' | 'isBalanced'>[] = [];

    // 1. Inventory adjustment entry
    if (grossProfitLoss !== 0) {
      closingEntries.push({
        ...createEmptySynopticEntry(currentDate),
        description: 'Closing: Inventory Adjustment',
        merchandiseDr: grossProfitLoss > 0 ? grossProfitLoss : 0,
        merchandiseCr: grossProfitLoss < 0 ? Math.abs(grossProfitLoss) : 0,
        sundriesDr: grossProfitLoss < 0 ? Math.abs(grossProfitLoss) : 0,
        sundriesCr: grossProfitLoss > 0 ? grossProfitLoss : 0,
        isClosingEntry: true,
        source: 'closing',
      });
    }

    // 2. Close expenses to P&L (Sundries)
    if (totalExpenses !== 0) {
      closingEntries.push({
        ...createEmptySynopticEntry(currentDate),
        description: 'Closing: Transfer Expenses to P&L',
        expenseCr: totalExpenses,
        sundriesDr: totalExpenses,
        isClosingEntry: true,
        source: 'closing',
      });
    }

    // 3. Close Interest/Discount to P&L
    if (interestDiscountNet !== 0) {
      closingEntries.push({
        ...createEmptySynopticEntry(currentDate),
        description: 'Closing: Transfer Interest/Discount to P&L',
        interestCr: interestDiscountNet > 0 ? interestDiscountNet : 0,
        interestDr: interestDiscountNet < 0 ? Math.abs(interestDiscountNet) : 0,
        sundriesDr: interestDiscountNet > 0 ? interestDiscountNet : 0,
        sundriesCr: interestDiscountNet < 0 ? Math.abs(interestDiscountNet) : 0,
        isClosingEntry: true,
        source: 'closing',
      });
    }

    // 4. Distribute to capital accounts
    distributions.forEach((dist) => {
      if (dist.share !== 0) {
        closingEntries.push({
          ...createEmptySynopticEntry(currentDate),
          description: `Closing: ${dist.name}'s Share (${dist.ownershipPercent}%)`,
          sundriesDr: dist.share > 0 ? dist.share : 0,
          sundriesCr: dist.share < 0 ? Math.abs(dist.share) : 0,
          isClosingEntry: true,
          source: 'closing',
        });
      }
    });

    // Add all closing entries
    closingEntries.forEach((entry) => {
      get().addSynopticEntry(entry);
    });

    // Update partners with their shares
    set(() => ({
      partners: distributions,
      closingData: {
        actualInventory,
        merchandiseBalance,
        grossProfitLoss,
        totalExpenses,
        interestDiscountNet,
        netProfitLoss,
        capitalDistribution: distributions,
      },
    }));
  },

  resetClosing: () => {
    // Remove closing entries
    set((state) => ({
      synopticEntries: state.synopticEntries.filter((e) => !e.isClosingEntry),
      closingData: null,
      partners: state.partners.map((p) => ({ ...p, share: 0 })),
    }));
  },
}));
