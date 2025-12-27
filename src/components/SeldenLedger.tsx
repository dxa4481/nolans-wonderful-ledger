import { useState, useCallback } from 'react';
import { useAccountingStore } from '../store/accountingStore';
import { formatCurrency, parseCurrency, formatDate } from '../utils/formatting';
import type { SeldenEntry, FloatingOrder } from '../types/accounting';

// Government/Treasury account categories
const TREASURY_ACCOUNTS = [
  'Treasurer',
  'School Fund',
  'Bridge Fund',
  'Road Fund',
  'Poor Fund',
  'General Fund',
  'Court House Fund',
  'Interest Fund',
  'Sinking Fund',
  'Special Appropriations',
];

export function SeldenLedger() {
  const {
    seldenEntries,
    addSeldenEntry,
    updateSeldenEntry,
    deleteSeldenEntry,
    floatingOrders,
    addFloatingOrder,
    payFloatingOrder,
    deleteFloatingOrder,
    currentDate,
  } = useAccountingStore();

  const [showFloatingOrders, setShowFloatingOrders] = useState(true);
  const [newOrder, setNewOrder] = useState<Partial<FloatingOrder>>({
    date: currentDate,
    orderNumber: '',
    payee: '',
    purpose: '',
    amount: 0,
    issuedDate: currentDate,
    isPaid: false,
  });

  const handleAddEntry = useCallback(() => {
    const entry: Omit<SeldenEntry, 'id'> = {
      date: currentDate,
      particulars: '',
      account: TREASURY_ACCOUNTS[0],
      distributionDr: 0,
      distributionCr: 0,
      broughtForwardDr: 0,
      broughtForwardCr: 0,
      aggregatesDr: 0,
      aggregatesCr: 0,
      totalsDr: 0,
      totalsCr: 0,
      balancesDr: 0,
      balancesCr: 0,
    };
    addSeldenEntry(entry);
  }, [addSeldenEntry, currentDate]);

  const handleFieldChange = useCallback((
    id: string,
    field: keyof SeldenEntry,
    value: string | number
  ) => {
    const numericFields = [
      'distributionDr', 'distributionCr', 'broughtForwardDr', 'broughtForwardCr',
      'aggregatesDr', 'aggregatesCr', 'totalsDr', 'totalsCr',
      'balancesDr', 'balancesCr'
    ];

    if (numericFields.includes(field)) {
      updateSeldenEntry(id, { [field]: parseCurrency(value as string) });
    } else {
      updateSeldenEntry(id, { [field]: value });
    }
  }, [updateSeldenEntry]);

  const handleAddFloatingOrder = useCallback(() => {
    if (newOrder.amount && newOrder.payee && newOrder.orderNumber) {
      addFloatingOrder({
        date: newOrder.date || currentDate,
        orderNumber: newOrder.orderNumber || '',
        payee: newOrder.payee || '',
        purpose: newOrder.purpose || '',
        amount: newOrder.amount || 0,
        issuedDate: newOrder.issuedDate || currentDate,
        isPaid: false,
      });
      setNewOrder({
        date: currentDate,
        orderNumber: '',
        payee: '',
        purpose: '',
        amount: 0,
        issuedDate: currentDate,
        isPaid: false,
      });
    }
  }, [addFloatingOrder, newOrder, currentDate]);

  // Calculate totals
  const totals = seldenEntries.reduce(
    (acc, entry) => ({
      distributionDr: acc.distributionDr + entry.distributionDr,
      distributionCr: acc.distributionCr + entry.distributionCr,
      broughtForwardDr: acc.broughtForwardDr + entry.broughtForwardDr,
      broughtForwardCr: acc.broughtForwardCr + entry.broughtForwardCr,
      aggregatesDr: acc.aggregatesDr + entry.aggregatesDr,
      aggregatesCr: acc.aggregatesCr + entry.aggregatesCr,
      totalsDr: acc.totalsDr + entry.totalsDr,
      totalsCr: acc.totalsCr + entry.totalsCr,
      balancesDr: acc.balancesDr + entry.balancesDr,
      balancesCr: acc.balancesCr + entry.balancesCr,
    }),
    {
      distributionDr: 0, distributionCr: 0,
      broughtForwardDr: 0, broughtForwardCr: 0,
      aggregatesDr: 0, aggregatesCr: 0,
      totalsDr: 0, totalsCr: 0,
      balancesDr: 0, balancesCr: 0,
    }
  );

  // Calculate floating orders totals
  const unpaidOrders = floatingOrders.filter(o => !o.isPaid);
  const totalFloating = unpaidOrders.reduce((sum, o) => sum + o.amount, 0);

  const renderAmountInput = (
    entry: SeldenEntry,
    field: keyof SeldenEntry
  ) => {
    const value = entry[field] as number;

    return (
      <input
        type="text"
        className="w-full text-right"
        value={formatCurrency(value)}
        onChange={(e) => handleFieldChange(entry.id, field, e.target.value)}
        placeholder="0.00"
      />
    );
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="ledger-title text-lg">
          Selden's Condensed Ledger — Government/Treasury Mode
        </h2>
        <p className="ledger-subtitle">
          "Sundries to Sundries" — Distribution, Aggregates, and Balances
        </p>
      </div>

      {/* Main Selden Grid */}
      <div className="ledger-container">
        <table className="ledger-grid selden-grid w-full">
          <thead>
            <tr className="header-level-1">
              <th colSpan={2} className="distribution-section">DISTRIBUTION</th>
              <th colSpan={2} className="brought-forward-section">BROUGHT FORWARD</th>
              <th rowSpan={2} className="col-date">Date</th>
              <th rowSpan={2} className="account-center">PARTICULARS / ACCOUNTS</th>
              <th colSpan={2} className="aggregates-section">AGGREGATES</th>
              <th colSpan={2} className="totals-section">TOTALS</th>
              <th colSpan={2} className="balances-section">BALANCES</th>
              <th rowSpan={2} className="no-print">Actions</th>
            </tr>
            <tr className="header-level-2">
              <th className="col-amount distribution-section">Dr.</th>
              <th className="col-amount distribution-section">Cr.</th>
              <th className="col-amount brought-forward-section">Dr.</th>
              <th className="col-amount brought-forward-section">Cr.</th>
              <th className="col-amount aggregates-section">Dr.</th>
              <th className="col-amount aggregates-section">Cr.</th>
              <th className="col-amount totals-section">Dr.</th>
              <th className="col-amount totals-section">Cr.</th>
              <th className="col-amount balances-section">Dr.</th>
              <th className="col-amount balances-section">Cr.</th>
            </tr>
          </thead>
          <tbody>
            {seldenEntries.map((entry) => (
              <tr key={entry.id}>
                <td className="col-amount distribution-section">
                  {renderAmountInput(entry, 'distributionDr')}
                </td>
                <td className="col-amount distribution-section">
                  {renderAmountInput(entry, 'distributionCr')}
                </td>
                <td className="col-amount brought-forward-section">
                  {renderAmountInput(entry, 'broughtForwardDr')}
                </td>
                <td className="col-amount brought-forward-section">
                  {renderAmountInput(entry, 'broughtForwardCr')}
                </td>
                <td className="col-date">
                  <input
                    type="date"
                    value={entry.date}
                    onChange={(e) => handleFieldChange(entry.id, 'date', e.target.value)}
                    className="w-full"
                  />
                </td>
                <td className="account-center">
                  <div className="flex flex-col gap-1">
                    <select
                      value={entry.account}
                      onChange={(e) => handleFieldChange(entry.id, 'account', e.target.value)}
                      className="ledger-input text-center font-bold"
                    >
                      {TREASURY_ACCOUNTS.map((acct) => (
                        <option key={acct} value={acct}>{acct}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={entry.particulars}
                      onChange={(e) => handleFieldChange(entry.id, 'particulars', e.target.value)}
                      placeholder="Particulars..."
                      className="w-full text-center text-sm"
                    />
                  </div>
                </td>
                <td className="col-amount aggregates-section">
                  {renderAmountInput(entry, 'aggregatesDr')}
                </td>
                <td className="col-amount aggregates-section">
                  {renderAmountInput(entry, 'aggregatesCr')}
                </td>
                <td className="col-amount totals-section">
                  {renderAmountInput(entry, 'totalsDr')}
                </td>
                <td className="col-amount totals-section">
                  {renderAmountInput(entry, 'totalsCr')}
                </td>
                <td className="col-amount balances-section">
                  {renderAmountInput(entry, 'balancesDr')}
                </td>
                <td className="col-amount balances-section">
                  {renderAmountInput(entry, 'balancesCr')}
                </td>
                <td className="no-print text-center">
                  <button
                    onClick={() => deleteSeldenEntry(entry.id)}
                    className="btn-ledger btn-danger text-xs px-2 py-1"
                    title="Delete entry"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}

            {seldenEntries.length === 0 && (
              <tr>
                <td colSpan={13} className="text-center py-8 text-gray-500 italic">
                  No entries yet. Click "Add Entry" to begin recording.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td className="col-amount">{formatCurrency(totals.distributionDr)}</td>
              <td className="col-amount">{formatCurrency(totals.distributionCr)}</td>
              <td className="col-amount">{formatCurrency(totals.broughtForwardDr)}</td>
              <td className="col-amount">{formatCurrency(totals.broughtForwardCr)}</td>
              <td colSpan={2} className="text-center font-bold">TOTALS</td>
              <td className="col-amount">{formatCurrency(totals.aggregatesDr)}</td>
              <td className="col-amount">{formatCurrency(totals.aggregatesCr)}</td>
              <td className="col-amount">{formatCurrency(totals.totalsDr)}</td>
              <td className="col-amount">{formatCurrency(totals.totalsCr)}</td>
              <td className="col-amount">{formatCurrency(totals.balancesDr)}</td>
              <td className="col-amount">{formatCurrency(totals.balancesCr)}</td>
              <td className="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 no-print">
        <button onClick={handleAddEntry} className="btn-ledger btn-success">
          + Add Entry
        </button>
      </div>

      {/* Floating Orders Section */}
      <div className="floating-orders mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3>Floating Orders (Outstanding Warrants)</h3>
          <button
            onClick={() => setShowFloatingOrders(!showFloatingOrders)}
            className="btn-ledger text-xs"
          >
            {showFloatingOrders ? 'Hide' : 'Show'}
          </button>
        </div>

        {showFloatingOrders && (
          <>
            <p className="text-sm mb-4 text-gray-600 italic">
              Track the difference between the Auditor's balance and the Treasurer's actual cash balance.
              Outstanding warrants ("floating orders") represent claims against the treasury not yet paid.
            </p>

            {/* Add New Order Form */}
            <div className="grid grid-cols-6 gap-2 mb-4 p-3 bg-white border border-ledger-lines">
              <input
                type="text"
                placeholder="Order #"
                value={newOrder.orderNumber}
                onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
                className="ledger-input"
              />
              <input
                type="text"
                placeholder="Payee"
                value={newOrder.payee}
                onChange={(e) => setNewOrder({ ...newOrder, payee: e.target.value })}
                className="ledger-input"
              />
              <input
                type="text"
                placeholder="Purpose"
                value={newOrder.purpose}
                onChange={(e) => setNewOrder({ ...newOrder, purpose: e.target.value })}
                className="ledger-input"
              />
              <input
                type="number"
                placeholder="Amount"
                value={newOrder.amount || ''}
                onChange={(e) => setNewOrder({ ...newOrder, amount: parseFloat(e.target.value) || 0 })}
                className="ledger-input"
                step="0.01"
              />
              <input
                type="date"
                value={newOrder.issuedDate}
                onChange={(e) => setNewOrder({ ...newOrder, issuedDate: e.target.value })}
                className="ledger-input"
              />
              <button onClick={handleAddFloatingOrder} className="btn-ledger btn-success">
                Add Order
              </button>
            </div>

            {/* Orders Table */}
            <table className="ledger-grid w-full">
              <thead>
                <tr className="header-level-2">
                  <th>Order #</th>
                  <th>Payee</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Issued Date</th>
                  <th>Status</th>
                  <th className="no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {floatingOrders.map((order) => (
                  <tr key={order.id} className={order.isPaid ? 'opacity-50' : ''}>
                    <td className="text-center">{order.orderNumber}</td>
                    <td>{order.payee}</td>
                    <td>{order.purpose}</td>
                    <td className="text-right">${formatCurrency(order.amount)}</td>
                    <td className="text-center">{formatDate(order.issuedDate)}</td>
                    <td className="text-center">
                      {order.isPaid ? (
                        <span className="text-green-700">Paid {order.paidDate && formatDate(order.paidDate)}</span>
                      ) : (
                        <span className="text-amber-700">Outstanding</span>
                      )}
                    </td>
                    <td className="no-print text-center">
                      {!order.isPaid && (
                        <button
                          onClick={() => payFloatingOrder(order.id)}
                          className="btn-ledger btn-success text-xs mr-1"
                          title="Mark as paid and create synoptic entry"
                        >
                          Pay
                        </button>
                      )}
                      <button
                        onClick={() => deleteFloatingOrder(order.id)}
                        className="btn-ledger btn-danger text-xs"
                        title="Delete order"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
                {floatingOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500 italic">
                      No floating orders recorded.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td colSpan={3} className="text-right font-bold">Total Outstanding:</td>
                  <td className="text-right font-bold">${formatCurrency(totalFloating)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>

            {/* Auditor/Treasurer Reconciliation */}
            <div className="mt-4 p-3 bg-ledger-aged border border-ledger-lines">
              <h4 className="font-bold mb-2">Treasury Reconciliation</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Auditor's Book Balance:</strong> ${formatCurrency(totals.balancesDr - totals.balancesCr)}</p>
                </div>
                <div>
                  <p><strong>Less: Floating Orders:</strong> ${formatCurrency(totalFloating)}</p>
                </div>
                <div className="col-span-2 border-t border-ledger-lines pt-2">
                  <p className="font-bold">
                    <strong>Treasurer's Actual Cash:</strong> ${formatCurrency((totals.balancesDr - totals.balancesCr) - totalFloating)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
