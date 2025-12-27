import { useState, useCallback } from 'react';
import { useAccountingStore } from '../store/accountingStore';
import { formatCurrency, formatDate, calculateDueDate, getDaysUntilDue, isOverdue } from '../utils/formatting';

export function BillsModule() {
  const {
    billsReceivable,
    addBillReceivable,
    collectBillReceivable,
    billsPayable,
    addBillPayable,
    payBillPayable,
    currentDate,
  } = useAccountingStore();

  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');

  const [newReceivable, setNewReceivable] = useState({
    date: currentDate,
    fromWhom: '',
    description: '',
    amount: 0,
    timeToRun: 30,
  });

  const [newPayable, setNewPayable] = useState({
    date: currentDate,
    toWhom: '',
    description: '',
    amount: 0,
    timeToRun: 30,
  });

  const handleAddReceivable = useCallback(() => {
    if (newReceivable.fromWhom && newReceivable.amount > 0) {
      addBillReceivable({
        date: newReceivable.date,
        fromWhom: newReceivable.fromWhom,
        description: newReceivable.description,
        amount: newReceivable.amount,
        timeToRun: newReceivable.timeToRun,
        dueDate: calculateDueDate(newReceivable.date, newReceivable.timeToRun),
      });
      setNewReceivable({
        date: currentDate,
        fromWhom: '',
        description: '',
        amount: 0,
        timeToRun: 30,
      });
    }
  }, [addBillReceivable, newReceivable, currentDate]);

  const handleAddPayable = useCallback(() => {
    if (newPayable.toWhom && newPayable.amount > 0) {
      addBillPayable({
        date: newPayable.date,
        toWhom: newPayable.toWhom,
        description: newPayable.description,
        amount: newPayable.amount,
        timeToRun: newPayable.timeToRun,
        dueDate: calculateDueDate(newPayable.date, newPayable.timeToRun),
      });
      setNewPayable({
        date: currentDate,
        toWhom: '',
        description: '',
        amount: 0,
        timeToRun: 30,
      });
    }
  }, [addBillPayable, newPayable, currentDate]);

  // Calculate totals
  const receivableTotals = billsReceivable.reduce(
    (acc, bill) => ({
      total: acc.total + bill.amount,
      outstanding: acc.outstanding + (bill.isPaid ? 0 : bill.amount),
      collected: acc.collected + (bill.isPaid ? bill.amount : 0),
    }),
    { total: 0, outstanding: 0, collected: 0 }
  );

  const payableTotals = billsPayable.reduce(
    (acc, bill) => ({
      total: acc.total + bill.amount,
      outstanding: acc.outstanding + (bill.isPaid ? 0 : bill.amount),
      paid: acc.paid + (bill.isPaid ? bill.amount : 0),
    }),
    { total: 0, outstanding: 0, paid: 0 }
  );

  const renderDueStatus = (dueDate: string, isPaid: boolean) => {
    if (isPaid) return <span className="text-green-700">Settled</span>;
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return <span className="text-red-700 font-bold">OVERDUE ({Math.abs(days)} days)</span>;
    if (days === 0) return <span className="text-amber-700 font-bold">DUE TODAY</span>;
    if (days <= 7) return <span className="text-amber-600">Due in {days} days</span>;
    return <span className="text-gray-600">{days} days</span>;
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="ledger-title text-lg">Bill Books — Notes & Drafts</h2>
        <p className="ledger-subtitle">
          Track Notes Receivable and Notes Payable with due dates
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('receivable')}
          className={`btn-ledger ${activeTab === 'receivable' ? 'bg-ledger-paper' : ''}`}
        >
          Bills Receivable (Notes We Hold)
        </button>
        <button
          onClick={() => setActiveTab('payable')}
          className={`btn-ledger ${activeTab === 'payable' ? 'bg-ledger-paper' : ''}`}
        >
          Bills Payable (Notes We Owe)
        </button>
      </div>

      {/* Bills Receivable */}
      {activeTab === 'receivable' && (
        <div>
          <div className="p-3 bg-ledger-header border border-ledger-lines mb-4">
            <h3 className="font-bold">Bills Receivable — Notes We Hold for Collection</h3>
            <p className="text-sm text-gray-600">
              When collected: <strong>Debit Cash</strong>, <strong>Credit Bills Receivable</strong>
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="p-3 bg-ledger-aged border border-ledger-lines">
              <div className="text-sm text-gray-600">Total Notes</div>
              <div className="text-xl font-bold">${formatCurrency(receivableTotals.total)}</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-700">
              <div className="text-sm text-gray-600">Outstanding</div>
              <div className="text-xl font-bold text-blue-700">
                ${formatCurrency(receivableTotals.outstanding)}
              </div>
            </div>
            <div className="p-3 bg-green-50 border border-green-700">
              <div className="text-sm text-gray-600">Collected</div>
              <div className="text-xl font-bold text-green-700">
                ${formatCurrency(receivableTotals.collected)}
              </div>
            </div>
          </div>

          {/* Add Note Form */}
          <div className="grid grid-cols-6 gap-2 mb-4 p-3 bg-white border border-ledger-lines no-print">
            <input
              type="date"
              value={newReceivable.date}
              onChange={(e) => setNewReceivable({ ...newReceivable, date: e.target.value })}
              className="ledger-input"
            />
            <input
              type="text"
              placeholder="From Whom"
              value={newReceivable.fromWhom}
              onChange={(e) => setNewReceivable({ ...newReceivable, fromWhom: e.target.value })}
              className="ledger-input"
            />
            <input
              type="text"
              placeholder="Description"
              value={newReceivable.description}
              onChange={(e) => setNewReceivable({ ...newReceivable, description: e.target.value })}
              className="ledger-input"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newReceivable.amount || ''}
              onChange={(e) =>
                setNewReceivable({ ...newReceivable, amount: parseFloat(e.target.value) || 0 })
              }
              className="ledger-input"
              step="0.01"
              min="0"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Days"
                value={newReceivable.timeToRun}
                onChange={(e) =>
                  setNewReceivable({ ...newReceivable, timeToRun: parseInt(e.target.value) || 30 })
                }
                className="ledger-input w-16"
                min="1"
              />
              <span className="text-xs">days</span>
            </div>
            <button onClick={handleAddReceivable} className="btn-ledger btn-success">
              Add Note
            </button>
          </div>

          {/* Notes Table */}
          <table className="ledger-grid w-full">
            <thead>
              <tr className="header-level-2">
                <th className="w-20">Date</th>
                <th>From Whom</th>
                <th>Description</th>
                <th className="w-20 text-right">Amount</th>
                <th className="w-16 text-center">Time</th>
                <th className="w-24 text-center">Due Date</th>
                <th className="w-28 text-center">Status</th>
                <th className="w-24 no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {billsReceivable.map((bill) => (
                <tr
                  key={bill.id}
                  className={`
                    ${bill.isPaid ? 'bg-green-50' : ''}
                    ${!bill.isPaid && isOverdue(bill.dueDate) ? 'bg-red-50' : ''}
                  `}
                >
                  <td className="text-center">{formatDate(bill.date)}</td>
                  <td>{bill.fromWhom}</td>
                  <td>{bill.description}</td>
                  <td className="text-right">${formatCurrency(bill.amount)}</td>
                  <td className="text-center">{bill.timeToRun}d</td>
                  <td className="text-center">{formatDate(bill.dueDate)}</td>
                  <td className="text-center">{renderDueStatus(bill.dueDate, bill.isPaid)}</td>
                  <td className="no-print text-center">
                    {!bill.isPaid && (
                      <button
                        onClick={() => collectBillReceivable(bill.id)}
                        className="btn-ledger btn-success text-xs"
                        title="Collect and record to Synoptic"
                      >
                        Collect
                      </button>
                    )}
                    {bill.isPaid && bill.paidDate && (
                      <span className="text-xs text-gray-500">
                        {formatDate(bill.paidDate)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {billsReceivable.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500 italic">
                    No notes receivable recorded.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={3} className="text-right font-bold">OUTSTANDING:</td>
                <td className="text-right font-bold">
                  ${formatCurrency(receivableTotals.outstanding)}
                </td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Bills Payable */}
      {activeTab === 'payable' && (
        <div>
          <div className="p-3 bg-ledger-header border border-ledger-lines mb-4">
            <h3 className="font-bold">Bills Payable — Notes We Owe Others</h3>
            <p className="text-sm text-gray-600">
              When paid: <strong>Debit Bills Payable</strong>, <strong>Credit Cash</strong>
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="p-3 bg-ledger-aged border border-ledger-lines">
              <div className="text-sm text-gray-600">Total Notes</div>
              <div className="text-xl font-bold">${formatCurrency(payableTotals.total)}</div>
            </div>
            <div className="p-3 bg-red-50 border border-red-700">
              <div className="text-sm text-gray-600">Outstanding (Liability)</div>
              <div className="text-xl font-bold text-red-700">
                ${formatCurrency(payableTotals.outstanding)}
              </div>
            </div>
            <div className="p-3 bg-green-50 border border-green-700">
              <div className="text-sm text-gray-600">Paid</div>
              <div className="text-xl font-bold text-green-700">
                ${formatCurrency(payableTotals.paid)}
              </div>
            </div>
          </div>

          {/* Add Note Form */}
          <div className="grid grid-cols-6 gap-2 mb-4 p-3 bg-white border border-ledger-lines no-print">
            <input
              type="date"
              value={newPayable.date}
              onChange={(e) => setNewPayable({ ...newPayable, date: e.target.value })}
              className="ledger-input"
            />
            <input
              type="text"
              placeholder="To Whom"
              value={newPayable.toWhom}
              onChange={(e) => setNewPayable({ ...newPayable, toWhom: e.target.value })}
              className="ledger-input"
            />
            <input
              type="text"
              placeholder="Description"
              value={newPayable.description}
              onChange={(e) => setNewPayable({ ...newPayable, description: e.target.value })}
              className="ledger-input"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newPayable.amount || ''}
              onChange={(e) =>
                setNewPayable({ ...newPayable, amount: parseFloat(e.target.value) || 0 })
              }
              className="ledger-input"
              step="0.01"
              min="0"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Days"
                value={newPayable.timeToRun}
                onChange={(e) =>
                  setNewPayable({ ...newPayable, timeToRun: parseInt(e.target.value) || 30 })
                }
                className="ledger-input w-16"
                min="1"
              />
              <span className="text-xs">days</span>
            </div>
            <button onClick={handleAddPayable} className="btn-ledger btn-success">
              Add Note
            </button>
          </div>

          {/* Notes Table */}
          <table className="ledger-grid w-full">
            <thead>
              <tr className="header-level-2">
                <th className="w-20">Date</th>
                <th>To Whom</th>
                <th>Description</th>
                <th className="w-20 text-right">Amount</th>
                <th className="w-16 text-center">Time</th>
                <th className="w-24 text-center">Due Date</th>
                <th className="w-28 text-center">Status</th>
                <th className="w-24 no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {billsPayable.map((bill) => (
                <tr
                  key={bill.id}
                  className={`
                    ${bill.isPaid ? 'bg-green-50' : ''}
                    ${!bill.isPaid && isOverdue(bill.dueDate) ? 'bg-red-50' : ''}
                  `}
                >
                  <td className="text-center">{formatDate(bill.date)}</td>
                  <td>{bill.toWhom}</td>
                  <td>{bill.description}</td>
                  <td className="text-right">${formatCurrency(bill.amount)}</td>
                  <td className="text-center">{bill.timeToRun}d</td>
                  <td className="text-center">{formatDate(bill.dueDate)}</td>
                  <td className="text-center">{renderDueStatus(bill.dueDate, bill.isPaid)}</td>
                  <td className="no-print text-center">
                    {!bill.isPaid && (
                      <button
                        onClick={() => payBillPayable(bill.id)}
                        className="btn-ledger btn-danger text-xs"
                        title="Pay and record to Synoptic"
                      >
                        Pay
                      </button>
                    )}
                    {bill.isPaid && bill.paidDate && (
                      <span className="text-xs text-gray-500">
                        {formatDate(bill.paidDate)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {billsPayable.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500 italic">
                    No notes payable recorded.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={3} className="text-right font-bold">OUTSTANDING:</td>
                <td className="text-right font-bold">
                  ${formatCurrency(payableTotals.outstanding)}
                </td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-3 bg-ledger-aged border border-ledger-lines text-sm">
        <h4 className="font-bold mb-2">Bill Book Instructions:</h4>
        <ol className="list-decimal ml-4 space-y-1">
          <li>
            <strong>Bills Receivable:</strong> Promissory notes you hold from others. When someone
            gives you a note, record it here. Upon maturity, click "Collect" to record receipt.
          </li>
          <li>
            <strong>Bills Payable:</strong> Notes you have issued to others. Record each note when
            you give it. When due, click "Pay" to record the payment.
          </li>
          <li>
            <strong>Time to Run:</strong> The number of days until the note matures (typically 30,
            60, or 90 days in the 19th century).
          </li>
          <li>The system automatically calculates due dates and highlights overdue notes.</li>
          <li>
            Clicking <strong>Collect</strong> or <strong>Pay</strong> creates the appropriate
            Synoptic entry automatically.
          </li>
        </ol>
      </div>
    </div>
  );
}
