import { useAccountingStore } from './store/accountingStore';
import { HistoricalContext } from './components/HistoricalContext';
import { Navigation } from './components/Navigation';
import { SynopticLedger } from './components/SynopticLedger';
import { SeldenLedger } from './components/SeldenLedger';
import { PayrollModule } from './components/PayrollModule';
import { PurchaseSalesModule } from './components/PurchaseSalesModule';
import { BillsModule } from './components/BillsModule';
import { ClosingModule } from './components/ClosingModule';
import type { ViewMode } from './types/accounting';

function App() {
  const { currentView, setCurrentView, columnPreset, setColumnPreset, currentDate, setCurrentDate } = useAccountingStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'synoptic':
        return <SynopticLedger />;
      case 'selden':
        return <SeldenLedger />;
      case 'payroll':
        return <PayrollModule />;
      case 'purchases':
      case 'sales':
        return <PurchaseSalesModule defaultTab={currentView} />;
      case 'bills':
        return <BillsModule />;
      case 'closing':
        return <ClosingModule />;
      default:
        return <SynopticLedger />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Historical Context Header */}
        <HistoricalContext />

        {/* Main Title */}
        <div className="ledger-title">
          Baker's Labor-Saving Synoptic System
        </div>
        <div className="ledger-subtitle">
          A Combined Day-Book, Journal, Cash-Book, and Ledger — Est. 1859
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-3 bg-ledger-header border border-ledger-lines">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Date:</span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="ledger-input"
              />
            </label>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Column Preset:</span>
              <select
                value={columnPreset}
                onChange={(e) => setColumnPreset(e.target.value as 'standard' | 'banker')}
                className="ledger-input"
              >
                <option value="standard">Standard (Merchandise)</option>
                <option value="banker">Banker's Option</option>
              </select>
            </label>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Navigation 
          currentView={currentView} 
          onViewChange={(view: ViewMode) => setCurrentView(view)} 
        />

        {/* Main Content Area */}
        <div className="mt-4">
          {renderCurrentView()}
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-ledger-lines text-center text-xs text-gray-600">
          <p className="font-heading italic">
            Based on the accounting system described in <em>Baker v. Selden</em> (101 U.S. 99, 1879)
          </p>
          <p className="mt-1">
            "The art of book-keeping cannot be the subject of copyright, but the particular forms and ruled lines prepared for use in that art may be."
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
