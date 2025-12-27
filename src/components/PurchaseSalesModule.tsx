import { useState, useCallback } from 'react';
import { useAccountingStore } from '../store/accountingStore';
import { formatCurrency, formatDate } from '../utils/formatting';

interface Props {
  defaultTab: 'purchases' | 'sales';
}

export function PurchaseSalesModule({ defaultTab }: Props) {
  const {
    purchaseInvoices,
    addPurchaseInvoice,
    recordPurchase,
    salesInvoices,
    addSalesInvoice,
    recordSale,
    currentDate,
  } = useAccountingStore();

  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>(defaultTab);

  const [newPurchase, setNewPurchase] = useState({
    date: currentDate,
    vendor: '',
    description: '',
    amount: 0,
  });

  const [newSale, setNewSale] = useState({
    date: currentDate,
    customer: '',
    description: '',
    amount: 0,
  });

  const handleAddPurchase = useCallback(() => {
    if (newPurchase.vendor && newPurchase.amount > 0) {
      addPurchaseInvoice({
        date: newPurchase.date,
        vendor: newPurchase.vendor,
        description: newPurchase.description,
        amount: newPurchase.amount,
      });
      setNewPurchase({
        date: currentDate,
        vendor: '',
        description: '',
        amount: 0,
      });
    }
  }, [addPurchaseInvoice, newPurchase, currentDate]);

  const handleAddSale = useCallback(() => {
    if (newSale.customer && newSale.amount > 0) {
      addSalesInvoice({
        date: newSale.date,
        customer: newSale.customer,
        description: newSale.description,
        amount: newSale.amount,
      });
      setNewSale({
        date: currentDate,
        customer: '',
        description: '',
        amount: 0,
      });
    }
  }, [addSalesInvoice, newSale, currentDate]);

  // Calculate daily totals
  const purchaseTotals = purchaseInvoices.reduce(
    (acc, inv) => ({
      total: acc.total + inv.amount,
      recorded: acc.recorded + (inv.synopticEntryId ? inv.amount : 0),
      pending: acc.pending + (inv.synopticEntryId ? 0 : inv.amount),
    }),
    { total: 0, recorded: 0, pending: 0 }
  );

  const salesTotals = salesInvoices.reduce(
    (acc, inv) => ({
      total: acc.total + inv.amount,
      recorded: acc.recorded + (inv.synopticEntryId ? inv.amount : 0),
      pending: acc.pending + (inv.synopticEntryId ? 0 : inv.amount),
    }),
    { total: 0, recorded: 0, pending: 0 }
  );

  return (
    <div>
      <div className="mb-4">
        <h2 className="ledger-title text-lg">Purchase & Sales Books</h2>
        <p className="ledger-subtitle">Record invoices and transfer to the Synoptic</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`btn-ledger ${activeTab === 'purchases' ? 'bg-ledger-paper' : ''}`}
        >
          Purchase Book
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`btn-ledger ${activeTab === 'sales' ? 'bg-ledger-paper' : ''}`}
        >
          Sales Book
        </button>
      </div>

      {/* Purchase Book */}
      {activeTab === 'purchases' && (
        <div>
          <div className="p-3 bg-ledger-header border border-ledger-lines mb-4">
            <h3 className="font-bold">Purchase Book — Record of Goods Bought</h3>
            <p className="text-sm text-gray-600">
              Recording: <strong>Debit Merchandise</strong>, <strong>Credit Persons (We Buy From)</strong>
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="p-3 bg-ledger-aged border border-ledger-lines">
              <div className="text-sm text-gray-600">Total Purchases</div>
              <div className="text-xl font-bold">${formatCurrency(purchaseTotals.total)}</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-700">
              <div className="text-sm text-gray-600">Recorded to Synoptic</div>
              <div className="text-xl font-bold text-green-700">
                ${formatCurrency(purchaseTotals.recorded)}
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-700">
              <div className="text-sm text-gray-600">Pending Recording</div>
              <div className="text-xl font-bold text-amber-700">
                ${formatCurrency(purchaseTotals.pending)}
              </div>
            </div>
          </div>

          {/* Add Purchase Form */}
          <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-white border border-ledger-lines no-print">
            <input
              type="date"
              value={newPurchase.date}
              onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
              className="ledger-input"
            />
            <input
              type="text"
              placeholder="Vendor Name"
              value={newPurchase.vendor}
              onChange={(e) => setNewPurchase({ ...newPurchase, vendor: e.target.value })}
              className="ledger-input"
            />
            <input
              type="text"
              placeholder="Description of goods"
              value={newPurchase.description}
              onChange={(e) => setNewPurchase({ ...newPurchase, description: e.target.value })}
              className="ledger-input"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newPurchase.amount || ''}
              onChange={(e) =>
                setNewPurchase({ ...newPurchase, amount: parseFloat(e.target.value) || 0 })
              }
              className="ledger-input"
              step="0.01"
              min="0"
            />
            <button onClick={handleAddPurchase} className="btn-ledger btn-success">
              Add Invoice
            </button>
          </div>

          {/* Purchase Table */}
          <table className="ledger-grid w-full">
            <thead>
              <tr className="header-level-2">
                <th className="w-24">Date</th>
                <th>Vendor</th>
                <th>Description</th>
                <th className="w-28 text-right">Amount</th>
                <th className="w-28">Status</th>
                <th className="w-24 no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={inv.synopticEntryId ? 'bg-green-50' : ''}
                >
                  <td className="text-center">{formatDate(inv.date)}</td>
                  <td>{inv.vendor}</td>
                  <td>{inv.description}</td>
                  <td className="text-right">${formatCurrency(inv.amount)}</td>
                  <td className="text-center">
                    {inv.synopticEntryId ? (
                      <span className="text-green-700">✓ Recorded</span>
                    ) : (
                      <span className="text-amber-700">Pending</span>
                    )}
                  </td>
                  <td className="no-print text-center">
                    {!inv.synopticEntryId && (
                      <button
                        onClick={() => recordPurchase(inv.id)}
                        className="btn-ledger btn-success text-xs"
                        title="Record to Synoptic Ledger"
                      >
                        Record
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {purchaseInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 italic">
                    No purchase invoices recorded.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={3} className="text-right font-bold">TOTAL:</td>
                <td className="text-right font-bold">${formatCurrency(purchaseTotals.total)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Sales Book */}
      {activeTab === 'sales' && (
        <div>
          <div className="p-3 bg-ledger-header border border-ledger-lines mb-4">
            <h3 className="font-bold">Sales Book — Record of Goods Sold</h3>
            <p className="text-sm text-gray-600">
              Recording: <strong>Debit Persons (We Sell To)</strong>, <strong>Credit Merchandise</strong>
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="p-3 bg-ledger-aged border border-ledger-lines">
              <div className="text-sm text-gray-600">Total Sales</div>
              <div className="text-xl font-bold">${formatCurrency(salesTotals.total)}</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-700">
              <div className="text-sm text-gray-600">Recorded to Synoptic</div>
              <div className="text-xl font-bold text-green-700">
                ${formatCurrency(salesTotals.recorded)}
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-700">
              <div className="text-sm text-gray-600">Pending Recording</div>
              <div className="text-xl font-bold text-amber-700">
                ${formatCurrency(salesTotals.pending)}
              </div>
            </div>
          </div>

          {/* Add Sale Form */}
          <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-white border border-ledger-lines no-print">
            <input
              type="date"
              value={newSale.date}
              onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
              className="ledger-input"
            />
            <input
              type="text"
              placeholder="Customer Name"
              value={newSale.customer}
              onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })}
              className="ledger-input"
            />
            <input
              type="text"
              placeholder="Description of goods"
              value={newSale.description}
              onChange={(e) => setNewSale({ ...newSale, description: e.target.value })}
              className="ledger-input"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newSale.amount || ''}
              onChange={(e) =>
                setNewSale({ ...newSale, amount: parseFloat(e.target.value) || 0 })
              }
              className="ledger-input"
              step="0.01"
              min="0"
            />
            <button onClick={handleAddSale} className="btn-ledger btn-success">
              Add Invoice
            </button>
          </div>

          {/* Sales Table */}
          <table className="ledger-grid w-full">
            <thead>
              <tr className="header-level-2">
                <th className="w-24">Date</th>
                <th>Customer</th>
                <th>Description</th>
                <th className="w-28 text-right">Amount</th>
                <th className="w-28">Status</th>
                <th className="w-24 no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={inv.synopticEntryId ? 'bg-green-50' : ''}
                >
                  <td className="text-center">{formatDate(inv.date)}</td>
                  <td>{inv.customer}</td>
                  <td>{inv.description}</td>
                  <td className="text-right">${formatCurrency(inv.amount)}</td>
                  <td className="text-center">
                    {inv.synopticEntryId ? (
                      <span className="text-green-700">✓ Recorded</span>
                    ) : (
                      <span className="text-amber-700">Pending</span>
                    )}
                  </td>
                  <td className="no-print text-center">
                    {!inv.synopticEntryId && (
                      <button
                        onClick={() => recordSale(inv.id)}
                        className="btn-ledger btn-success text-xs"
                        title="Record to Synoptic Ledger"
                      >
                        Record
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {salesInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 italic">
                    No sales invoices recorded.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={3} className="text-right font-bold">TOTAL:</td>
                <td className="text-right font-bold">${formatCurrency(salesTotals.total)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-3 bg-ledger-aged border border-ledger-lines text-sm">
        <h4 className="font-bold mb-2">Invoice Book Instructions:</h4>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Record each purchase or sale invoice with its details.</li>
          <li>
            Click <strong>Record</strong> to transfer the entry to the Synoptic Ledger.
          </li>
          <li>
            <strong>Purchases:</strong> Debit Merchandise (goods received), Credit Persons We Buy From
            (liability to pay).
          </li>
          <li>
            <strong>Sales:</strong> Debit Persons We Sell To (receivable), Credit Merchandise (goods
            furnished).
          </li>
          <li>Use these books to track daily activity before summarizing to the main ledger.</li>
        </ol>
      </div>
    </div>
  );
}
