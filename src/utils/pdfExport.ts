import { jsPDF } from 'jspdf';

// Page dimensions - Letter size landscape (more width for ledger columns)
const PAGE_WIDTH = 279.4; // 11 inches in mm
const PAGE_HEIGHT = 215.9; // 8.5 inches in mm
const MARGIN_LEFT = 10;
const MARGIN_RIGHT = 10;
const MARGIN_BOTTOM = 10;
const USABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Colors
const SEPIA = { r: 139, g: 115, b: 85 };
const PAPER = { r: 245, g: 240, b: 230 };
const HEADER_DARK = { r: 180, g: 165, b: 140 };
const HEADER_LIGHT = { r: 212, g: 197, b: 169 };
const LINES = { r: 170, g: 155, b: 130 };
const INK = { r: 26, g: 26, b: 46 };
const RED_INK = { r: 139, g: 0, b: 0 };

interface ColDef {
  name: string;
  subCols?: string[];
  width: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function setColor(doc: jsPDF, color: { r: number; g: number; b: number }, type: 'draw' | 'fill' | 'text') {
  if (type === 'draw') doc.setDrawColor(color.r, color.g, color.b);
  else if (type === 'fill') doc.setFillColor(color.r, color.g, color.b);
  else doc.setTextColor(color.r, color.g, color.b);
}

function drawDoubleLine(doc: jsPDF, x1: number, y1: number, x2: number, y2: number) {
  doc.setLineWidth(0.4);
  doc.line(x1, y1, x2, y2);
  doc.setLineWidth(0.2);
  doc.line(x1, y1 + 0.8, x2, y2 + 0.8);
}

function drawDecorativeBorder(doc: jsPDF, x: number, y: number, w: number, h: number) {
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(1.5);
  doc.rect(x, y, w, h);
  doc.setLineWidth(0.3);
  doc.rect(x + 2, y + 2, w - 4, h - 4);
  doc.setLineWidth(0.1);
  doc.rect(x + 3.5, y + 3.5, w - 7, h - 7);
}

function addPageNumber(doc: jsPDF, pageNum: number, totalPages?: number) {
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  setColor(doc, INK, 'text');
  const text = totalPages ? `Page ${pageNum} of ${totalPages}` : `Page ${pageNum}`;
  doc.text(text, PAGE_WIDTH / 2, PAGE_HEIGHT - 5, { align: 'center' });
}

function addRunningHeader(doc: jsPDF, leftText: string, rightText: string) {
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  setColor(doc, INK, 'text');
  doc.text(leftText, MARGIN_LEFT, 7);
  doc.text(rightText, PAGE_WIDTH - MARGIN_RIGHT, 7, { align: 'right' });
  setColor(doc, LINES, 'draw');
  doc.setLineWidth(0.2);
  doc.line(MARGIN_LEFT, 9, PAGE_WIDTH - MARGIN_RIGHT, 9);
}

// ============================================================================
// INSTRUCTIONS PAGE
// ============================================================================

function addInstructionsPage(doc: jsPDF) {
  doc.addPage();
  addRunningHeader(doc, "Baker's Synoptic System", 'Instructions');
  
  const leftCol = MARGIN_LEFT + 5;
  let y = 20;
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('INSTRUCTIONS FOR THE USE OF THIS LEDGER', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 10;
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  doc.line(50, y, PAGE_WIDTH - 50, y);
  
  y += 8;
  
  const sections = [
    {
      title: 'I. THE PRINCIPLE OF THE SYNOPTIC',
      content: [
        'This system combines the Day-Book, Journal, Cash-Book, and Ledger into ONE book.',
        'Every transaction is recorded but once, yet is instantly classified into its proper account.',
        'The columnar arrangement ensures that each entry is self-proving—if Debits do not',
        'equal Credits on each line, an error has been made and must be corrected immediately.',
      ]
    },
    {
      title: 'II. THE UNIVERSAL RULE',
      content: [
        'Credit that which FURNISHES the value; Debit that which RECEIVES the value.',
        '',
        'Examples of application:',
        '  • Cash Sale: Cash RECEIVES money (Dr.), Merchandise FURNISHES goods (Cr.)',
        '  • Cash Purchase: Merchandise RECEIVES goods (Dr.), Cash FURNISHES money (Cr.)',
        '  • Sale on Account: Customer RECEIVES goods (Dr. Persons-Sell), Mdse. FURNISHES (Cr.)',
        '  • Purchase on Account: Mdse. RECEIVES (Dr.), Vendor FURNISHES credit (Cr. Persons-Buy)',
      ]
    },
    {
      title: 'III. DAILY PROCEDURE',
      content: [
        '1. Enter the date in the first column.',
        '2. Write a brief description of the transaction.',
        '3. Enter the Ledger Folio (L.F.) reference if using subsidiary ledgers.',
        '4. Place the amount in the appropriate Debit column(s).',
        '5. Place the equal amount in the appropriate Credit column(s).',
        '6. Verify the row balances before proceeding to the next entry.',
        '7. At day\'s end, sum each column and verify: Total Debits = Total Credits.',
        '8. Calculate Cash on Hand: Cash Dr. minus Cash Cr. = Cash balance.',
      ]
    },
    {
      title: 'IV. THE COLUMNS EXPLAINED',
      content: [
        '• CASH — All money received (Dr.) and all money paid out (Cr.)',
        '• PERSONS (We Sell To) — Customers who owe us; our Accounts Receivable',
        '• PERSONS (We Buy From) — Vendors we owe; our Accounts Payable',
        '• MERCHANDISE — Cost of goods bought (Dr.) and selling price of goods sold (Cr.)',
        '• EXPENSE — All operating costs: rent, wages, supplies, etc. (Dr. only)',
        '• BILLS RECEIVABLE — Promissory notes we hold from others',
        '• BILLS PAYABLE — Promissory notes we have issued to others',
        '• INTEREST & DISCOUNT — Interest earned (Cr.) or paid (Dr.); discounts taken/given',
        '• SUNDRIES — Capital, Profit & Loss, and any accounts not elsewhere classified',
      ]
    },
  ];
  
  for (const section of sections) {
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text(section.title, leftCol, y);
    y += 5;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    for (const line of section.content) {
      if (line === '') {
        y += 2;
        continue;
      }
      doc.text(line, leftCol + 3, y);
      y += 4;
    }
    y += 4;
  }
  
  addPageNumber(doc, 3);
}

// ============================================================================
// QUICK REFERENCE PAGE
// ============================================================================

function addQuickReferencePage(doc: jsPDF) {
  doc.addPage();
  addRunningHeader(doc, "Baker's Synoptic System", 'Quick Reference');
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('QUICK REFERENCE: COMMON TRANSACTIONS', PAGE_WIDTH / 2, 20, { align: 'center' });
  
  // Transaction reference table
  const tableY = 30;
  const cols = [
    { name: 'Transaction', width: 55 },
    { name: 'Debit', width: 50 },
    { name: 'Credit', width: 50 },
    { name: 'Example', width: 100 },
  ];
  
  let x = MARGIN_LEFT;
  const tableWidth = cols.reduce((sum, c) => sum + c.width, 0);
  
  // Header
  setColor(doc, HEADER_DARK, 'fill');
  doc.rect(x, tableY, tableWidth, 8, 'F');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  doc.rect(x, tableY, tableWidth, 8);
  
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  setColor(doc, INK, 'text');
  for (const col of cols) {
    doc.text(col.name, x + col.width / 2, tableY + 5.5, { align: 'center' });
    x += col.width;
  }
  
  // Rows
  const transactions = [
    ['Cash sale', 'Cash', 'Merchandise', 'Sold goods for $50 cash'],
    ['Cash purchase', 'Merchandise', 'Cash', 'Bought goods for $30 cash'],
    ['Sale on account', 'Persons (Sell To)', 'Merchandise', 'Sold $100 goods to J. Smith'],
    ['Purchase on account', 'Merchandise', 'Persons (Buy From)', 'Bought $75 goods from ABC Co.'],
    ['Collect receivable', 'Cash', 'Persons (Sell To)', 'J. Smith paid his $100 account'],
    ['Pay vendor', 'Persons (Buy From)', 'Cash', 'Paid ABC Co. $75 owed'],
    ['Pay expense', 'Expense', 'Cash', 'Paid $20 rent'],
    ['Receive note', 'Bills Receivable', 'Persons (Sell To)', 'Took 30-day note from customer'],
    ['Issue note', 'Persons (Buy From)', 'Bills Payable', 'Gave note to vendor'],
    ['Collect note', 'Cash', 'Bills Receivable', 'Customer paid note at maturity'],
    ['Pay note', 'Bills Payable', 'Cash', 'Paid our note at maturity'],
    ['Discount earned', 'Expense (less)', 'Interest/Discount', 'Took 2% discount for early pay'],
    ['Interest received', 'Cash', 'Interest/Discount', 'Received interest on note'],
    ['Interest paid', 'Interest/Discount', 'Cash', 'Paid interest on our note'],
    ['Owner investment', 'Cash', 'Sundries (Capital)', 'Owner invested $500'],
    ['Owner withdrawal', 'Sundries (Drawing)', 'Cash', 'Owner withdrew $50'],
  ];
  
  let rowY = tableY + 8;
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  
  for (let i = 0; i < transactions.length; i++) {
    const row = transactions[i];
    x = MARGIN_LEFT;
    
    // Alternating row colors
    if (i % 2 === 0) {
      setColor(doc, PAPER, 'fill');
      doc.rect(x, rowY, tableWidth, 6, 'F');
    }
    
    setColor(doc, LINES, 'draw');
    doc.setLineWidth(0.1);
    doc.rect(x, rowY, tableWidth, 6);
    
    setColor(doc, INK, 'text');
    for (let j = 0; j < cols.length; j++) {
      doc.text(row[j], x + 2, rowY + 4);
      setColor(doc, LINES, 'draw');
      doc.line(x, rowY, x, rowY + 6);
      x += cols[j].width;
    }
    doc.line(x, rowY, x, rowY + 6);
    
    rowY += 6;
  }
  
  // Closing entries section
  rowY += 10;
  setColor(doc, RED_INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('CLOSING ENTRIES (Made in Red Ink)', MARGIN_LEFT, rowY);
  
  rowY += 6;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  setColor(doc, INK, 'text');
  
  const closingNotes = [
    '1. Close Expense to Profit & Loss: Cr. Expense (to zero it), Dr. Sundries (P&L)',
    '2. Close Interest/Discount: Transfer net balance to Sundries (P&L)',
    '3. Inventory Adjustment: Compare physical count to Merchandise balance',
    '4. Close P&L to Capital: Dr. or Cr. Sundries (P&L), opposite to Sundries (Capital)',
  ];
  
  for (const note of closingNotes) {
    doc.text(note, MARGIN_LEFT + 5, rowY);
    rowY += 5;
  }
  
  addPageNumber(doc, 4);
}

// ============================================================================
// SYNOPTIC LEDGER PAGE
// ============================================================================

function addSynopticLedgerPage(doc: jsPDF, month: string, year: number, pageNum: number, pageOf: string) {
  doc.addPage();
  
  // Running header
  addRunningHeader(doc, `${month} ${year}`, `Synoptic Ledger — ${pageOf}`);
  
  const startY = 14;
  const headerHeight1 = 7;  // Main header row
  const headerHeight2 = 5;  // Sub-header row (Dr/Cr)
  const rowHeight = 5.5;
  
  // Define columns to fit page width exactly
  // Total needs to be ~259mm (usable width)
  const columns: ColDef[] = [
    { name: 'DATE', width: 14 },
    { name: 'DESCRIPTION OF TRANSACTION', width: 42 },
    { name: 'L.F.', width: 8 },
    { name: 'CASH', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'PERSONS\n(We Sell To)', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'PERSONS\n(We Buy From)', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'MERCHAN-\nDISE', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'EXPENSE', subCols: ['Dr.'], width: 13 },
    { name: 'BILLS\nRECEIVABLE', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'BILLS\nPAYABLE', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'INTEREST &\nDISCOUNT', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'SUNDRIES', subCols: ['Dr.', 'Cr.'], width: 26 },
  ];
  
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
  const startX = MARGIN_LEFT + (USABLE_WIDTH - totalWidth) / 2; // Center the grid
  
  // Draw main headers
  let x = startX;
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  
  for (const col of columns) {
    const hasSubCols = col.subCols && col.subCols.length > 0;
    const headerH = hasSubCols ? headerHeight1 : headerHeight1 + headerHeight2;
    
    // Header background
    setColor(doc, hasSubCols ? HEADER_DARK : HEADER_LIGHT, 'fill');
    doc.rect(x, startY, col.width, headerH, 'F');
    setColor(doc, SEPIA, 'draw');
    doc.rect(x, startY, col.width, headerH);
    
    // Header text
    setColor(doc, INK, 'text');
    doc.setFont('times', 'bold');
    doc.setFontSize(6);
    
    const lines = col.name.split('\n');
    if (lines.length > 1) {
      doc.text(lines[0], x + col.width / 2, startY + 3, { align: 'center' });
      doc.text(lines[1], x + col.width / 2, startY + 6, { align: 'center' });
    } else {
      doc.text(col.name, x + col.width / 2, startY + (hasSubCols ? 4 : 7), { align: 'center' });
    }
    
    // Sub-headers (Dr./Cr.)
    if (hasSubCols && col.subCols) {
      const subCols = col.subCols;
      const subWidth = col.width / subCols.length;
      for (let i = 0; i < subCols.length; i++) {
        const subX = x + i * subWidth;
        setColor(doc, HEADER_LIGHT, 'fill');
        doc.rect(subX, startY + headerHeight1, subWidth, headerHeight2, 'F');
        setColor(doc, SEPIA, 'draw');
        doc.rect(subX, startY + headerHeight1, subWidth, headerHeight2);
        
        setColor(doc, INK, 'text');
        doc.setFontSize(5);
        doc.text(subCols[i], subX + subWidth / 2, startY + headerHeight1 + 3.5, { align: 'center' });
      }
    }
    
    x += col.width;
  }
  
  // Calculate rows
  const dataStartY = startY + headerHeight1 + headerHeight2;
  const totalsRowHeight = 7;
  const cashProofHeight = 6;
  const availableHeight = PAGE_HEIGHT - dataStartY - MARGIN_BOTTOM - totalsRowHeight - cashProofHeight - 5;
  const numRows = Math.floor(availableHeight / rowHeight);
  
  // Draw data rows
  setColor(doc, LINES, 'draw');
  doc.setLineWidth(0.1);
  
  for (let row = 0; row <= numRows; row++) {
    const y = dataStartY + row * rowHeight;
    doc.line(startX, y, startX + totalWidth, y);
  }
  
  // Draw vertical lines
  x = startX;
  const dataEndY = dataStartY + numRows * rowHeight;
  
  for (const col of columns) {
    doc.setLineWidth(0.2);
    doc.line(x, dataStartY, x, dataEndY);
    
    // Sub-column dividers
    const subColsArr = col.subCols || [];
    if (subColsArr.length > 1) {
      doc.setLineWidth(0.05);
      const subWidth = col.width / subColsArr.length;
      for (let i = 1; i < subColsArr.length; i++) {
        doc.line(x + i * subWidth, dataStartY, x + i * subWidth, dataEndY);
      }
    }
    x += col.width;
  }
  doc.setLineWidth(0.2);
  doc.line(x, dataStartY, x, dataEndY);
  
  // Totals row
  const totalsY = dataEndY;
  setColor(doc, HEADER_LIGHT, 'fill');
  doc.rect(startX, totalsY, totalWidth, totalsRowHeight, 'F');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.4);
  doc.line(startX, totalsY, startX + totalWidth, totalsY);
  doc.setLineWidth(0.3);
  doc.rect(startX, totalsY, totalWidth, totalsRowHeight);
  
  // "PAGE TOTALS" label
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(7);
  doc.text('PAGE TOTALS', startX + columns[0].width + columns[1].width / 2, totalsY + 4.5, { align: 'center' });
  
  // Vertical lines in totals
  x = startX;
  doc.setLineWidth(0.2);
  for (const col of columns) {
    doc.line(x, totalsY, x, totalsY + totalsRowHeight);
    const totalsSubCols = col.subCols || [];
    if (totalsSubCols.length > 1) {
      doc.setLineWidth(0.1);
      const subWidth = col.width / totalsSubCols.length;
      for (let i = 1; i < totalsSubCols.length; i++) {
        doc.line(x + i * subWidth, totalsY, x + i * subWidth, totalsY + totalsRowHeight);
      }
      doc.setLineWidth(0.2);
    }
    x += col.width;
  }
  doc.line(x, totalsY, x, totalsY + totalsRowHeight);
  
  // Double line at bottom of totals
  drawDoubleLine(doc, startX, totalsY + totalsRowHeight, startX + totalWidth, totalsY + totalsRowHeight);
  
  // Cash proof row
  const cashProofY = totalsY + totalsRowHeight + 2;
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  setColor(doc, INK, 'text');
  doc.text('Cash on Hand (Cash Dr. − Cash Cr.): $_____________', startX, cashProofY + 4);
  doc.text('Carried Forward to next page: $_____________', startX + totalWidth - 60, cashProofY + 4, { align: 'right' });
  
  addPageNumber(doc, pageNum);
}

// ============================================================================
// AUXILIARY BOOK: PURCHASE DAY-BOOK
// ============================================================================

function addPurchaseDayBook(doc: jsPDF, year: number, pageNum: number, continued: boolean = false) {
  doc.addPage();
  addRunningHeader(doc, `Purchase Day-Book — ${year}`, continued ? 'Continued' : 'Page ' + pageNum);
  
  const startY = 18;
  const headerHeight = 8;
  const rowHeight = 6;
  
  // Instruction text
  if (!continued) {
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    setColor(doc, INK, 'text');
    doc.text('Record all purchases here. Summarize daily totals to the Synoptic: Dr. Merchandise, Cr. Persons (We Buy From)', MARGIN_LEFT, startY - 4);
  }
  
  const columns: ColDef[] = [
    { name: 'DATE', width: 18 },
    { name: 'INVOICE NO.', width: 22 },
    { name: 'VENDOR NAME', width: 55 },
    { name: 'DESCRIPTION OF GOODS', width: 80 },
    { name: 'AMOUNT', width: 25 },
    { name: 'POSTED', width: 15 },
    { name: 'REMARKS', width: 40 },
  ];
  
  drawAuxiliaryTable(doc, columns, startY, headerHeight, rowHeight, pageNum);
}

// ============================================================================
// AUXILIARY BOOK: SALES DAY-BOOK
// ============================================================================

function addSalesDayBook(doc: jsPDF, year: number, pageNum: number, continued: boolean = false) {
  doc.addPage();
  addRunningHeader(doc, `Sales Day-Book — ${year}`, continued ? 'Continued' : 'Page ' + pageNum);
  
  const startY = 18;
  const headerHeight = 8;
  const rowHeight = 6;
  
  if (!continued) {
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    setColor(doc, INK, 'text');
    doc.text('Record all sales here. Summarize daily totals to the Synoptic: Dr. Persons (We Sell To), Cr. Merchandise', MARGIN_LEFT, startY - 4);
  }
  
  const columns: ColDef[] = [
    { name: 'DATE', width: 18 },
    { name: 'INVOICE NO.', width: 22 },
    { name: 'CUSTOMER NAME', width: 55 },
    { name: 'DESCRIPTION OF GOODS', width: 80 },
    { name: 'AMOUNT', width: 25 },
    { name: 'POSTED', width: 15 },
    { name: 'REMARKS', width: 40 },
  ];
  
  drawAuxiliaryTable(doc, columns, startY, headerHeight, rowHeight, pageNum);
}

// ============================================================================
// AUXILIARY BOOK: BILLS RECEIVABLE
// ============================================================================

function addBillsReceivable(doc: jsPDF, year: number, pageNum: number, continued: boolean = false) {
  doc.addPage();
  addRunningHeader(doc, `Bills Receivable Register — ${year}`, continued ? 'Continued' : 'Page ' + pageNum);
  
  const startY = 18;
  const headerHeight = 10;
  const rowHeight = 6;
  
  if (!continued) {
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    setColor(doc, INK, 'text');
    doc.text('Record promissory notes received. When collected: Dr. Cash, Cr. Bills Receivable in Synoptic.', MARGIN_LEFT, startY - 4);
  }
  
  const columns: ColDef[] = [
    { name: 'DATE\nRECEIVED', width: 18 },
    { name: 'FROM WHOM', width: 45 },
    { name: 'FOR WHAT', width: 50 },
    { name: 'AMOUNT', width: 22 },
    { name: 'TIME\n(DAYS)', width: 14 },
    { name: 'DUE\nDATE', width: 18 },
    { name: 'DATE\nCOLLECTED', width: 18 },
    { name: 'HOW\nDISPOSED', width: 35 },
    { name: 'REMARKS', width: 35 },
  ];
  
  drawAuxiliaryTable(doc, columns, startY, headerHeight, rowHeight, pageNum);
}

// ============================================================================
// AUXILIARY BOOK: BILLS PAYABLE
// ============================================================================

function addBillsPayable(doc: jsPDF, year: number, pageNum: number, continued: boolean = false) {
  doc.addPage();
  addRunningHeader(doc, `Bills Payable Register — ${year}`, continued ? 'Continued' : 'Page ' + pageNum);
  
  const startY = 18;
  const headerHeight = 10;
  const rowHeight = 6;
  
  if (!continued) {
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    setColor(doc, INK, 'text');
    doc.text('Record promissory notes issued. When paid: Dr. Bills Payable, Cr. Cash in Synoptic.', MARGIN_LEFT, startY - 4);
  }
  
  const columns: ColDef[] = [
    { name: 'DATE\nISSUED', width: 18 },
    { name: 'TO WHOM', width: 45 },
    { name: 'FOR WHAT', width: 50 },
    { name: 'AMOUNT', width: 22 },
    { name: 'TIME\n(DAYS)', width: 14 },
    { name: 'DUE\nDATE', width: 18 },
    { name: 'DATE\nPAID', width: 18 },
    { name: 'HOW\nPAID', width: 35 },
    { name: 'REMARKS', width: 35 },
  ];
  
  drawAuxiliaryTable(doc, columns, startY, headerHeight, rowHeight, pageNum);
}

// ============================================================================
// AUXILIARY BOOK: TIME-BOOK & PAYROLL
// ============================================================================

function addPayrollPage(doc: jsPDF, year: number, pageNum: number) {
  doc.addPage();
  addRunningHeader(doc, `Time-Book & Pay-Roll — ${year}`, 'Page ' + pageNum);
  
  const startY = 20;
  
  // Pay period line
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  setColor(doc, INK, 'text');
  doc.text('Pay Period: From _________________ To _________________', MARGIN_LEFT, startY - 5);
  doc.text('Pay Date: _________________', PAGE_WIDTH - MARGIN_RIGHT - 50, startY - 5);
  
  const headerHeight = 10;
  const rowHeight = 6;
  
  const columns: ColDef[] = [
    { name: 'NO.', width: 10 },
    { name: 'EMPLOYEE NAME', width: 50 },
    { name: 'POSITION/\nOCCUPATION', width: 35 },
    { name: 'DAYS\nWORKED', width: 16 },
    { name: 'RATE\nPER DAY', width: 18 },
    { name: 'GROSS\nEARNED', width: 22 },
    { name: 'DEDUC-\nTIONS', width: 20 },
    { name: 'NET\nPAY', width: 22 },
    { name: 'RECEIPT/\nSIGNATURE', width: 45 },
    { name: 'REMARKS', width: 20 },
  ];
  
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
  const startX = MARGIN_LEFT + (USABLE_WIDTH - totalWidth) / 2;
  
  // Draw headers
  let x = startX;
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  
  for (const col of columns) {
    setColor(doc, HEADER_LIGHT, 'fill');
    doc.rect(x, startY, col.width, headerHeight, 'F');
    setColor(doc, SEPIA, 'draw');
    doc.rect(x, startY, col.width, headerHeight);
    
    setColor(doc, INK, 'text');
    doc.setFont('times', 'bold');
    doc.setFontSize(6);
    
    const lines = col.name.split('\n');
    if (lines.length > 1) {
      doc.text(lines[0], x + col.width / 2, startY + 4, { align: 'center' });
      doc.text(lines[1], x + col.width / 2, startY + 7.5, { align: 'center' });
    } else {
      doc.text(col.name, x + col.width / 2, startY + 6, { align: 'center' });
    }
    x += col.width;
  }
  
  // Calculate rows
  const dataStartY = startY + headerHeight;
  const totalsRowHeight = 8;
  const notesHeight = 20;
  const availableHeight = PAGE_HEIGHT - dataStartY - MARGIN_BOTTOM - totalsRowHeight - notesHeight;
  const numRows = Math.floor(availableHeight / rowHeight);
  
  // Draw rows with row numbers
  setColor(doc, LINES, 'draw');
  doc.setLineWidth(0.1);
  
  for (let row = 0; row <= numRows; row++) {
    const y = dataStartY + row * rowHeight;
    doc.line(startX, y, startX + totalWidth, y);
    
    // Row number
    if (row < numRows) {
      doc.setFont('times', 'normal');
      doc.setFontSize(6);
      setColor(doc, INK, 'text');
      doc.text((row + 1).toString(), startX + columns[0].width / 2, y + 4, { align: 'center' });
    }
  }
  
  // Vertical lines
  x = startX;
  const dataEndY = dataStartY + numRows * rowHeight;
  doc.setLineWidth(0.15);
  for (const col of columns) {
    doc.line(x, dataStartY, x, dataEndY);
    x += col.width;
  }
  doc.line(x, dataStartY, x, dataEndY);
  
  // Totals row
  const totalsY = dataEndY;
  setColor(doc, HEADER_LIGHT, 'fill');
  doc.rect(startX, totalsY, totalWidth, totalsRowHeight, 'F');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  doc.rect(startX, totalsY, totalWidth, totalsRowHeight);
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.text('TOTALS', startX + columns[0].width + columns[1].width / 2, totalsY + 5.5, { align: 'center' });
  
  // Vertical lines in totals
  x = startX;
  for (const col of columns) {
    doc.line(x, totalsY, x, totalsY + totalsRowHeight);
    x += col.width;
  }
  doc.line(x, totalsY, x, totalsY + totalsRowHeight);
  
  // Synoptic entry note
  const noteY = totalsY + totalsRowHeight + 5;
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text('Synoptic Entry: Dr. Merchandise (Labor) $_________  Cr. Cash $_________', startX, noteY);
  doc.text('Posted to Synoptic: Date _________ Page _____', startX + 150, noteY);
  
  addPageNumber(doc, pageNum);
}

// ============================================================================
// CLOSING WORKSHEETS
// ============================================================================

function addTrialBalanceSheet(doc: jsPDF, year: number, pageNum: number) {
  doc.addPage();
  addRunningHeader(doc, `Closing Worksheets — ${year}`, 'Trial Balance');
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('TRIAL BALANCE', PAGE_WIDTH / 2, 22, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text(`As of _________________, ${year}`, PAGE_WIDTH / 2, 28, { align: 'center' });
  
  const startY = 35;
  const headerHeight = 8;
  const rowHeight = 6;
  
  const columns: ColDef[] = [
    { name: 'ACCOUNT NAME', width: 100 },
    { name: 'L.F.', width: 15 },
    { name: 'DEBIT', width: 35 },
    { name: 'CREDIT', width: 35 },
  ];
  
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
  const startX = (PAGE_WIDTH - totalWidth) / 2;
  
  // Header
  let x = startX;
  for (const col of columns) {
    setColor(doc, HEADER_LIGHT, 'fill');
    doc.rect(x, startY, col.width, headerHeight, 'F');
    setColor(doc, SEPIA, 'draw');
    doc.setLineWidth(0.3);
    doc.rect(x, startY, col.width, headerHeight);
    
    setColor(doc, INK, 'text');
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text(col.name, x + col.width / 2, startY + 5.5, { align: 'center' });
    x += col.width;
  }
  
  // Pre-printed account names
  const accounts = [
    'Cash',
    'Persons (We Sell To) — Accounts Receivable',
    'Persons (We Buy From) — Accounts Payable',
    'Merchandise Inventory',
    'Bills Receivable',
    'Bills Payable',
    'Expense',
    'Interest & Discount',
    'Sundries — Capital',
    'Sundries — Drawing',
    'Sundries — Profit & Loss',
    '', '', '', '', '', '', '', '', '', // Blank rows
  ];
  
  let y = startY + headerHeight;
  setColor(doc, LINES, 'draw');
  doc.setLineWidth(0.1);
  
  for (const acct of accounts) {
    doc.line(startX, y + rowHeight, startX + totalWidth, y + rowHeight);
    
    if (acct) {
      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      setColor(doc, INK, 'text');
      doc.text(acct, startX + 3, y + 4);
    }
    y += rowHeight;
  }
  
  // Vertical lines
  x = startX;
  const dataEndY = y;
  doc.setLineWidth(0.15);
  for (const col of columns) {
    doc.line(x, startY + headerHeight, x, dataEndY);
    x += col.width;
  }
  doc.line(x, startY + headerHeight, x, dataEndY);
  
  // Totals row
  setColor(doc, HEADER_LIGHT, 'fill');
  doc.rect(startX, dataEndY, totalWidth, 8, 'F');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.4);
  doc.rect(startX, dataEndY, totalWidth, 8);
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('TOTALS (Must be Equal)', startX + columns[0].width / 2, dataEndY + 5.5, { align: 'center' });
  
  addPageNumber(doc, pageNum);
}

function addProfitLossStatement(doc: jsPDF, year: number, pageNum: number) {
  doc.addPage();
  addRunningHeader(doc, `Closing Worksheets — ${year}`, 'Profit & Loss');
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('STATEMENT OF PROFIT AND LOSS', PAGE_WIDTH / 2, 22, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text(`For the Period Ending _________________, ${year}`, PAGE_WIDTH / 2, 28, { align: 'center' });
  
  const startY = 40;
  const leftCol = 50;
  const rightCol = PAGE_WIDTH - 50;
  const lineHeight = 7;
  
  let y = startY;
  
  const items = [
    { label: 'Merchandise — Total Debits (Purchases + Opening Inventory)', value: true },
    { label: 'Less: Merchandise — Total Credits (Sales)', value: true },
    { label: '', value: false, line: true },
    { label: 'Merchandise Balance (Book Value)', value: true },
    { label: '', value: false },
    { label: 'Actual Inventory (Physical Count)', value: true },
    { label: '', value: false, line: true },
    { label: 'GROSS PROFIT (or Loss)', value: true, bold: true },
    { label: '', value: false },
    { label: 'Less: Expenses', value: true },
    { label: 'Less: Interest & Discount (Net)', value: true },
    { label: '', value: false, line: true },
    { label: 'NET PROFIT (or Loss)', value: true, bold: true },
    { label: '', value: false },
    { label: '', value: false },
    { label: 'Distribution of Net Profit:', value: false, bold: true },
    { label: '    Partner/Proprietor: _______________ Share: _____%', value: true },
    { label: '    Partner/Proprietor: _______________ Share: _____%', value: true },
    { label: '    Partner/Proprietor: _______________ Share: _____%', value: true },
  ];
  
  for (const item of items) {
    if (item.line) {
      setColor(doc, SEPIA, 'draw');
      doc.setLineWidth(0.3);
      doc.line(rightCol - 40, y, rightCol, y);
      y += 2;
      continue;
    }
    
    if (!item.label) {
      y += lineHeight / 2;
      continue;
    }
    
    doc.setFont('times', item.bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    setColor(doc, INK, 'text');
    doc.text(item.label, leftCol, y);
    
    if (item.value) {
      doc.text('$_____________', rightCol, y, { align: 'right' });
    }
    
    y += lineHeight;
  }
  
  addPageNumber(doc, pageNum);
}

function addBalanceSheet(doc: jsPDF, year: number, pageNum: number) {
  doc.addPage();
  addRunningHeader(doc, `Closing Worksheets — ${year}`, 'Balance Sheet');
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('BALANCE SHEET', PAGE_WIDTH / 2, 22, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text(`As of _________________, ${year}`, PAGE_WIDTH / 2, 28, { align: 'center' });
  
  const startY = 40;
  const colWidth = (PAGE_WIDTH - 40) / 2;
  const leftStart = 20;
  const rightStart = leftStart + colWidth + 10;
  const lineHeight = 7;
  
  // Left column - Assets
  let y = startY;
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('ASSETS', leftStart + colWidth / 2, y, { align: 'center' });
  y += 8;
  
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  doc.line(leftStart, y, leftStart + colWidth, y);
  y += 5;
  
  const assets = [
    'Cash on Hand',
    'Persons (We Sell To) — Receivables',
    'Bills Receivable',
    'Merchandise Inventory',
    'Other Assets: _______________',
    'Other Assets: _______________',
  ];
  
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  setColor(doc, INK, 'text');
  
  for (const asset of assets) {
    doc.text(asset, leftStart + 3, y);
    doc.text('$_____________', leftStart + colWidth - 3, y, { align: 'right' });
    y += lineHeight;
  }
  
  y += 3;
  doc.setLineWidth(0.3);
  doc.line(leftStart + colWidth - 50, y, leftStart + colWidth, y);
  y += 5;
  doc.setFont('times', 'bold');
  doc.text('TOTAL ASSETS', leftStart + 3, y);
  doc.text('$_____________', leftStart + colWidth - 3, y, { align: 'right' });
  
  // Right column - Liabilities & Capital
  y = startY;
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('LIABILITIES & CAPITAL', rightStart + colWidth / 2, y, { align: 'center' });
  y += 8;
  
  doc.setLineWidth(0.3);
  doc.line(rightStart, y, rightStart + colWidth, y);
  y += 5;
  
  doc.setFontSize(10);
  doc.text('LIABILITIES:', rightStart + 3, y);
  y += lineHeight;
  
  const liabilities = [
    'Persons (We Buy From) — Payables',
    'Bills Payable',
    'Other Liabilities: _______________',
  ];
  
  doc.setFont('times', 'normal');
  for (const liab of liabilities) {
    doc.text('    ' + liab, rightStart + 3, y);
    doc.text('$_____________', rightStart + colWidth - 3, y, { align: 'right' });
    y += lineHeight;
  }
  
  y += 3;
  doc.setFont('times', 'bold');
  doc.text('Total Liabilities', rightStart + 3, y);
  doc.text('$_____________', rightStart + colWidth - 3, y, { align: 'right' });
  y += lineHeight + 5;
  
  doc.text('CAPITAL:', rightStart + 3, y);
  y += lineHeight;
  
  doc.setFont('times', 'normal');
  doc.text('    Capital, Beginning of Period', rightStart + 3, y);
  doc.text('$_____________', rightStart + colWidth - 3, y, { align: 'right' });
  y += lineHeight;
  doc.text('    Add: Net Profit (or Less: Net Loss)', rightStart + 3, y);
  doc.text('$_____________', rightStart + colWidth - 3, y, { align: 'right' });
  y += lineHeight;
  doc.text('    Less: Withdrawals', rightStart + 3, y);
  doc.text('$_____________', rightStart + colWidth - 3, y, { align: 'right' });
  y += lineHeight;
  
  doc.setLineWidth(0.3);
  doc.line(rightStart + colWidth - 50, y, rightStart + colWidth, y);
  y += 5;
  doc.setFont('times', 'bold');
  doc.text('Total Capital', rightStart + 3, y);
  doc.text('$_____________', rightStart + colWidth - 3, y, { align: 'right' });
  y += lineHeight + 5;
  
  doc.setLineWidth(0.4);
  doc.line(rightStart + colWidth - 50, y, rightStart + colWidth, y);
  y += 5;
  doc.text('TOTAL LIABILITIES & CAPITAL', rightStart + 3, y);
  doc.text('$_____________', rightStart + colWidth - 3, y, { align: 'right' });
  
  addPageNumber(doc, pageNum);
}

// ============================================================================
// HELPER: DRAW AUXILIARY TABLE
// ============================================================================

function drawAuxiliaryTable(doc: jsPDF, columns: ColDef[], startY: number, headerHeight: number, rowHeight: number, pageNum: number) {
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
  const startX = MARGIN_LEFT + (USABLE_WIDTH - totalWidth) / 2;
  
  // Draw headers
  let x = startX;
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  
  for (const col of columns) {
    setColor(doc, HEADER_LIGHT, 'fill');
    doc.rect(x, startY, col.width, headerHeight, 'F');
    setColor(doc, SEPIA, 'draw');
    doc.rect(x, startY, col.width, headerHeight);
    
    setColor(doc, INK, 'text');
    doc.setFont('times', 'bold');
    doc.setFontSize(7);
    
    const lines = col.name.split('\n');
    if (lines.length > 1) {
      doc.text(lines[0], x + col.width / 2, startY + 3.5, { align: 'center' });
      doc.text(lines[1], x + col.width / 2, startY + 7, { align: 'center' });
    } else {
      doc.text(col.name, x + col.width / 2, startY + 5.5, { align: 'center' });
    }
    x += col.width;
  }
  
  // Calculate available rows
  const dataStartY = startY + headerHeight;
  const totalsRowHeight = 7;
  const availableHeight = PAGE_HEIGHT - dataStartY - MARGIN_BOTTOM - totalsRowHeight - 5;
  const numRows = Math.floor(availableHeight / rowHeight);
  
  // Draw rows
  setColor(doc, LINES, 'draw');
  doc.setLineWidth(0.1);
  
  for (let row = 0; row <= numRows; row++) {
    const y = dataStartY + row * rowHeight;
    doc.line(startX, y, startX + totalWidth, y);
  }
  
  // Vertical lines
  x = startX;
  const dataEndY = dataStartY + numRows * rowHeight;
  doc.setLineWidth(0.15);
  for (const col of columns) {
    doc.line(x, dataStartY, x, dataEndY);
    x += col.width;
  }
  doc.line(x, dataStartY, x, dataEndY);
  
  // Totals row
  setColor(doc, HEADER_LIGHT, 'fill');
  doc.rect(startX, dataEndY, totalWidth, totalsRowHeight, 'F');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  doc.rect(startX, dataEndY, totalWidth, totalsRowHeight);
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(7);
  doc.text('PAGE TOTAL', startX + columns[0].width + columns[1].width / 2, dataEndY + 4.5, { align: 'center' });
  
  // Vertical lines in totals
  x = startX;
  for (const col of columns) {
    doc.line(x, dataEndY, x, dataEndY + totalsRowHeight);
    x += col.width;
  }
  doc.line(x, dataEndY, x, dataEndY + totalsRowHeight);
  
  addPageNumber(doc, pageNum);
}

// ============================================================================
// YEAR DIVIDER PAGE
// ============================================================================

function addYearDividerPage(doc: jsPDF, year: number) {
  doc.addPage();
  
  const centerX = PAGE_WIDTH / 2;
  const centerY = PAGE_HEIGHT / 2;
  
  // Decorative border
  drawDecorativeBorder(doc, 30, 30, PAGE_WIDTH - 60, PAGE_HEIGHT - 60);
  
  // Year
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(72);
  doc.text(year.toString(), centerX, centerY - 10, { align: 'center' });
  
  // Underline
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(1);
  doc.line(centerX - 50, centerY + 5, centerX + 50, centerY + 5);
  doc.setLineWidth(0.3);
  doc.line(centerX - 40, centerY + 8, centerX + 40, centerY + 8);
  
  // Subtitle
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  setColor(doc, INK, 'text');
  doc.text('Synoptic Ledger & Auxiliary Books', centerX, centerY + 25, { align: 'center' });
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export function generatePrintableLedger(startYear: number, numYears: number = 1): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
  });

  const endYear = startYear + numYears - 1;
  const yearRange = numYears > 1 ? `${startYear}-${endYear}` : startYear.toString();

  doc.setDocumentProperties({
    title: `Baker's Synoptic Ledger - ${yearRange}`,
    author: "Baker's Labor-Saving System",
    subject: 'Double-Entry Accounting Ledger',
    creator: 'Synoptic Ledger Application',
  });

  let pageNum = 1;

  // Page 1: Title Page (use startYear for display, but show range if multi-year)
  addTitlePageMultiYear(doc, startYear, numYears);
  
  // Page 2: Table of Contents
  addTableOfContentsMultiYear(doc, startYear, numYears);
  
  // Page 3: Instructions
  addInstructionsPage(doc);
  pageNum = 3;
  
  // Page 4: Quick Reference
  addQuickReferencePage(doc);
  pageNum = 4;

  // Generate pages for each year
  for (let yearOffset = 0; yearOffset < numYears; yearOffset++) {
    const year = startYear + yearOffset;
    
    // Add year divider page if multi-year book
    if (numYears > 1) {
      addYearDividerPage(doc, year);
      pageNum++;
    }

    // Monthly Synoptic Ledger Pages (2 per month)
    for (let m = 0; m < 12; m++) {
      for (let p = 0; p < 2; p++) {
        pageNum++;
        addSynopticLedgerPage(doc, MONTHS[m], year, pageNum, `${p + 1} of 2`);
      }
    }

    // Purchase Day-Book
    pageNum++;
    addPurchaseDayBook(doc, year, pageNum, false);
    pageNum++;
    addPurchaseDayBook(doc, year, pageNum, true);

    // Sales Day-Book
    pageNum++;
    addSalesDayBook(doc, year, pageNum, false);
    pageNum++;
    addSalesDayBook(doc, year, pageNum, true);

    // Bills Receivable
    pageNum++;
    addBillsReceivable(doc, year, pageNum, false);
    pageNum++;
    addBillsReceivable(doc, year, pageNum, true);

    // Bills Payable
    pageNum++;
    addBillsPayable(doc, year, pageNum, false);
    pageNum++;
    addBillsPayable(doc, year, pageNum, true);

    // Payroll (4 pages per year)
    for (let i = 0; i < 4; i++) {
      pageNum++;
      addPayrollPage(doc, year, pageNum);
    }

    // Closing Worksheets
    pageNum++;
    addTrialBalanceSheet(doc, year, pageNum);
    pageNum++;
    addProfitLossStatement(doc, year, pageNum);
    pageNum++;
    addBalanceSheet(doc, year, pageNum);
  }

  // Save the PDF
  const filename = numYears > 1 
    ? `Bakers_Synoptic_Ledger_${startYear}-${endYear}.pdf`
    : `Bakers_Synoptic_Ledger_${startYear}.pdf`;
  doc.save(filename);
}

// ============================================================================
// MULTI-YEAR TITLE PAGE
// ============================================================================

function addTitlePageMultiYear(doc: jsPDF, startYear: number, numYears: number) {
  const endYear = startYear + numYears - 1;
  
  // Decorative border
  drawDecorativeBorder(doc, 15, 12, PAGE_WIDTH - 30, PAGE_HEIGHT - 24);
  
  // Ornamental top flourish
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.5);
  const centerX = PAGE_WIDTH / 2;
  doc.line(centerX - 60, 30, centerX + 60, 30);
  doc.line(centerX - 50, 32, centerX + 50, 32);
  doc.line(centerX - 40, 34, centerX + 40, 34);

  // Main title
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text("BAKER'S PATENT", centerX, 48, { align: 'center' });
  
  doc.setFontSize(28);
  doc.text('LABOR-SAVING', centerX, 62, { align: 'center' });
  
  doc.setFontSize(36);
  doc.text('SYNOPTIC', centerX, 80, { align: 'center' });
  
  doc.setFontSize(20);
  doc.text('BOOK-KEEPING SYSTEM', centerX, 93, { align: 'center' });

  // Decorative line under title
  doc.setLineWidth(1);
  doc.line(50, 100, PAGE_WIDTH - 50, 100);
  doc.setLineWidth(0.3);
  doc.line(60, 103, PAGE_WIDTH - 60, 103);

  // Subtitle
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text('A Combined Day-Book, Journal, Cash-Book, and Ledger', centerX, 115, { align: 'center' });
  doc.text('Balanced Daily on a Single Page Without Re-Writing', centerX, 123, { align: 'center' });

  // Year(s) in decorative frame
  doc.setLineWidth(0.5);
  const yearBoxY = 132;
  const yearBoxWidth = numYears > 1 ? 100 : 70;
  doc.rect(centerX - yearBoxWidth/2, yearBoxY, yearBoxWidth, 28);
  doc.rect(centerX - yearBoxWidth/2 + 2, yearBoxY + 2, yearBoxWidth - 4, 24);
  
  doc.setFont('times', 'bold');
  if (numYears > 1) {
    doc.setFontSize(28);
    doc.text(`${startYear}–${endYear}`, centerX, yearBoxY + 18, { align: 'center' });
  } else {
    doc.setFontSize(32);
    doc.text(startYear.toString(), centerX, yearBoxY + 19, { align: 'center' });
  }

  // The Universal Rule box
  const ruleY = 168;
  setColor(doc, PAPER, 'fill');
  doc.rect(35, ruleY - 5, PAGE_WIDTH - 70, 32, 'F');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.4);
  doc.rect(35, ruleY - 5, PAGE_WIDTH - 70, 32);
  
  setColor(doc, RED_INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('THE UNIVERSAL RULE OF DOUBLE-ENTRY:', centerX, ruleY + 4, { align: 'center' });
  
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(13);
  doc.text('"Credit that which FURNISHES the value,', centerX, ruleY + 14, { align: 'center' });
  doc.text('Debit that which RECEIVES the value."', centerX, ruleY + 22, { align: 'center' });

  // Footer
  setColor(doc, INK, 'text');
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text('Based on the system at issue in Baker v. Selden, 101 U.S. 99 (1879)', centerX, PAGE_HEIGHT - 20, { align: 'center' });
  doc.setFont('times', 'italic');
  doc.setFontSize(7);
  doc.text('"The art of book-keeping cannot be the subject of copyright..."', centerX, PAGE_HEIGHT - 15, { align: 'center' });
}

// ============================================================================
// MULTI-YEAR TABLE OF CONTENTS
// ============================================================================

function addTableOfContentsMultiYear(doc: jsPDF, startYear: number, numYears: number) {
  doc.addPage();
  
  const centerX = PAGE_WIDTH / 2;
  setColor(doc, INK, 'text');
  
  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text('TABLE OF CONTENTS', centerX, 20, { align: 'center' });
  
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.5);
  doc.line(80, 24, PAGE_WIDTH - 80, 24);
  
  let y = 35;
  const leftCol = 40;
  const rightCol = PAGE_WIDTH - 40;
  
  // Front matter
  const frontMatter = [
    { title: 'Instructions for Use', page: '3' },
    { title: 'Quick Reference Guide', page: '4' },
  ];
  
  doc.setFontSize(9);
  for (const item of frontMatter) {
    doc.setFont('times', 'normal');
    doc.text(item.title, leftCol, y);
    const titleWidth = doc.getTextWidth(item.title);
    const pageWidth = doc.getTextWidth(item.page);
    let dotX = leftCol + titleWidth + 2;
    const dotsEnd = rightCol - pageWidth - 2;
    while (dotX < dotsEnd) {
      doc.text('.', dotX, y);
      dotX += 2;
    }
    doc.text(item.page, rightCol, y, { align: 'right' });
    y += 5;
  }
  
  y += 5;
  
  // Calculate page numbers
  let currentPage = 4; // After instructions and quick ref
  
  for (let yearOffset = 0; yearOffset < numYears; yearOffset++) {
    const year = startYear + yearOffset;
    
    // Year header
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    setColor(doc, SEPIA, 'text');
    doc.text(`━━━ ${year} ━━━`, centerX, y, { align: 'center' });
    y += 6;
    
    setColor(doc, INK, 'text');
    doc.setFontSize(9);
    
    if (numYears > 1) {
      currentPage++; // Year divider page
    }
    
    const yearSections = [
      { title: '    Synoptic Ledger (January–June)', pages: 12 },
      { title: '    Synoptic Ledger (July–December)', pages: 12 },
      { title: '    Purchase Day-Book', pages: 2 },
      { title: '    Sales Day-Book', pages: 2 },
      { title: '    Bills Receivable Register', pages: 2 },
      { title: '    Bills Payable Register', pages: 2 },
      { title: '    Time-Book & Pay-Roll', pages: 4 },
      { title: '    Trial Balance', pages: 1 },
      { title: '    Profit & Loss Statement', pages: 1 },
      { title: '    Balance Sheet', pages: 1 },
    ];
    
    for (const section of yearSections) {
      doc.setFont('times', 'normal');
      const startPage = currentPage + 1;
      const endPage = currentPage + section.pages;
      const pageStr = section.pages === 1 ? `${startPage}` : `${startPage}–${endPage}`;
      
      doc.text(section.title, leftCol, y);
      const titleWidth = doc.getTextWidth(section.title);
      const pageWidth = doc.getTextWidth(pageStr);
      let dotX = leftCol + titleWidth + 2;
      const dotsEnd = rightCol - pageWidth - 2;
      while (dotX < dotsEnd) {
        doc.text('.', dotX, y);
        dotX += 2;
      }
      doc.text(pageStr, rightCol, y, { align: 'right' });
      
      currentPage += section.pages;
      y += 4.5;
    }
    
    y += 4;
    
    // Check if we need a new page
    if (y > PAGE_HEIGHT - 30 && yearOffset < numYears - 1) {
      doc.addPage();
      y = 25;
    }
  }
  
  addPageNumber(doc, 2);
}

export function generateQuickLedger(year: number, months: number = 1): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
  });

  let pageNum = 0;
  
  // Just the synoptic ledger pages for specified months
  for (let m = 0; m < months && m < 12; m++) {
    for (let p = 0; p < 2; p++) {
      pageNum++;
      if (pageNum > 1) {
        doc.addPage();
      }
      // Need to handle first page differently since addPage is called inside
      if (pageNum === 1) {
        // First page - draw directly
        addRunningHeader(doc, `${MONTHS[m]} ${year}`, `Synoptic Ledger — ${p + 1} of 2`);
        // The rest will be drawn by the function call below after we fix it
      }
      addSynopticLedgerPage(doc, MONTHS[m], year, pageNum, `${p + 1} of 2`);
    }
  }

  doc.save(`Synoptic_Ledger_${year}_${months}mo.pdf`);
}
