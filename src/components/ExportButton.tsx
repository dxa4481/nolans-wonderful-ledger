import { useState } from 'react';
import { generatePrintableLedger, generateQuickLedger } from '../utils/pdfExport';

export function ExportButton() {
  const [showModal, setShowModal] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportType, setExportType] = useState<'full' | 'quick'>('full');
  const [quickMonths, setQuickMonths] = useState(1);

  const handleExport = async () => {
    setIsGenerating(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      try {
        if (exportType === 'full') {
          generatePrintableLedger(year);
        } else {
          generateQuickLedger(year, quickMonths);
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      }
      setIsGenerating(false);
      setShowModal(false);
    }, 100);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-ledger flex items-center gap-2"
        title="Export printable ledger book as PDF"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export Printable Book
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ledger-paper border-2 border-ledger-lines p-6 max-w-lg w-full mx-4 shadow-xl">
            <h2 className="ledger-title text-lg mb-4">Export Printable Ledger Book</h2>
            
            <p className="text-sm mb-4">
              Generate a PDF of empty ledger pages formatted for printing. 
              Print double-sided and bind for an authentic 19th-century accounting book.
            </p>

            <div className="space-y-4">
              {/* Year Selection */}
              <div>
                <label className="block text-sm font-semibold mb-1">Year:</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  className="ledger-input w-32"
                  min="1800"
                  max="2100"
                />
              </div>

              {/* Export Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">Export Type:</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportType"
                      checked={exportType === 'full'}
                      onChange={() => setExportType('full')}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-semibold">Full Year Book</span>
                      <p className="text-xs text-gray-600">
                        Complete ledger with title page, instructions, 24 monthly pages (2 per month),
                        Bills Receivable/Payable pages, and Payroll pages. (~35 pages)
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportType"
                      checked={exportType === 'quick'}
                      onChange={() => setExportType('quick')}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-semibold">Quick Export</span>
                      <p className="text-xs text-gray-600">
                        Just the synoptic ledger pages for selected months.
                      </p>
                      {exportType === 'quick' && (
                        <div className="mt-2">
                          <label className="text-xs">
                            Months: 
                            <select 
                              value={quickMonths}
                              onChange={(e) => setQuickMonths(parseInt(e.target.value))}
                              className="ledger-input ml-2 w-20"
                            >
                              {[1, 2, 3, 6, 12].map(n => (
                                <option key={n} value={n}>{n} month{n > 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Contents Preview */}
              <div className="bg-ledger-aged p-3 border border-ledger-lines text-xs">
                <strong>Book Contents ({exportType === 'full' ? '~43 pages' : `${quickMonths * 2} pages`}):</strong>
                {exportType === 'full' ? (
                  <ul className="mt-1 ml-4 list-disc">
                    <li>Decorative Title Page with Universal Rule</li>
                    <li>Table of Contents</li>
                    <li>Instructions for Use & Quick Reference Guide</li>
                    <li>24 Monthly Synoptic Ledger Pages (Jan-Dec, 2 pages each)</li>
                    <li>Purchase Day-Book (2 pages)</li>
                    <li>Sales Day-Book (2 pages)</li>
                    <li>Bills Receivable Register (2 pages)</li>
                    <li>Bills Payable Register (2 pages)</li>
                    <li>Time-Book & Payroll Sheets (4 pages)</li>
                    <li>Closing Worksheets: Trial Balance, P&L, Balance Sheet</li>
                  </ul>
                ) : (
                  <ul className="mt-1 ml-4 list-disc">
                    <li>{quickMonths * 2} Synoptic Ledger Pages ({quickMonths} month{quickMonths > 1 ? 's' : ''})</li>
                  </ul>
                )}
              </div>

              {/* Print Tips */}
              <div className="bg-amber-50 p-3 border border-amber-700 text-xs">
                <strong>Printing Tips:</strong>
                <ul className="mt-1 ml-4 list-disc">
                  <li>Use landscape orientation</li>
                  <li>Print on Letter (8.5" × 11") paper</li>
                  <li>Enable "Print on both sides" (flip on short edge)</li>
                  <li>Use heavier paper (24-28 lb) for durability</li>
                  <li>Bind with a 3-hole punch or saddle stitch</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn-ledger"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="btn-ledger btn-success"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
