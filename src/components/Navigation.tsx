import type { ViewMode } from '../types/accounting';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const tabs: { id: ViewMode; label: string; description: string }[] = [
    { id: 'synoptic', label: 'Synoptic Ledger', description: "Baker's System" },
    { id: 'selden', label: 'Government Mode', description: "Selden's Condensed" },
    { id: 'payroll', label: 'Time-Book & Pay-Roll', description: 'Labor Wages' },
    { id: 'purchases', label: 'Purchases', description: 'Invoice Book' },
    { id: 'sales', label: 'Sales', description: 'Invoice Book' },
    { id: 'bills', label: 'Bill Books', description: 'Notes & Drafts' },
    { id: 'closing', label: 'Closing Process', description: 'End of Period' },
  ];

  return (
    <div className="nav-tabs flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${currentView === tab.id ? 'active' : ''}`}
          onClick={() => onViewChange(tab.id)}
          title={tab.description}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
