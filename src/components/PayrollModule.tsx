import { useState, useCallback } from 'react';
import { useAccountingStore } from '../store/accountingStore';
import { formatCurrency, formatDate } from '../utils/formatting';

export function PayrollModule() {
  const {
    payrollPeriods,
    addPayrollPeriod,
    addEmployee,
    updateEmployee,
    processPayroll,
    currentDate,
  } = useAccountingStore();

  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    startDate: currentDate,
    endDate: currentDate,
  });

  const [newEmployee, setNewEmployee] = useState<Record<string, {
    name: string;
    position: string;
    daysWorked: number;
    rate: number;
  }>>({});

  const handleCreatePeriod = useCallback(() => {
    addPayrollPeriod({
      startDate: newPeriod.startDate,
      endDate: newPeriod.endDate,
      employees: [],
    });
    setShowNewPeriod(false);
    setNewPeriod({
      startDate: currentDate,
      endDate: currentDate,
    });
  }, [addPayrollPeriod, newPeriod, currentDate]);

  const handleAddEmployee = useCallback((periodId: string) => {
    const emp = newEmployee[periodId];
    if (emp && emp.name && emp.daysWorked > 0 && emp.rate > 0) {
      addEmployee(periodId, {
        name: emp.name,
        position: emp.position,
        daysWorked: emp.daysWorked,
        rate: emp.rate,
      });
      setNewEmployee({
        ...newEmployee,
        [periodId]: { name: '', position: '', daysWorked: 0, rate: 0 },
      });
    }
  }, [addEmployee, newEmployee]);

  const initNewEmployee = (periodId: string) => {
    if (!newEmployee[periodId]) {
      setNewEmployee({
        ...newEmployee,
        [periodId]: { name: '', position: '', daysWorked: 0, rate: 0 },
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="ledger-title text-lg">Time-Book & Pay-Roll</h2>
        <p className="ledger-subtitle">
          Record employee labor and automatically generate payroll entries
        </p>
      </div>

      {/* Create New Period */}
      <div className="mb-6 no-print">
        {!showNewPeriod ? (
          <button
            onClick={() => setShowNewPeriod(true)}
            className="btn-ledger btn-success"
          >
            + New Pay Period
          </button>
        ) : (
          <div className="p-4 bg-ledger-aged border border-ledger-lines">
            <h3 className="font-bold mb-3">Create New Pay Period</h3>
            <div className="flex gap-4 items-end">
              <label className="flex flex-col">
                <span className="text-sm mb-1">Start Date:</span>
                <input
                  type="date"
                  value={newPeriod.startDate}
                  onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
                  className="ledger-input"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm mb-1">End Date:</span>
                <input
                  type="date"
                  value={newPeriod.endDate}
                  onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
                  className="ledger-input"
                />
              </label>
              <button onClick={handleCreatePeriod} className="btn-ledger btn-success">
                Create Period
              </button>
              <button onClick={() => setShowNewPeriod(false)} className="btn-ledger">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pay Periods */}
      {payrollPeriods.map((period) => {
        initNewEmployee(period.id);
        const isPaid = period.synopticEntryId !== undefined;

        return (
          <div
            key={period.id}
            className={`mb-6 border-2 ${isPaid ? 'border-green-700 bg-green-50' : 'border-ledger-lines'}`}
          >
            <div className="p-3 bg-ledger-header flex justify-between items-center">
              <div>
                <h3 className="font-bold">
                  Pay Period: {formatDate(period.startDate)} — {formatDate(period.endDate)}
                </h3>
                {isPaid && (
                  <span className="text-green-700 text-sm italic">
                    ✓ Payroll processed and recorded to Synoptic
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">Total: ${formatCurrency(period.totalPaid)}</div>
              </div>
            </div>

            {/* Employee Grid */}
            <table className="ledger-grid w-full">
              <thead>
                <tr className="header-level-2">
                  <th className="w-1/4">Employee Name</th>
                  <th className="w-1/4">Position</th>
                  <th className="w-1/6 text-right">Days Worked</th>
                  <th className="w-1/6 text-right">Rate ($/day)</th>
                  <th className="w-1/6 text-right">Total Earned</th>
                  <th className="no-print">Status</th>
                </tr>
              </thead>
              <tbody>
                {period.employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <input
                        type="text"
                        value={emp.name}
                        onChange={(e) =>
                          updateEmployee(period.id, emp.id, { name: e.target.value })
                        }
                        className="w-full"
                        disabled={isPaid}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={emp.position}
                        onChange={(e) =>
                          updateEmployee(period.id, emp.id, { position: e.target.value })
                        }
                        className="w-full"
                        disabled={isPaid}
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        value={emp.daysWorked}
                        onChange={(e) =>
                          updateEmployee(period.id, emp.id, {
                            daysWorked: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full text-right"
                        step="0.5"
                        min="0"
                        disabled={isPaid}
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        value={emp.rate}
                        onChange={(e) =>
                          updateEmployee(period.id, emp.id, {
                            rate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full text-right"
                        step="0.25"
                        min="0"
                        disabled={isPaid}
                      />
                    </td>
                    <td className="text-right font-bold">
                      ${formatCurrency(emp.totalEarned)}
                    </td>
                    <td className="no-print text-center">
                      {emp.isPaid ? (
                        <span className="text-green-700">✓ Paid</span>
                      ) : (
                        <span className="text-amber-700">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Add Employee Row */}
                {!isPaid && (
                  <tr className="bg-ledger-aged">
                    <td>
                      <input
                        type="text"
                        placeholder="New employee name"
                        value={newEmployee[period.id]?.name || ''}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            [period.id]: { ...newEmployee[period.id], name: e.target.value },
                          })
                        }
                        className="w-full ledger-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Position"
                        value={newEmployee[period.id]?.position || ''}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            [period.id]: { ...newEmployee[period.id], position: e.target.value },
                          })
                        }
                        className="w-full ledger-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="Days"
                        value={newEmployee[period.id]?.daysWorked || ''}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            [period.id]: {
                              ...newEmployee[period.id],
                              daysWorked: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full ledger-input text-right"
                        step="0.5"
                        min="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="Rate"
                        value={newEmployee[period.id]?.rate || ''}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            [period.id]: {
                              ...newEmployee[period.id],
                              rate: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full ledger-input text-right"
                        step="0.25"
                        min="0"
                      />
                    </td>
                    <td className="text-right">
                      ${formatCurrency(
                        (newEmployee[period.id]?.daysWorked || 0) *
                          (newEmployee[period.id]?.rate || 0)
                      )}
                    </td>
                    <td className="no-print text-center">
                      <button
                        onClick={() => handleAddEmployee(period.id)}
                        className="btn-ledger btn-success text-xs"
                      >
                        + Add
                      </button>
                    </td>
                  </tr>
                )}

                {period.employees.length === 0 && isPaid && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500 italic">
                      No employees in this pay period.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td colSpan={4} className="text-right font-bold">TOTAL PAYROLL:</td>
                  <td className="text-right font-bold">${formatCurrency(period.totalPaid)}</td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>

            {/* Process Payroll Button */}
            {!isPaid && period.employees.length > 0 && (
              <div className="p-3 bg-ledger-aged no-print">
                <button
                  onClick={() => processPayroll(period.id)}
                  className="btn-ledger btn-success"
                >
                  Process Pay Day — Record to Synoptic
                </button>
                <p className="text-xs mt-2 text-gray-600">
                  This will create an entry: <strong>Credit Cash</strong> ${formatCurrency(period.totalPaid)},{' '}
                  <strong>Debit Merchandise (Labor)</strong> ${formatCurrency(period.totalPaid)}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {payrollPeriods.length === 0 && (
        <div className="text-center py-8 text-gray-500 italic border border-dashed border-ledger-lines">
          No pay periods created yet. Click "New Pay Period" to begin.
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-3 bg-ledger-aged border border-ledger-lines text-sm">
        <h4 className="font-bold mb-2">Time-Book Instructions:</h4>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Create a new pay period for the dates you wish to cover.</li>
          <li>Add each employee with their days worked and daily rate.</li>
          <li>The system automatically calculates total earned (Days × Rate).</li>
          <li>
            On "Pay Day," click <strong>Process Pay Day</strong> to automatically generate the
            Synoptic entry: Credit Cash and Debit Merchandise (representing labor cost).
          </li>
          <li>Once processed, the period is locked and marked as paid.</li>
        </ol>
      </div>
    </div>
  );
}
