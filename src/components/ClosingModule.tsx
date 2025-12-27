import { useState, useCallback } from 'react';
import { useAccountingStore } from '../store/accountingStore';
import { formatCurrency } from '../utils/formatting';

export function ClosingModule() {
  const {
    getColumnTotals,
    partners,
    addPartner,
    updatePartner,
    removePartner,
    closingData,
    performClosing,
    resetClosing,
    synopticEntries,
  } = useAccountingStore();

  const [actualInventory, setActualInventory] = useState<number>(0);
  const [newPartner, setNewPartner] = useState({ name: '', ownershipPercent: 0 });

  const totals = getColumnTotals();
  const hasClosingEntries = synopticEntries.some((e) => e.isClosingEntry);

  const handleAddPartner = useCallback(() => {
    if (newPartner.name && newPartner.ownershipPercent > 0) {
      addPartner({
        name: newPartner.name,
        ownershipPercent: newPartner.ownershipPercent,
      });
      setNewPartner({ name: '', ownershipPercent: 0 });
    }
  }, [addPartner, newPartner]);

  const handlePerformClosing = useCallback(() => {
    if (actualInventory > 0 || confirm('Actual inventory is $0. Continue with closing?')) {
      performClosing(actualInventory);
    }
  }, [performClosing, actualInventory]);

  const totalOwnership = partners.reduce((sum, p) => sum + p.ownershipPercent, 0);

  // Calculate pre-closing values
  const merchandiseBalance = totals.merchandiseDr - totals.merchandiseCr;
  const expenseBalance = totals.expenseDr - totals.expenseCr;
  const interestBalance = totals.interestDr - totals.interestCr;

  return (
    <div>
      <div className="mb-4">
        <h2 className="ledger-title text-lg">Closing Process & Financial Statements</h2>
        <p className="ledger-subtitle">
          End-of-period adjustments and profit/loss distribution
        </p>
      </div>

      {/* Warning if already closed */}
      {hasClosingEntries && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-700 text-amber-800">
          <strong>⚠ Closing entries have already been created.</strong> To modify, you must first
          reset the closing process.
          <button
            onClick={resetClosing}
            className="btn-ledger btn-danger ml-4"
          >
            Reset Closing Entries
          </button>
        </div>
      )}

      {/* Step 1: Current Balances */}
      <div className="mb-6 p-4 bg-ledger-aged border border-ledger-lines">
        <h3 className="font-bold text-lg mb-3 border-b border-ledger-lines pb-2">
          Step 1: Current Account Balances (Before Closing)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white border border-ledger-lines">
            <div className="text-sm text-gray-600">Cash on Hand</div>
            <div className="text-xl font-bold">${formatCurrency(totals.cashOnHand)}</div>
          </div>
          <div className="p-3 bg-white border border-ledger-lines">
            <div className="text-sm text-gray-600">Merchandise (Book Balance)</div>
            <div className="text-xl font-bold">${formatCurrency(merchandiseBalance)}</div>
            <div className="text-xs text-gray-500">Dr: ${formatCurrency(totals.merchandiseDr)} | Cr: ${formatCurrency(totals.merchandiseCr)}</div>
          </div>
          <div className="p-3 bg-white border border-ledger-lines">
            <div className="text-sm text-gray-600">Expenses</div>
            <div className="text-xl font-bold text-red-700">${formatCurrency(expenseBalance)}</div>
          </div>
          <div className="p-3 bg-white border border-ledger-lines">
            <div className="text-sm text-gray-600">Interest/Discount Net</div>
            <div className="text-xl font-bold">${formatCurrency(interestBalance)}</div>
          </div>
        </div>
      </div>

      {/* Step 2: Inventory Adjustment */}
      <div className="mb-6 p-4 bg-ledger-aged border border-ledger-lines">
        <h3 className="font-bold text-lg mb-3 border-b border-ledger-lines pb-2">
          Step 2: Inventory Adjustment
        </h3>
        <p className="text-sm mb-4">
          Per Baker's method: Count your actual inventory and enter the value below. The difference
          between this and the Merchandise book balance determines your Gross Profit or Loss.
        </p>
        <div className="flex items-end gap-4">
          <label className="flex flex-col">
            <span className="text-sm mb-1">Actual Inventory Value (Physical Count):</span>
            <input
              type="number"
              value={actualInventory || ''}
              onChange={(e) => setActualInventory(parseFloat(e.target.value) || 0)}
              className="ledger-input text-lg"
              placeholder="Enter inventory value..."
              step="0.01"
              min="0"
              disabled={hasClosingEntries}
            />
          </label>
          <div className="p-3 bg-white border border-ledger-lines">
            <div className="text-sm text-gray-600">Estimated Gross Profit/Loss:</div>
            <div className={`text-xl font-bold ${actualInventory - merchandiseBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              ${formatCurrency(actualInventory - merchandiseBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Partners/Capital Distribution */}
      <div className="mb-6 p-4 bg-ledger-aged border border-ledger-lines">
        <h3 className="font-bold text-lg mb-3 border-b border-ledger-lines pb-2">
          Step 3: Partners & Capital Distribution
        </h3>
        <p className="text-sm mb-4">
          Add partners/proprietors to distribute the net gain or loss. Ownership percentages should
          total 100%.
        </p>

        {/* Add Partner Form */}
        {!hasClosingEntries && (
          <div className="flex gap-2 mb-4 p-3 bg-white border border-ledger-lines no-print">
            <input
              type="text"
              placeholder="Partner Name"
              value={newPartner.name}
              onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
              className="ledger-input flex-1"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="%"
                value={newPartner.ownershipPercent || ''}
                onChange={(e) =>
                  setNewPartner({
                    ...newPartner,
                    ownershipPercent: parseFloat(e.target.value) || 0,
                  })
                }
                className="ledger-input w-20"
                step="0.1"
                min="0"
                max="100"
              />
              <span>%</span>
            </div>
            <button onClick={handleAddPartner} className="btn-ledger btn-success">
              Add Partner
            </button>
          </div>
        )}

        {/* Partners Table */}
        <table className="ledger-grid w-full">
          <thead>
            <tr className="header-level-2">
              <th>Partner Name</th>
              <th className="w-32 text-right">Ownership %</th>
              <th className="w-40 text-right">Share of Profit/Loss</th>
              {!hasClosingEntries && <th className="w-20 no-print">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.partnerId}>
                <td>
                  {hasClosingEntries ? (
                    partner.name
                  ) : (
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) =>
                        updatePartner(partner.partnerId, { name: e.target.value })
                      }
                      className="w-full"
                    />
                  )}
                </td>
                <td className="text-right">
                  {hasClosingEntries ? (
                    `${partner.ownershipPercent}%`
                  ) : (
                    <input
                      type="number"
                      value={partner.ownershipPercent}
                      onChange={(e) =>
                        updatePartner(partner.partnerId, {
                          ownershipPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full text-right"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                  )}
                </td>
                <td className={`text-right font-bold ${partner.share >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {closingData ? `$${formatCurrency(partner.share)}` : '—'}
                </td>
                {!hasClosingEntries && (
                  <td className="no-print text-center">
                    <button
                      onClick={() => removePartner(partner.partnerId)}
                      className="btn-ledger btn-danger text-xs"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan={hasClosingEntries ? 3 : 4} className="text-center py-4 text-gray-500 italic">
                  No partners added. Add at least one to distribute profit/loss.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td className="text-right font-bold">Total Ownership:</td>
              <td className={`text-right font-bold ${totalOwnership === 100 ? 'text-green-700' : 'text-amber-700'}`}>
                {totalOwnership}%
                {totalOwnership !== 100 && <span className="text-xs ml-1">(should be 100%)</span>}
              </td>
              <td className={`text-right font-bold ${closingData && closingData.netProfitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {closingData ? `$${formatCurrency(closingData.netProfitLoss)}` : '—'}
              </td>
              {!hasClosingEntries && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Perform Closing Button */}
      {!hasClosingEntries && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-700 no-print">
          <h3 className="font-bold text-lg mb-3 text-red-700">Step 4: Execute Closing Process</h3>
          <p className="text-sm mb-4">
            This will create closing entries in <span className="text-red-700 font-bold">RED INK</span>{' '}
            to:
          </p>
          <ul className="list-disc ml-6 mb-4 text-sm">
            <li>Adjust Merchandise to actual inventory value</li>
            <li>Close Expense account to Profit & Loss (Sundries)</li>
            <li>Close Interest/Discount to Profit & Loss</li>
            <li>Distribute Net Gain/Loss to Capital accounts</li>
          </ul>
          <button
            onClick={handlePerformClosing}
            className="btn-ledger btn-danger text-lg px-6 py-2"
            disabled={partners.length === 0}
          >
            ⚑ Perform Closing (Create Red Ink Entries)
          </button>
          {partners.length === 0 && (
            <p className="text-sm text-amber-700 mt-2">
              Add at least one partner before closing.
            </p>
          )}
        </div>
      )}

      {/* Closing Summary (after closing) */}
      {closingData && (
        <div className="closing-summary">
          <h3>Closing Summary — Financial Statement</h3>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Calculations */}
            <div>
              <h4 className="font-bold mb-2 border-b border-red-300 pb-1">Profit & Loss Calculation</h4>
              
              <div className="line-item">
                <span>Actual Inventory Value:</span>
                <span>${formatCurrency(closingData.actualInventory)}</span>
              </div>
              <div className="line-item">
                <span>Less: Merchandise Book Balance:</span>
                <span>${formatCurrency(closingData.merchandiseBalance)}</span>
              </div>
              <div className="line-item font-bold">
                <span>Gross Profit (Loss):</span>
                <span className={closingData.grossProfitLoss >= 0 ? 'text-green-700' : ''}>
                  ${formatCurrency(closingData.grossProfitLoss)}
                </span>
              </div>
              
              <div className="line-item mt-4">
                <span>Less: Total Expenses:</span>
                <span>${formatCurrency(closingData.totalExpenses)}</span>
              </div>
              <div className="line-item">
                <span>Less: Interest/Discount Net:</span>
                <span>${formatCurrency(closingData.interestDiscountNet)}</span>
              </div>
              
              <div className="line-item total-line">
                <span>NET PROFIT (LOSS):</span>
                <span className={`text-lg ${closingData.netProfitLoss >= 0 ? 'text-green-700' : ''}`}>
                  ${formatCurrency(closingData.netProfitLoss)}
                </span>
              </div>
            </div>

            {/* Right Column - Distribution */}
            <div>
              <h4 className="font-bold mb-2 border-b border-red-300 pb-1">Capital Distribution</h4>
              
              {closingData.capitalDistribution.map((dist) => (
                <div key={dist.partnerId} className="line-item">
                  <span>{dist.name} ({dist.ownershipPercent}%):</span>
                  <span className={dist.share >= 0 ? 'text-green-700' : ''}>
                    ${formatCurrency(dist.share)}
                  </span>
                </div>
              ))}
              
              <div className="line-item total-line">
                <span>TOTAL DISTRIBUTED:</span>
                <span className={closingData.netProfitLoss >= 0 ? 'text-green-700' : ''}>
                  ${formatCurrency(closingData.netProfitLoss)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-red-300 text-sm">
            <p className="italic">
              Closing entries have been recorded in <span className="text-red-700 font-bold">RED INK</span>{' '}
              in the Synoptic Ledger, as specified in Baker's original manual. These entries close
              the temporary accounts (Expense, Interest) into the permanent capital accounts.
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-3 bg-ledger-aged border border-ledger-lines text-sm">
        <h4 className="font-bold mb-2">Closing Process Instructions (Per Baker's Manual):</h4>
        <ol className="list-decimal ml-4 space-y-1">
          <li>
            <strong>Take Physical Inventory:</strong> Count all merchandise on hand and determine
            its value at cost.
          </li>
          <li>
            <strong>Enter Actual Value:</strong> The difference between actual inventory and the
            book balance represents your gross profit or loss from operations.
          </li>
          <li>
            <strong>Representative Accounts:</strong> Expense and Interest/Discount are
            "representative" accounts that must be closed into Profit & Loss.
          </li>
          <li>
            <strong>Capital Distribution:</strong> The net gain or loss is distributed to
            partners/proprietors according to their ownership percentages.
          </li>
          <li>
            <strong>Red Ink Entries:</strong> Following 19th-century convention, all closing and
            balancing entries are made in <span className="text-red-700">RED INK</span> to
            distinguish them from regular transactions.
          </li>
        </ol>
      </div>
    </div>
  );
}
