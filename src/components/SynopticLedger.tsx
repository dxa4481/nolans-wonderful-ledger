import { useState, useCallback } from 'react';
import { useAccountingStore, createEmptySynopticEntry } from '../store/accountingStore';
import { formatCurrency, parseCurrency } from '../utils/formatting';
import { BANKER_COLUMN_NAMES, STANDARD_COLUMN_NAMES } from '../types/accounting';
import type { SynopticEntry } from '../types/accounting';

export function SynopticLedger() {
  const {
    synopticEntries,
    addSynopticEntry,
    updateSynopticEntry,
    deleteSynopticEntry,
    getColumnTotals,
    columnPreset,
    currentDate,
  } = useAccountingStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const columnNames = columnPreset === 'banker' ? BANKER_COLUMN_NAMES : STANDARD_COLUMN_NAMES;

  const handleAddEntry = useCallback(() => {
    const newEntry = createEmptySynopticEntry(currentDate);
    addSynopticEntry(newEntry);
  }, [addSynopticEntry, currentDate]);

  const handleFieldChange = useCallback((
    id: string,
    field: keyof SynopticEntry,
    value: string | number
  ) => {
    const numericFields = [
      'cashDr', 'cashCr', 'personsSellDr', 'personsSellCr',
      'personsBuyDr', 'personsBuyCr', 'merchandiseDr', 'merchandiseCr',
      'expenseDr', 'expenseCr', 'billsRecDr', 'billsRecCr',
      'billsPayDr', 'billsPayCr', 'interestDr', 'interestCr',
      'sundriesDr', 'sundriesCr'
    ];

    if (numericFields.includes(field)) {
      updateSynopticEntry(id, { [field]: parseCurrency(value as string) });
    } else {
      updateSynopticEntry(id, { [field]: value });
    }
  }, [updateSynopticEntry]);

  const totals = getColumnTotals();
  const isPageBalanced = Math.abs(totals.totalDr - totals.totalCr) < 0.01;

  const calculateRowDebits = (entry: SynopticEntry): number => {
    return entry.cashDr + entry.personsSellDr + entry.personsBuyDr +
      entry.merchandiseDr + entry.expenseDr + entry.billsRecDr +
      entry.billsPayDr + entry.interestDr + entry.sundriesDr;
  };

  const calculateRowCredits = (entry: SynopticEntry): number => {
    return entry.cashCr + entry.personsSellCr + entry.personsBuyCr +
      entry.merchandiseCr + entry.expenseCr + entry.billsRecCr +
      entry.billsPayCr + entry.interestCr + entry.sundriesCr;
  };

  const renderAmountInput = (
    entry: SynopticEntry,
    field: keyof SynopticEntry,
    isDebit: boolean
  ) => {
    const value = entry[field] as number;
    const isEditing = editingId === entry.id;

    return (
      <td className="col-amount">
        <input
          type="text"
          className={isDebit ? 'debit' : 'credit'}
          value={isEditing ? (value || '') : formatCurrency(value)}
          onChange={(e) => handleFieldChange(entry.id, field, e.target.value)}
          onFocus={() => setEditingId(entry.id)}
          onBlur={() => setEditingId(null)}
          placeholder="0.00"
        />
      </td>
    );
  };

  return (
    <div>
      {/* Balance Status */}
      <div className={isPageBalanced ? 'alert-balanced' : 'alert-unbalanced'}>
        {isPageBalanced ? (
          <>✓ Page is BALANCED — Total Debits: ${formatCurrency(totals.totalDr)} = Total Credits: ${formatCurrency(totals.totalCr)}</>
        ) : (
          <>⚠ Page is UNBALANCED — Debits: ${formatCurrency(totals.totalDr)} ≠ Credits: ${formatCurrency(totals.totalCr)} (Difference: ${formatCurrency(Math.abs(totals.totalDr - totals.totalCr))})</>
        )}
      </div>

      {/* Cash on Hand Display */}
      <div className="flex justify-between items-center mb-4 p-2 bg-ledger-header border border-ledger-lines">
        <span className="font-semibold">Daily Cash Proof:</span>
        <span className="font-mono text-lg">
          Cash on Hand: <strong>${formatCurrency(totals.cashOnHand)}</strong>
        </span>
      </div>

      {/* Main Ledger Grid */}
      <div className="ledger-container">
        <table className="ledger-grid w-full">
          <thead>
            {/* Header Row 1 - Main Categories */}
            <tr className="header-level-1">
              <th rowSpan={2} className="col-date frozen">Date</th>
              <th rowSpan={2} className="col-description frozen-second">Description</th>
              <th rowSpan={2} className="col-folio">L.F.</th>
              <th colSpan={2}>CASH</th>
              <th colSpan={2}>{columnNames.personsSell}</th>
              <th colSpan={2}>{columnNames.personsBuy}</th>
              <th colSpan={2}>{columnNames.merchandise}</th>
              <th colSpan={1}>EXPENSE</th>
              <th colSpan={2}>{columnNames.billsRec}</th>
              <th colSpan={2}>{columnNames.billsPay}</th>
              <th colSpan={2}>INTEREST/DISCOUNT</th>
              <th colSpan={2}>SUNDRIES</th>
              <th rowSpan={2} className="col-amount">Row Dr.</th>
              <th rowSpan={2} className="col-amount">Row Cr.</th>
              <th rowSpan={2} className="no-print">Actions</th>
            </tr>
            {/* Header Row 2 - Dr/Cr Sub-columns */}
            <tr className="header-level-2">
              <th className="col-amount">Dr.</th>
              <th className="col-amount">Cr.</th>
              <th className="col-amount">Dr.</th>
              <th className="col-amount">Cr.</th>
              <th className="col-amount">Dr.</th>
              <th className="col-amount">Cr.</th>
              <th className="col-amount">Dr.</th>
              <th className="col-amount">Cr.</th>
              <th className="col-amount">Dr.</th>
              <th className="col-amount">Dr.</th>
              <th className="col-amount">Cr.</th>
              <th className="col-amount">Dr.</th>
              <th className="col-amount">Cr.</th>
              <th className="col-amount">Dr.</th>
              <th className="col-amount">Cr.</th>
              <th className="col-amount">Dr.</th>
              <th className="col-amount">Cr.</th>
            </tr>
          </thead>
          <tbody>
            {synopticEntries.map((entry) => {
              const rowDebits = calculateRowDebits(entry);
              const rowCredits = calculateRowCredits(entry);
              const isRowBalanced = Math.abs(rowDebits - rowCredits) < 0.01;

              return (
                <tr
                  key={entry.id}
                  className={`
                    ${entry.isClosingEntry ? 'closing-entry' : ''}
                    ${!isRowBalanced && (rowDebits > 0 || rowCredits > 0) ? 'unbalanced' : 'balanced'}
                  `}
                >
                  <td className="col-date frozen date">
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => handleFieldChange(entry.id, 'date', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="col-description frozen-second description">
                    <input
                      type="text"
                      value={entry.description}
                      onChange={(e) => handleFieldChange(entry.id, 'description', e.target.value)}
                      placeholder="Enter description..."
                      className="w-full"
                    />
                  </td>
                  <td className="col-folio">
                    <input
                      type="text"
                      value={entry.ledgerFolio}
                      onChange={(e) => handleFieldChange(entry.id, 'ledgerFolio', e.target.value)}
                      placeholder=""
                      className="w-full text-center"
                    />
                  </td>
                  {renderAmountInput(entry, 'cashDr', true)}
                  {renderAmountInput(entry, 'cashCr', false)}
                  {renderAmountInput(entry, 'personsSellDr', true)}
                  {renderAmountInput(entry, 'personsSellCr', false)}
                  {renderAmountInput(entry, 'personsBuyDr', true)}
                  {renderAmountInput(entry, 'personsBuyCr', false)}
                  {renderAmountInput(entry, 'merchandiseDr', true)}
                  {renderAmountInput(entry, 'merchandiseCr', false)}
                  {renderAmountInput(entry, 'expenseDr', true)}
                  {renderAmountInput(entry, 'billsRecDr', true)}
                  {renderAmountInput(entry, 'billsRecCr', false)}
                  {renderAmountInput(entry, 'billsPayDr', true)}
                  {renderAmountInput(entry, 'billsPayCr', false)}
                  {renderAmountInput(entry, 'interestDr', true)}
                  {renderAmountInput(entry, 'interestCr', false)}
                  {renderAmountInput(entry, 'sundriesDr', true)}
                  {renderAmountInput(entry, 'sundriesCr', false)}
                  <td className="col-amount font-bold">{formatCurrency(rowDebits)}</td>
                  <td className="col-amount font-bold">{formatCurrency(rowCredits)}</td>
                  <td className="no-print text-center">
                    <button
                      onClick={() => deleteSynopticEntry(entry.id)}
                      className="btn-ledger btn-danger text-xs px-2 py-1"
                      title="Delete entry"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {synopticEntries.length === 0 && (
              <tr>
                <td colSpan={23} className="text-center py-8 text-gray-500 italic">
                  No entries yet. Click "Add Entry" to begin recording transactions.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            {/* Totals Row */}
            <tr className="totals-row">
              <td colSpan={3} className="text-right font-bold">PAGE TOTALS:</td>
              <td className="col-amount">{formatCurrency(totals.cashDr)}</td>
              <td className="col-amount">{formatCurrency(totals.cashCr)}</td>
              <td className="col-amount">{formatCurrency(totals.personsSellDr)}</td>
              <td className="col-amount">{formatCurrency(totals.personsSellCr)}</td>
              <td className="col-amount">{formatCurrency(totals.personsBuyDr)}</td>
              <td className="col-amount">{formatCurrency(totals.personsBuyCr)}</td>
              <td className="col-amount">{formatCurrency(totals.merchandiseDr)}</td>
              <td className="col-amount">{formatCurrency(totals.merchandiseCr)}</td>
              <td className="col-amount">{formatCurrency(totals.expenseDr)}</td>
              <td className="col-amount">{formatCurrency(totals.billsRecDr)}</td>
              <td className="col-amount">{formatCurrency(totals.billsRecCr)}</td>
              <td className="col-amount">{formatCurrency(totals.billsPayDr)}</td>
              <td className="col-amount">{formatCurrency(totals.billsPayCr)}</td>
              <td className="col-amount">{formatCurrency(totals.interestDr)}</td>
              <td className="col-amount">{formatCurrency(totals.interestCr)}</td>
              <td className="col-amount">{formatCurrency(totals.sundriesDr)}</td>
              <td className="col-amount">{formatCurrency(totals.sundriesCr)}</td>
              <td className="col-amount font-bold">{formatCurrency(totals.totalDr)}</td>
              <td className="col-amount font-bold">{formatCurrency(totals.totalCr)}</td>
              <td className="no-print"></td>
            </tr>
            {/* Cash Proof Row */}
            <tr className="cash-proof-row">
              <td colSpan={3} className="text-right">Cash on Hand (Dr. - Cr.):</td>
              <td colSpan={2} className="font-bold text-center">
                ${formatCurrency(totals.cashOnHand)}
              </td>
              <td colSpan={18}></td>
              <td className="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Entry Button */}
      <div className="mt-4 flex gap-2 no-print">
        <button onClick={handleAddEntry} className="btn-ledger btn-success">
          + Add Entry
        </button>
      </div>

      {/* Universal Rule Reminder */}
      <div className="mt-4 p-3 bg-ledger-aged border border-ledger-lines text-sm">
        <strong>The Universal Rule:</strong>{' '}
        <em>"Credit that which furnishes the value, and Debit that which receives the value."</em>
        <ul className="mt-2 ml-4 list-disc text-xs">
          <li>Cash received → Debit Cash, Credit the source account</li>
          <li>Cash paid → Credit Cash, Debit the receiving account</li>
          <li>Sales on account → Debit Persons (We Sell To), Credit Merchandise</li>
          <li>Purchases on account → Debit Merchandise, Credit Persons (We Buy From)</li>
        </ul>
      </div>
    </div>
  );
}
