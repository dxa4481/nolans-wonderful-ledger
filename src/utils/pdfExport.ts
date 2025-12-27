import { jsPDF } from 'jspdf';

// Page dimensions (Letter size in landscape for ledger)
const PAGE_WIDTH = 279.4; // 11 inches in mm
const PAGE_HEIGHT = 215.9; // 8.5 inches in mm
const MARGIN = 12;
const ROW_HEIGHT = 6;
const FOOTER_HEIGHT = 10;

// Column widths for the Synoptic ledger
const COLUMNS = {
  date: 18,
  description: 35,
  folio: 10,
  amount: 13, // Each Dr/Cr column
};

interface ColumnDef {
  name: string;
  subCols: string[];
  width: number;
}

const LEDGER_COLUMNS: ColumnDef[] = [
  { name: 'CASH', subCols: ['Dr.', 'Cr.'], width: COLUMNS.amount * 2 },
  { name: 'PERSONS\n(We Sell To)', subCols: ['Dr.', 'Cr.'], width: COLUMNS.amount * 2 },
  { name: 'PERSONS\n(We Buy From)', subCols: ['Dr.', 'Cr.'], width: COLUMNS.amount * 2 },
  { name: 'MERCHANDISE', subCols: ['Dr.', 'Cr.'], width: COLUMNS.amount * 2 },
  { name: 'EXPENSE', subCols: ['Dr.'], width: COLUMNS.amount },
  { name: 'BILLS\nRECEIVABLE', subCols: ['Dr.', 'Cr.'], width: COLUMNS.amount * 2 },
  { name: 'BILLS\nPAYABLE', subCols: ['Dr.', 'Cr.'], width: COLUMNS.amount * 2 },
  { name: 'INTEREST/\nDISCOUNT', subCols: ['Dr.', 'Cr.'], width: COLUMNS.amount * 2 },
  { name: 'SUNDRIES', subCols: ['Dr.', 'Cr.'], width: COLUMNS.amount * 2 },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function drawLine(doc: jsPDF, x1: number, y1: number, x2: number, y2: number, width = 0.2) {
  doc.setLineWidth(width);
  doc.line(x1, y1, x2, y2);
}

function drawRect(doc: jsPDF, x: number, y: number, w: number, h: number, fill = false) {
  if (fill) {
    doc.rect(x, y, w, h, 'F');
  } else {
    doc.rect(x, y, w, h, 'S');
  }
}

function addTitlePage(doc: jsPDF, year: number) {
  // Decorative border
  doc.setDrawColor(139, 115, 85); // Sepia color
  doc.setLineWidth(2);
  drawRect(doc, 20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40);
  doc.setLineWidth(0.5);
  drawRect(doc, 23, 23, PAGE_WIDTH - 46, PAGE_HEIGHT - 46);

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(26, 26, 46);
  doc.text("BAKER'S", PAGE_WIDTH / 2, 55, { align: 'center' });
  
  doc.setFontSize(20);
  doc.text('LABOR-SAVING', PAGE_WIDTH / 2, 68, { align: 'center' });
  
  doc.setFontSize(32);
  doc.text('SYNOPTIC SYSTEM', PAGE_WIDTH / 2, 85, { align: 'center' });

  // Decorative line
  doc.setLineWidth(1);
  drawLine(doc, 60, 92, PAGE_WIDTH - 60, 92);
  doc.setLineWidth(0.3);
  drawLine(doc, 70, 95, PAGE_WIDTH - 70, 95);

  // Subtitle
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.text('A Combined Day-Book, Journal, Cash-Book, and Ledger', PAGE_WIDTH / 2, 108, { align: 'center' });
  doc.text('On One Page — Without Re-Writing', PAGE_WIDTH / 2, 116, { align: 'center' });

  // Year
  doc.setFont('times', 'bold');
  doc.setFontSize(48);
  doc.text(year.toString(), PAGE_WIDTH / 2, 145, { align: 'center' });

  // The Universal Rule
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  const ruleY = 165;
  doc.setFillColor(244, 240, 230);
  drawRect(doc, 40, ruleY - 8, PAGE_WIDTH - 80, 28, true);
  doc.setDrawColor(139, 115, 85);
  drawRect(doc, 40, ruleY - 8, PAGE_WIDTH - 80, 28);
  
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('THE UNIVERSAL RULE:', PAGE_WIDTH / 2, ruleY, { align: 'center' });
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text('"Credit that which FURNISHES the value,', PAGE_WIDTH / 2, ruleY + 8, { align: 'center' });
  doc.text('and Debit that which RECEIVES the value."', PAGE_WIDTH / 2, ruleY + 15, { align: 'center' });

  // Footer
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('Based on the system described in Baker v. Selden (101 U.S. 99, 1879)', PAGE_WIDTH / 2, PAGE_HEIGHT - 35, { align: 'center' });
}

function addInstructionsPage(doc: jsPDF) {
  doc.addPage();
  
  const leftMargin = 25;
  let y = 25;

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 46);
  doc.text('INSTRUCTIONS FOR USE', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 12;
  doc.setLineWidth(0.5);
  drawLine(doc, 60, y, PAGE_WIDTH - 60, y);
  
  y += 10;
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  
  const instructions = [
    ['I. THE PRINCIPLE OF DOUBLE-ENTRY', [
      'Every transaction affects at least two accounts. One account receives value (DEBIT),',
      'another furnishes value (CREDIT). The sum of Debits must always equal Credits.',
    ]],
    ['II. HOW TO RECORD TRANSACTIONS', [
      '• Cash received: Debit CASH, Credit the source account',
      '• Cash paid: Credit CASH, Debit the receiving account',
      '• Sales on account: Debit PERSONS (We Sell To), Credit MERCHANDISE',
      '• Purchases on account: Debit MERCHANDISE, Credit PERSONS (We Buy From)',
      '• Notes received: Debit BILLS RECEIVABLE, Credit the source',
      '• Notes paid: Credit BILLS PAYABLE, Debit the destination',
    ]],
    ['III. DAILY PROCEDURE', [
      '1. Enter each transaction on its own line with the date and description.',
      '2. Place amounts in the appropriate Dr. or Cr. columns.',
      '3. Verify each row balances (total Dr. = total Cr.) before proceeding.',
      '4. At day\'s end, sum all columns and verify page balance.',
      '5. The Cash Dr. minus Cash Cr. should equal cash on hand.',
    ]],
    ['IV. THE LEDGER FOLIO (L.F.) COLUMN', [
      'Use this column to reference the account number or page in your',
      'subsidiary ledgers for detailed tracking of individual accounts.',
    ]],
    ['V. CLOSING THE BOOKS', [
      '• At period end, take physical inventory and compare to Merchandise balance.',
      '• Close Expense and Interest accounts to Profit & Loss.',
      '• Closing entries are traditionally made in RED INK.',
      '• Distribute net profit or loss to Capital accounts.',
    ]],
    ['VI. THE COLUMNS EXPLAINED', [
      '• CASH: All money received (Dr.) and paid out (Cr.)',
      '• PERSONS (We Sell To): Accounts Receivable - customers who owe us',
      '• PERSONS (We Buy From): Accounts Payable - vendors we owe',
      '• MERCHANDISE: Goods bought (Dr.) and sold (Cr.)',
      '• EXPENSE: Operating costs (Dr. only)',
      '• BILLS RECEIVABLE: Promissory notes we hold',
      '• BILLS PAYABLE: Promissory notes we\'ve issued',
      '• INTEREST/DISCOUNT: Interest earned (Cr.) or paid (Dr.)',
      '• SUNDRIES: Miscellaneous accounts, Capital, Profit & Loss',
    ]],
  ];

  for (const [title, lines] of instructions) {
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(title as string, leftMargin, y);
    y += 6;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    for (const line of lines as string[]) {
      doc.text(line, leftMargin + 5, y);
      y += 5;
    }
    y += 4;
    
    if (y > PAGE_HEIGHT - 30) {
      doc.addPage();
      y = 25;
    }
  }
}

function drawLedgerHeader(doc: jsPDF, month: string, year: number, pageNum: number) {
  const y = MARGIN;
  
  // Month/Year title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 46);
  doc.text(`${month} ${year}`, MARGIN, y + 5);
  
  // Page number
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(`Page ${pageNum}`, PAGE_WIDTH - MARGIN, y + 5, { align: 'right' });

  // Draw header boxes
  let x = MARGIN;
  const headerY = y + 8;
  const headerHeight1 = 8;
  const headerHeight2 = 6;
  
  doc.setDrawColor(139, 115, 85);
  doc.setFillColor(212, 197, 169);
  doc.setLineWidth(0.3);

  // Date column header
  drawRect(doc, x, headerY, COLUMNS.date, headerHeight1 + headerHeight2, true);
  drawRect(doc, x, headerY, COLUMNS.date, headerHeight1 + headerHeight2);
  doc.setFont('times', 'bold');
  doc.setFontSize(7);
  doc.text('DATE', x + COLUMNS.date / 2, headerY + 9, { align: 'center' });
  x += COLUMNS.date;

  // Description column header
  drawRect(doc, x, headerY, COLUMNS.description, headerHeight1 + headerHeight2, true);
  drawRect(doc, x, headerY, COLUMNS.description, headerHeight1 + headerHeight2);
  doc.text('DESCRIPTION', x + COLUMNS.description / 2, headerY + 9, { align: 'center' });
  x += COLUMNS.description;

  // L.F. column header
  drawRect(doc, x, headerY, COLUMNS.folio, headerHeight1 + headerHeight2, true);
  drawRect(doc, x, headerY, COLUMNS.folio, headerHeight1 + headerHeight2);
  doc.text('L.F.', x + COLUMNS.folio / 2, headerY + 9, { align: 'center' });
  x += COLUMNS.folio;

  // Amount columns
  doc.setFontSize(6);
  for (const col of LEDGER_COLUMNS) {
    // Main header
    doc.setFillColor(201, 184, 150);
    drawRect(doc, x, headerY, col.width, headerHeight1, true);
    drawRect(doc, x, headerY, col.width, headerHeight1);
    
    // Split name if it has newline
    const nameParts = col.name.split('\n');
    if (nameParts.length > 1) {
      doc.text(nameParts[0], x + col.width / 2, headerY + 3, { align: 'center' });
      doc.text(nameParts[1], x + col.width / 2, headerY + 6, { align: 'center' });
    } else {
      doc.text(col.name, x + col.width / 2, headerY + 5, { align: 'center' });
    }

    // Sub-headers (Dr./Cr.)
    doc.setFillColor(212, 197, 169);
    const subWidth = col.width / col.subCols.length;
    for (let i = 0; i < col.subCols.length; i++) {
      const subX = x + i * subWidth;
      drawRect(doc, subX, headerY + headerHeight1, subWidth, headerHeight2, true);
      drawRect(doc, subX, headerY + headerHeight1, subWidth, headerHeight2);
      doc.setFontSize(5);
      doc.text(col.subCols[i], subX + subWidth / 2, headerY + headerHeight1 + 4, { align: 'center' });
    }
    x += col.width;
  }

  return headerY + headerHeight1 + headerHeight2;
}

function drawLedgerRows(doc: jsPDF, startY: number, numRows: number) {
  const endY = PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT;
  let y = startY;
  let x = MARGIN;
  
  doc.setDrawColor(196, 184, 158);
  doc.setLineWidth(0.15);

  // Calculate total width
  let totalWidth = COLUMNS.date + COLUMNS.description + COLUMNS.folio;
  for (const col of LEDGER_COLUMNS) {
    totalWidth += col.width;
  }

  // Draw horizontal lines for rows
  let rowCount = 0;
  while (y + ROW_HEIGHT <= endY && rowCount < numRows) {
    y += ROW_HEIGHT;
    drawLine(doc, MARGIN, y, MARGIN + totalWidth, y);
    rowCount++;
  }

  // Draw vertical lines
  x = MARGIN;
  const rowsEndY = startY + (rowCount * ROW_HEIGHT);
  
  // Left border
  doc.setLineWidth(0.3);
  drawLine(doc, x, startY, x, rowsEndY);
  
  // Date column
  x += COLUMNS.date;
  drawLine(doc, x, startY, x, rowsEndY);
  
  // Description column
  x += COLUMNS.description;
  drawLine(doc, x, startY, x, rowsEndY);
  
  // L.F. column
  x += COLUMNS.folio;
  drawLine(doc, x, startY, x, rowsEndY);

  // Amount columns with sub-dividers
  doc.setLineWidth(0.15);
  for (const col of LEDGER_COLUMNS) {
    // Main column divider (heavier)
    doc.setLineWidth(0.3);
    drawLine(doc, x, startY, x, rowsEndY);
    
    // Sub-column dividers (lighter)
    if (col.subCols.length > 1) {
      doc.setLineWidth(0.1);
      const subWidth = col.width / col.subCols.length;
      for (let i = 1; i < col.subCols.length; i++) {
        drawLine(doc, x + i * subWidth, startY, x + i * subWidth, rowsEndY);
      }
    }
    x += col.width;
  }

  // Right border
  doc.setLineWidth(0.3);
  drawLine(doc, x, startY, x, rowsEndY);

  // Bottom border (heavier for totals)
  doc.setLineWidth(0.5);
  drawLine(doc, MARGIN, rowsEndY, MARGIN + totalWidth, rowsEndY);

  return rowsEndY;
}

function drawTotalsRow(doc: jsPDF, y: number) {
  let x = MARGIN;
  const totalWidth = COLUMNS.date + COLUMNS.description + COLUMNS.folio + 
    LEDGER_COLUMNS.reduce((sum, col) => sum + col.width, 0);
  
  doc.setFillColor(212, 197, 169);
  drawRect(doc, MARGIN, y, totalWidth, ROW_HEIGHT + 2, true);
  
  doc.setFont('times', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(26, 26, 46);
  doc.text('PAGE TOTALS:', MARGIN + COLUMNS.date + COLUMNS.description - 2, y + 5, { align: 'right' });

  // Draw column dividers in totals row
  doc.setDrawColor(139, 115, 85);
  doc.setLineWidth(0.2);
  x = MARGIN + COLUMNS.date + COLUMNS.description + COLUMNS.folio;
  
  for (const col of LEDGER_COLUMNS) {
    drawLine(doc, x, y, x, y + ROW_HEIGHT + 2);
    if (col.subCols.length > 1) {
      const subWidth = col.width / col.subCols.length;
      for (let i = 1; i < col.subCols.length; i++) {
        drawLine(doc, x + i * subWidth, y, x + i * subWidth, y + ROW_HEIGHT + 2);
      }
    }
    x += col.width;
  }
  
  // Bottom border
  doc.setLineWidth(0.5);
  drawLine(doc, MARGIN, y + ROW_HEIGHT + 2, MARGIN + totalWidth, y + ROW_HEIGHT + 2);

  return y + ROW_HEIGHT + 2;
}

function drawCashProofRow(doc: jsPDF, y: number) {
  doc.setFont('times', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(26, 26, 46);
  doc.text('Cash on Hand (Dr. - Cr.): ________________', MARGIN, y + 5);
  
  doc.text('Balance Forward: ________________', PAGE_WIDTH - MARGIN - 50, y + 5);
}

function addLedgerPage(doc: jsPDF, month: string, year: number, pageNum: number) {
  if (pageNum > 1) {
    doc.addPage();
  }
  
  const headerEndY = drawLedgerHeader(doc, month, year, pageNum);
  const rowsEndY = drawLedgerRows(doc, headerEndY, 25);
  const totalsEndY = drawTotalsRow(doc, rowsEndY);
  drawCashProofRow(doc, totalsEndY);
}

function addBillsPage(doc: jsPDF, title: string, year: number, pageNum: number) {
  doc.addPage();
  
  const y = MARGIN;
  
  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 46);
  doc.text(title, PAGE_WIDTH / 2, y + 5, { align: 'center' });
  doc.text(year.toString(), PAGE_WIDTH / 2, y + 12, { align: 'center' });
  
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(`Page ${pageNum}`, PAGE_WIDTH - MARGIN, y + 5, { align: 'right' });

  // Draw header
  const headerY = y + 18;
  const cols = [
    { name: 'DATE', width: 20 },
    { name: title.includes('RECEIVABLE') ? 'FROM WHOM' : 'TO WHOM', width: 45 },
    { name: 'DESCRIPTION', width: 50 },
    { name: 'AMOUNT', width: 25 },
    { name: 'TIME\nTO RUN', width: 18 },
    { name: 'DUE DATE', width: 22 },
    { name: 'DATE PAID', width: 22 },
    { name: 'REMARKS', width: 45 },
  ];

  let x = MARGIN;
  doc.setFillColor(212, 197, 169);
  doc.setDrawColor(139, 115, 85);
  doc.setLineWidth(0.3);
  doc.setFont('times', 'bold');
  doc.setFontSize(7);

  for (const col of cols) {
    drawRect(doc, x, headerY, col.width, 10, true);
    drawRect(doc, x, headerY, col.width, 10);
    const nameParts = col.name.split('\n');
    if (nameParts.length > 1) {
      doc.text(nameParts[0], x + col.width / 2, headerY + 3.5, { align: 'center' });
      doc.text(nameParts[1], x + col.width / 2, headerY + 7, { align: 'center' });
    } else {
      doc.text(col.name, x + col.width / 2, headerY + 6, { align: 'center' });
    }
    x += col.width;
  }

  // Draw rows
  const totalWidth = cols.reduce((sum, col) => sum + col.width, 0);
  let rowY = headerY + 10;
  const endY = PAGE_HEIGHT - MARGIN - 10;

  doc.setLineWidth(0.15);
  doc.setDrawColor(196, 184, 158);

  while (rowY + ROW_HEIGHT <= endY) {
    rowY += ROW_HEIGHT;
    drawLine(doc, MARGIN, rowY, MARGIN + totalWidth, rowY);
  }

  // Vertical lines
  x = MARGIN;
  doc.setLineWidth(0.2);
  for (const col of cols) {
    drawLine(doc, x, headerY + 10, x, rowY);
    x += col.width;
  }
  drawLine(doc, x, headerY + 10, x, rowY);
}

function addPayrollPage(doc: jsPDF, year: number, pageNum: number) {
  doc.addPage();
  
  const y = MARGIN;
  
  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 46);
  doc.text('TIME-BOOK & PAY-ROLL', PAGE_WIDTH / 2, y + 5, { align: 'center' });
  doc.text(year.toString(), PAGE_WIDTH / 2, y + 12, { align: 'center' });
  
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(`Page ${pageNum}`, PAGE_WIDTH - MARGIN, y + 5, { align: 'right' });

  // Period line
  doc.setFontSize(10);
  doc.text('Pay Period: _____________ to _____________', MARGIN, y + 20);

  // Draw header
  const headerY = y + 25;
  const cols = [
    { name: 'NO.', width: 10 },
    { name: 'EMPLOYEE NAME', width: 55 },
    { name: 'POSITION', width: 40 },
    { name: 'DAYS\nWORKED', width: 18 },
    { name: 'RATE\n($/DAY)', width: 18 },
    { name: 'TOTAL\nEARNED', width: 22 },
    { name: 'DEDUCTIONS', width: 25 },
    { name: 'NET PAY', width: 22 },
    { name: 'SIGNATURE', width: 40 },
  ];

  let x = MARGIN;
  doc.setFillColor(212, 197, 169);
  doc.setDrawColor(139, 115, 85);
  doc.setLineWidth(0.3);
  doc.setFont('times', 'bold');
  doc.setFontSize(7);

  for (const col of cols) {
    drawRect(doc, x, headerY, col.width, 10, true);
    drawRect(doc, x, headerY, col.width, 10);
    const nameParts = col.name.split('\n');
    if (nameParts.length > 1) {
      doc.text(nameParts[0], x + col.width / 2, headerY + 3.5, { align: 'center' });
      doc.text(nameParts[1], x + col.width / 2, headerY + 7, { align: 'center' });
    } else {
      doc.text(col.name, x + col.width / 2, headerY + 6, { align: 'center' });
    }
    x += col.width;
  }

  // Draw rows
  const totalWidth = cols.reduce((sum, col) => sum + col.width, 0);
  let rowY = headerY + 10;
  const endY = PAGE_HEIGHT - MARGIN - 20;

  doc.setLineWidth(0.15);
  doc.setDrawColor(196, 184, 158);

  let rowNum = 1;
  while (rowY + ROW_HEIGHT <= endY) {
    rowY += ROW_HEIGHT;
    drawLine(doc, MARGIN, rowY, MARGIN + totalWidth, rowY);
    // Add row number
    doc.setFont('times', 'normal');
    doc.setFontSize(6);
    doc.text(rowNum.toString(), MARGIN + 5, rowY - 1.5, { align: 'center' });
    rowNum++;
  }

  // Vertical lines
  x = MARGIN;
  doc.setLineWidth(0.2);
  for (const col of cols) {
    drawLine(doc, x, headerY + 10, x, rowY);
    x += col.width;
  }
  drawLine(doc, x, headerY + 10, x, rowY);

  // Totals row
  doc.setFillColor(212, 197, 169);
  drawRect(doc, MARGIN, rowY, totalWidth, ROW_HEIGHT + 2, true);
  doc.setFont('times', 'bold');
  doc.setFontSize(7);
  doc.text('TOTALS:', MARGIN + cols[0].width + cols[1].width + cols[2].width - 2, rowY + 5, { align: 'right' });
}

export function generatePrintableLedger(year: number): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
  });

  doc.setDocumentProperties({
    title: `Baker's Synoptic Ledger - ${year}`,
    author: 'Baker\'s Labor-Saving System',
    subject: 'Double-Entry Accounting Ledger',
    creator: 'Synoptic Ledger App',
  });

  let pageNum = 1;

  // Title Page
  addTitlePage(doc, year);

  // Instructions Page
  addInstructionsPage(doc);

  // Monthly Ledger Pages (2 pages per month = 24 pages)
  for (const month of MONTHS) {
    for (let i = 0; i < 2; i++) {
      doc.addPage();
      addLedgerPage(doc, month, year, pageNum);
      pageNum++;
    }
  }

  // Bills Receivable pages (2 pages)
  addBillsPage(doc, 'BILLS RECEIVABLE', year, pageNum++);
  addBillsPage(doc, 'BILLS RECEIVABLE (Continued)', year, pageNum++);

  // Bills Payable pages (2 pages)
  addBillsPage(doc, 'BILLS PAYABLE', year, pageNum++);
  addBillsPage(doc, 'BILLS PAYABLE (Continued)', year, pageNum++);

  // Payroll pages (4 pages)
  for (let i = 0; i < 4; i++) {
    addPayrollPage(doc, year, pageNum++);
  }

  // Save the PDF
  doc.save(`Bakers_Synoptic_Ledger_${year}.pdf`);
}

export function generateQuickLedger(year: number, months: number = 1): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
  });

  let pageNum = 1;
  
  // Just the ledger pages for specified months
  for (let m = 0; m < months && m < 12; m++) {
    for (let i = 0; i < 2; i++) {
      if (pageNum > 1) {
        doc.addPage();
      }
      addLedgerPage(doc, MONTHS[m], year, pageNum);
      pageNum++;
    }
  }

  doc.save(`Synoptic_Ledger_${year}_${months}mo.pdf`);
}
