import { jsPDF } from 'jspdf';

// ============================================================================
// AMAZON KDP 6x9 BOOK FORMAT
// ============================================================================
// Trim size: 6" x 9" (152.4mm x 228.6mm)
// Safe margins for KDP:
//   - Inside (gutter): 0.5" (12.7mm) minimum, we use 0.625" (15.875mm) for binding
//   - Outside: 0.5" (12.7mm)
//   - Top: 0.5" (12.7mm)  
//   - Bottom: 0.625" (15.875mm) for page numbers

const PAGE_WIDTH = 152.4;  // 6 inches in mm
const PAGE_HEIGHT = 228.6; // 9 inches in mm

// Margins
const MARGIN_INSIDE = 16;   // Gutter margin (binding side)
const MARGIN_OUTSIDE = 13;  // Outside edge
const MARGIN_TOP = 13;
const MARGIN_BOTTOM = 16;   // Extra space for page numbers

// Calculated usable dimensions (for reference)
// const USABLE_WIDTH = PAGE_WIDTH - MARGIN_INSIDE - MARGIN_OUTSIDE; // ~123mm
// const USABLE_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;   // ~199mm

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Colors (muted for print)
const SEPIA = { r: 100, g: 80, b: 60 };
const HEADER_BG = { r: 230, g: 225, b: 215 };
const LIGHT_BG = { r: 245, g: 242, b: 235 };
const LINES = { r: 180, g: 170, b: 155 };
const INK = { r: 30, g: 30, b: 40 };
const RED_INK = { r: 140, g: 20, b: 20 };

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function setColor(doc: jsPDF, color: { r: number; g: number; b: number }, type: 'draw' | 'fill' | 'text') {
  if (type === 'draw') doc.setDrawColor(color.r, color.g, color.b);
  else if (type === 'fill') doc.setFillColor(color.r, color.g, color.b);
  else doc.setTextColor(color.r, color.g, color.b);
}

function getMarginLeft(pageNum: number): number {
  // For book binding: odd pages have gutter on left, even on right
  return pageNum % 2 === 1 ? MARGIN_INSIDE : MARGIN_OUTSIDE;
}

function getMarginRight(pageNum: number): number {
  return pageNum % 2 === 1 ? MARGIN_OUTSIDE : MARGIN_INSIDE;
}

function addPageNumber(doc: jsPDF, pageNum: number) {
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  setColor(doc, INK, 'text');
  doc.text(pageNum.toString(), PAGE_WIDTH / 2, PAGE_HEIGHT - 8, { align: 'center' });
}

function addRunningHeader(doc: jsPDF, text: string, pageNum: number) {
  const marginL = getMarginLeft(pageNum);
  const marginR = getMarginRight(pageNum);
  
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  setColor(doc, INK, 'text');
  
  if (pageNum % 2 === 0) {
    // Even page: header on left
    doc.text(text, marginL, MARGIN_TOP - 4);
  } else {
    // Odd page: header on right
    doc.text(text, PAGE_WIDTH - marginR, MARGIN_TOP - 4, { align: 'right' });
  }
  
  setColor(doc, LINES, 'draw');
  doc.setLineWidth(0.2);
  doc.line(marginL, MARGIN_TOP - 2, PAGE_WIDTH - marginR, MARGIN_TOP - 2);
}

function drawDecorativeBorder(doc: jsPDF, x: number, y: number, w: number, h: number) {
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(1);
  doc.rect(x, y, w, h);
  doc.setLineWidth(0.3);
  doc.rect(x + 2, y + 2, w - 4, h - 4);
}

// ============================================================================
// BLANK PAGES (for proper book pagination)
// ============================================================================

function addBlankPage(doc: jsPDF) {
  doc.addPage();
  // Intentionally blank
}

// ============================================================================
// TITLE PAGE (Page 1 - Right side, no page number)
// ============================================================================

function addTitlePage(doc: jsPDF, startYear: number, numYears: number) {
  const endYear = startYear + numYears - 1;
  const centerX = PAGE_WIDTH / 2;
  
  // Decorative border
  drawDecorativeBorder(doc, 15, 20, PAGE_WIDTH - 30, PAGE_HEIGHT - 40);
  
  // Ornamental line
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.5);
  doc.line(40, 45, PAGE_WIDTH - 40, 45);
  
  // Main title
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text("BAKER'S PATENT", centerX, 58, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text('LABOR-SAVING', centerX, 70, { align: 'center' });
  
  doc.setFontSize(24);
  doc.text('SYNOPTIC', centerX, 85, { align: 'center' });
  
  doc.setFontSize(13);
  doc.text('BOOK-KEEPING SYSTEM', centerX, 97, { align: 'center' });

  // Decorative line
  doc.setLineWidth(0.8);
  doc.line(35, 105, PAGE_WIDTH - 35, 105);
  doc.setLineWidth(0.2);
  doc.line(45, 108, PAGE_WIDTH - 45, 108);

  // Subtitle
  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.text('A Combined Day-Book, Journal,', centerX, 120, { align: 'center' });
  doc.text('Cash-Book, and Ledger', centerX, 127, { align: 'center' });
  doc.text('Balanced Daily Without Re-Writing', centerX, 137, { align: 'center' });

  // Year box
  const yearBoxY = 150;
  doc.setLineWidth(0.4);
  setColor(doc, SEPIA, 'draw');
  doc.rect(centerX - 30, yearBoxY, 60, 22);
  doc.rect(centerX - 28, yearBoxY + 2, 56, 18);
  
  doc.setFont('times', 'bold');
  setColor(doc, INK, 'text');
  if (numYears > 1) {
    doc.setFontSize(16);
    doc.text(`${startYear}–${endYear}`, centerX, yearBoxY + 14, { align: 'center' });
  } else {
    doc.setFontSize(20);
    doc.text(startYear.toString(), centerX, yearBoxY + 15, { align: 'center' });
  }

  // The Universal Rule
  const ruleY = 182;
  setColor(doc, LIGHT_BG, 'fill');
  doc.rect(25, ruleY, PAGE_WIDTH - 50, 28, 'F');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  doc.rect(25, ruleY, PAGE_WIDTH - 50, 28);
  
  setColor(doc, RED_INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.text('THE UNIVERSAL RULE:', centerX, ruleY + 8, { align: 'center' });
  
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(9);
  doc.text('"Credit that which FURNISHES the value,', centerX, ruleY + 17, { align: 'center' });
  doc.text('Debit that which RECEIVES the value."', centerX, ruleY + 24, { align: 'center' });

  // Footer
  setColor(doc, INK, 'text');
  doc.setFont('times', 'normal');
  doc.setFontSize(6);
  doc.text('Based on the system at issue in', centerX, PAGE_HEIGHT - 28, { align: 'center' });
  doc.text('Baker v. Selden, 101 U.S. 99 (1879)', centerX, PAGE_HEIGHT - 23, { align: 'center' });
}

// ============================================================================
// COPYRIGHT PAGE (Page 2 - Left side, verso of title)
// ============================================================================

function addCopyrightPage(doc: jsPDF, startYear: number, numYears: number) {
  doc.addPage();
  
  const marginL = getMarginLeft(2);
  const endYear = startYear + numYears - 1;
  const yearRange = numYears > 1 ? `${startYear}–${endYear}` : startYear.toString();
  
  let y = PAGE_HEIGHT - 80;
  
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  setColor(doc, INK, 'text');
  
  doc.text(`Baker's Labor-Saving Synoptic System`, marginL, y);
  y += 5;
  doc.text(`Ledger for ${yearRange}`, marginL, y);
  y += 10;
  
  doc.setFont('times', 'italic');
  doc.setFontSize(7);
  doc.text('This ledger format is based on the accounting system', marginL, y);
  y += 4;
  doc.text('described in Baker v. Selden, 101 U.S. 99 (1879).', marginL, y);
  y += 8;
  
  doc.text('The Supreme Court held that while the specific ruled', marginL, y);
  y += 4;
  doc.text('forms may be subject to copyright, the accounting art', marginL, y);
  y += 4;
  doc.text('itself cannot be monopolized.', marginL, y);
  y += 10;
  
  doc.setFont('times', 'normal');
  doc.text('Printed for personal and educational use.', marginL, y);
}

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================

function addTableOfContents(doc: jsPDF, startYear: number, numYears: number, pageNum: number): number {
  doc.addPage();
  
  const marginL = getMarginLeft(pageNum);
  const marginR = getMarginRight(pageNum);
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('CONTENTS', PAGE_WIDTH / 2, MARGIN_TOP + 10, { align: 'center' });
  
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.4);
  doc.line(marginL + 20, MARGIN_TOP + 14, PAGE_WIDTH - marginR - 20, MARGIN_TOP + 14);
  
  let y = MARGIN_TOP + 28;
  
  // Calculate actual page numbers
  let currentPage = 5; // After front matter
  
  const addTocEntry = (title: string, page: string, indent: number = 0, bold: boolean = false) => {
    doc.setFont('times', bold ? 'bold' : 'normal');
    doc.setFontSize(9);
    
    const textX = marginL + indent;
    doc.text(title, textX, y);
    
    if (page) {
      doc.text(page, PAGE_WIDTH - marginR, y, { align: 'right' });
      
      // Dots
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.getTextWidth(page);
      let dotX = textX + titleWidth + 3;
      const dotsEnd = PAGE_WIDTH - marginR - pageWidth - 3;
      doc.setFontSize(8);
      while (dotX < dotsEnd) {
        doc.text('.', dotX, y);
        dotX += 1.5;
      }
    }
    y += 5;
  };
  
  addTocEntry('How to Use This Ledger', '5', 0);
  addTocEntry('Quick Reference Chart', '6', 0);
  y += 3;
  
  currentPage = 7;
  
  for (let yearOffset = 0; yearOffset < numYears; yearOffset++) {
    const year = startYear + yearOffset;
    
    if (numYears > 1) {
      setColor(doc, SEPIA, 'text');
      addTocEntry(`— ${year} —`, '', 0, true);
      setColor(doc, INK, 'text');
      currentPage++; // year divider
    }
    
    addTocEntry('Synoptic Ledger', `${currentPage}–${currentPage + 23}`, 5);
    currentPage += 24;
    
    addTocEntry('Purchase Day-Book', `${currentPage}–${currentPage + 1}`, 5);
    currentPage += 2;
    
    addTocEntry('Sales Day-Book', `${currentPage}–${currentPage + 1}`, 5);
    currentPage += 2;
    
    addTocEntry('Bills Receivable', `${currentPage}–${currentPage + 1}`, 5);
    currentPage += 2;
    
    addTocEntry('Bills Payable', `${currentPage}–${currentPage + 1}`, 5);
    currentPage += 2;
    
    addTocEntry('Time-Book & Payroll', `${currentPage}–${currentPage + 3}`, 5);
    currentPage += 4;
    
    addTocEntry('Closing Worksheets', `${currentPage}–${currentPage + 2}`, 5);
    currentPage += 3;
    
    y += 3;
    
    if (y > PAGE_HEIGHT - MARGIN_BOTTOM - 20 && yearOffset < numYears - 1) {
      addPageNumber(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = MARGIN_TOP + 10;
    }
  }
  
  addPageNumber(doc, pageNum);
  return pageNum;
}

// ============================================================================
// INSTRUCTIONS PAGE
// ============================================================================

function addInstructionsPages(doc: jsPDF, pageNum: number): number {
  doc.addPage();
  addRunningHeader(doc, 'How to Use This Ledger', pageNum);
  
  const marginL = getMarginLeft(pageNum);
  let y = MARGIN_TOP + 8;
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('HOW TO USE THIS LEDGER', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 10;
  
  const sections = [
    {
      title: 'THE SYNOPTIC PRINCIPLE',
      lines: [
        'This system combines Day-Book, Journal,',
        'Cash-Book, and Ledger into ONE record.',
        'Each transaction is entered once and',
        'immediately classified into accounts.',
      ]
    },
    {
      title: 'THE UNIVERSAL RULE',
      lines: [
        'Credit what FURNISHES value;',
        'Debit what RECEIVES value.',
        '',
        'Cash sale: Dr. Cash, Cr. Merchandise',
        'Purchase on account: Dr. Merchandise,',
        '    Cr. Persons (We Buy From)',
      ]
    },
    {
      title: 'DAILY PROCEDURE',
      lines: [
        '1. Enter date and description',
        '2. Place amounts in proper columns',
        '3. Each row must balance: Dr. = Cr.',
        '4. Sum columns at page bottom',
        '5. Verify: Total Dr. = Total Cr.',
      ]
    },
    {
      title: 'THE COLUMNS',
      lines: [
        'CASH — Money in and out',
        'PERSONS (Sell To) — Receivables',
        'PERSONS (Buy From) — Payables',
        'MERCHANDISE — Goods traded',
        'EXPENSE — Operating costs',
        'BILLS REC. — Notes we hold',
        'BILLS PAY. — Notes we owe',
        'INTEREST — Interest earned/paid',
        'SUNDRIES — Capital, P&L, misc.',
      ]
    },
  ];
  
  doc.setFontSize(9);
  for (const section of sections) {
    doc.setFont('times', 'bold');
    doc.text(section.title, marginL, y);
    y += 5;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    for (const line of section.lines) {
      if (line === '') {
        y += 2;
        continue;
      }
      doc.text(line, marginL + 3, y);
      y += 4;
    }
    y += 4;
    doc.setFontSize(9);
  }
  
  addPageNumber(doc, pageNum);
  return pageNum;
}

// ============================================================================
// QUICK REFERENCE PAGE
// ============================================================================

function addQuickReferencePage(doc: jsPDF, pageNum: number): number {
  doc.addPage();
  addRunningHeader(doc, 'Quick Reference', pageNum);
  
  const marginL = getMarginLeft(pageNum);
  const marginR = getMarginRight(pageNum);
  let y = MARGIN_TOP + 8;
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('QUICK REFERENCE', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 8;
  
  // Transaction reference
  const transactions = [
    ['Cash sale', 'Cash', 'Merchandise'],
    ['Cash purchase', 'Merchandise', 'Cash'],
    ['Sale on account', 'Persons (Sell)', 'Merchandise'],
    ['Purchase on acct.', 'Merchandise', 'Persons (Buy)'],
    ['Collect receivable', 'Cash', 'Persons (Sell)'],
    ['Pay vendor', 'Persons (Buy)', 'Cash'],
    ['Pay expense', 'Expense', 'Cash'],
    ['Receive note', 'Bills Rec.', 'Persons (Sell)'],
    ['Pay note', 'Bills Pay.', 'Cash'],
    ['Interest received', 'Cash', 'Interest'],
    ['Interest paid', 'Interest', 'Cash'],
    ['Owner invest', 'Cash', 'Sundries'],
    ['Owner withdraw', 'Sundries', 'Cash'],
  ];
  
  // Header
  const col1 = marginL;
  const col2 = marginL + 42;
  const col3 = marginL + 75;
  
  setColor(doc, HEADER_BG, 'fill');
  doc.rect(marginL, y, PAGE_WIDTH - marginL - marginR, 5, 'F');
  
  doc.setFont('times', 'bold');
  doc.setFontSize(7);
  setColor(doc, INK, 'text');
  doc.text('Transaction', col1 + 1, y + 3.5);
  doc.text('Debit', col2 + 1, y + 3.5);
  doc.text('Credit', col3 + 1, y + 3.5);
  
  y += 5;
  
  doc.setFont('times', 'normal');
  doc.setFontSize(7);
  
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (i % 2 === 0) {
      setColor(doc, LIGHT_BG, 'fill');
      doc.rect(marginL, y, PAGE_WIDTH - marginL - marginR, 4.5, 'F');
    }
    setColor(doc, INK, 'text');
    doc.text(t[0], col1 + 1, y + 3.2);
    doc.text(t[1], col2 + 1, y + 3.2);
    doc.text(t[2], col3 + 1, y + 3.2);
    y += 4.5;
  }
  
  // Closing entries
  y += 6;
  setColor(doc, RED_INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.text('CLOSING (Red Ink)', marginL, y);
  
  y += 5;
  doc.setFont('times', 'normal');
  doc.setFontSize(7);
  setColor(doc, INK, 'text');
  
  const closings = [
    '• Close Expense to P&L',
    '• Close Interest to P&L',
    '• Adjust Inventory',
    '• Close P&L to Capital',
  ];
  
  for (const c of closings) {
    doc.text(c, marginL + 2, y);
    y += 4;
  }
  
  addPageNumber(doc, pageNum);
  return pageNum;
}

// ============================================================================
// YEAR DIVIDER PAGE
// ============================================================================

function addYearDivider(doc: jsPDF, year: number, pageNum: number): number {
  doc.addPage();
  
  const centerX = PAGE_WIDTH / 2;
  const centerY = PAGE_HEIGHT / 2;
  
  drawDecorativeBorder(doc, 25, 50, PAGE_WIDTH - 50, PAGE_HEIGHT - 100);
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(48);
  doc.text(year.toString(), centerX, centerY - 5, { align: 'center' });
  
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.8);
  doc.line(centerX - 35, centerY + 8, centerX + 35, centerY + 8);
  
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  setColor(doc, INK, 'text');
  doc.text('Synoptic Ledger', centerX, centerY + 22, { align: 'center' });
  
  addPageNumber(doc, pageNum);
  return pageNum;
}

// ============================================================================
// SYNOPTIC LEDGER - TWO-PAGE SPREAD
// The ledger spans across LEFT page (even) and RIGHT page (odd)
// Left page: Date, Description, L.F., Cash, Persons columns
// Right page: Merchandise, Expense, Bills, Interest, Sundries, Totals
// ============================================================================

interface LedgerCol {
  name: string;
  subCols?: string[];
  width: number;
}

function addSynopticSpread(doc: jsPDF, month: string, year: number, pageNum: number, spreadNum: number): number {
  // LEFT PAGE (even number)
  doc.addPage();
  const leftPageNum = pageNum;
  addRunningHeader(doc, `${month} ${year}`, leftPageNum);
  
  const leftMarginL = getMarginLeft(leftPageNum);
  const leftMarginR = getMarginRight(leftPageNum);
  
  // Left page columns
  const leftCols: LedgerCol[] = [
    { name: 'DATE', width: 12 },
    { name: 'DESCRIPTION', width: 35 },
    { name: 'L.F.', width: 8 },
    { name: 'CASH', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'PERSONS\n(Sell To)', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'PERSONS\n(Buy From)', subCols: ['Dr.', 'Cr.'], width: 22 },
  ];
  
  drawLedgerPage(doc, leftCols, leftMarginL, leftMarginR, leftPageNum, true, spreadNum);
  addPageNumber(doc, leftPageNum);
  
  // RIGHT PAGE (odd number)
  doc.addPage();
  const rightPageNum = pageNum + 1;
  addRunningHeader(doc, `${month} ${year}`, rightPageNum);
  
  const rightMarginL = getMarginLeft(rightPageNum);
  const rightMarginR = getMarginRight(rightPageNum);
  
  // Right page columns
  const rightCols: LedgerCol[] = [
    { name: 'MERCHAN-\nDISE', subCols: ['Dr.', 'Cr.'], width: 20 },
    { name: 'EXP.', subCols: ['Dr.'], width: 12 },
    { name: 'BILLS\nREC.', subCols: ['Dr.', 'Cr.'], width: 18 },
    { name: 'BILLS\nPAY.', subCols: ['Dr.', 'Cr.'], width: 18 },
    { name: 'INT. &\nDISC.', subCols: ['Dr.', 'Cr.'], width: 18 },
    { name: 'SUNDRIES', subCols: ['Dr.', 'Cr.'], width: 22 },
    { name: 'ROW\nTOTAL', subCols: ['Dr.', 'Cr.'], width: 16 },
  ];
  
  drawLedgerPage(doc, rightCols, rightMarginL, rightMarginR, rightPageNum, false, spreadNum);
  addPageNumber(doc, rightPageNum);
  
  return rightPageNum;
}

function drawLedgerPage(
  doc: jsPDF, 
  columns: LedgerCol[], 
  marginL: number, 
  _marginR: number, 
  _pageNum: number,
  isLeftPage: boolean,
  spreadNum: number
) {
  const startY = MARGIN_TOP + 5;
  const headerHeight = 10;
  const subHeaderHeight = 5;
  const rowHeight = 5;
  
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
  const startX = marginL;
  
  // Draw header row
  let x = startX;
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.2);
  
  for (const col of columns) {
    const hasSubCols = col.subCols && col.subCols.length > 0;
    
    // Main header cell
    setColor(doc, HEADER_BG, 'fill');
    doc.rect(x, startY, col.width, hasSubCols ? headerHeight - subHeaderHeight : headerHeight, 'F');
    setColor(doc, SEPIA, 'draw');
    doc.rect(x, startY, col.width, hasSubCols ? headerHeight - subHeaderHeight : headerHeight);
    
    // Header text
    setColor(doc, INK, 'text');
    doc.setFont('times', 'bold');
    doc.setFontSize(5.5);
    
    const lines = col.name.split('\n');
    if (lines.length > 1 && hasSubCols) {
      doc.text(lines[0], x + col.width / 2, startY + 2.2, { align: 'center' });
      doc.text(lines[1], x + col.width / 2, startY + 4.5, { align: 'center' });
    } else if (lines.length > 1) {
      doc.text(lines[0], x + col.width / 2, startY + 3.5, { align: 'center' });
      doc.text(lines[1], x + col.width / 2, startY + 6.5, { align: 'center' });
    } else {
      const textY = hasSubCols ? startY + 3 : startY + 5.5;
      doc.text(col.name, x + col.width / 2, textY, { align: 'center' });
    }
    
    // Sub-headers
    if (hasSubCols && col.subCols) {
      const subWidth = col.width / col.subCols.length;
      for (let i = 0; i < col.subCols.length; i++) {
        const subX = x + i * subWidth;
        setColor(doc, LIGHT_BG, 'fill');
        doc.rect(subX, startY + headerHeight - subHeaderHeight, subWidth, subHeaderHeight, 'F');
        setColor(doc, SEPIA, 'draw');
        doc.rect(subX, startY + headerHeight - subHeaderHeight, subWidth, subHeaderHeight);
        
        setColor(doc, INK, 'text');
        doc.setFontSize(5);
        doc.text(col.subCols[i], subX + subWidth / 2, startY + headerHeight - 1.5, { align: 'center' });
      }
    }
    
    x += col.width;
  }
  
  // Calculate rows
  const dataStartY = startY + headerHeight;
  const totalsHeight = 6;
  const footerSpace = isLeftPage ? 8 : 12; // Extra space on right for cash proof
  const availableHeight = PAGE_HEIGHT - dataStartY - MARGIN_BOTTOM - totalsHeight - footerSpace;
  const numRows = Math.floor(availableHeight / rowHeight);
  
  // Draw data rows
  setColor(doc, LINES, 'draw');
  doc.setLineWidth(0.1);
  
  for (let row = 0; row <= numRows; row++) {
    const y = dataStartY + row * rowHeight;
    doc.line(startX, y, startX + totalWidth, y);
  }
  
  // Vertical lines
  x = startX;
  const dataEndY = dataStartY + numRows * rowHeight;
  
  for (const col of columns) {
    doc.setLineWidth(0.15);
    doc.line(x, dataStartY, x, dataEndY);
    
    // Sub-column dividers
    if (col.subCols && col.subCols.length > 1) {
      doc.setLineWidth(0.05);
      const subWidth = col.width / col.subCols.length;
      for (let i = 1; i < col.subCols.length; i++) {
        doc.line(x + i * subWidth, dataStartY, x + i * subWidth, dataEndY);
      }
    }
    x += col.width;
  }
  doc.setLineWidth(0.15);
  doc.line(x, dataStartY, x, dataEndY);
  
  // Totals row
  const totalsY = dataEndY;
  setColor(doc, HEADER_BG, 'fill');
  doc.rect(startX, totalsY, totalWidth, totalsHeight, 'F');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  doc.rect(startX, totalsY, totalWidth, totalsHeight);
  
  // Totals label
  if (isLeftPage) {
    setColor(doc, INK, 'text');
    doc.setFont('times', 'bold');
    doc.setFontSize(6);
    doc.text('TOTALS', startX + columns[0].width + columns[1].width / 2, totalsY + 4, { align: 'center' });
  }
  
  // Vertical lines in totals
  x = startX;
  doc.setLineWidth(0.15);
  for (const col of columns) {
    doc.line(x, totalsY, x, totalsY + totalsHeight);
    if (col.subCols && col.subCols.length > 1) {
      const subWidth = col.width / col.subCols.length;
      for (let i = 1; i < col.subCols.length; i++) {
        doc.line(x + i * subWidth, totalsY, x + i * subWidth, totalsY + totalsHeight);
      }
    }
    x += col.width;
  }
  doc.line(x, totalsY, x, totalsY + totalsHeight);
  
  // Footer notes
  const footerY = totalsY + totalsHeight + 3;
  doc.setFont('times', 'italic');
  doc.setFontSize(6);
  setColor(doc, INK, 'text');
  
  if (isLeftPage) {
    doc.text(`Spread ${spreadNum} of 2`, startX, footerY);
  } else {
    doc.text('Cash on Hand: $________', startX, footerY);
    doc.text('Carried Forward: $________', startX + 50, footerY);
  }
}

// ============================================================================
// AUXILIARY BOOKS (Simplified for 6x9 format)
// ============================================================================

function addAuxiliaryBook(
  doc: jsPDF, 
  title: string, 
  subtitle: string,
  columns: { name: string; width: number }[],
  year: number,
  pageNum: number,
  numPages: number = 2
): number {
  for (let p = 0; p < numPages; p++) {
    doc.addPage();
    const currentPage = pageNum + p;
    addRunningHeader(doc, `${title} — ${year}`, currentPage);
    
    const marginL = getMarginLeft(currentPage);
    
    let y = MARGIN_TOP + 6;
    
    // Title
    setColor(doc, INK, 'text');
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text(title.toUpperCase(), PAGE_WIDTH / 2, y, { align: 'center' });
    
    if (p === 0 && subtitle) {
      y += 4;
      doc.setFont('times', 'italic');
      doc.setFontSize(6);
      doc.text(subtitle, PAGE_WIDTH / 2, y, { align: 'center' });
    }
    
    y += 6;
    
    // Draw table
    const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
    const startX = marginL;
    const headerHeight = 6;
    const rowHeight = 5;
    
    // Header
    let x = startX;
    setColor(doc, HEADER_BG, 'fill');
    setColor(doc, SEPIA, 'draw');
    doc.setLineWidth(0.2);
    
    for (const col of columns) {
      doc.rect(x, y, col.width, headerHeight, 'FD');
      setColor(doc, INK, 'text');
      doc.setFont('times', 'bold');
      doc.setFontSize(5.5);
      doc.text(col.name, x + col.width / 2, y + 4, { align: 'center' });
      x += col.width;
    }
    
    y += headerHeight;
    
    // Rows
    const availableHeight = PAGE_HEIGHT - y - MARGIN_BOTTOM - 10;
    const numRows = Math.floor(availableHeight / rowHeight);
    
    setColor(doc, LINES, 'draw');
    doc.setLineWidth(0.1);
    
    for (let row = 0; row <= numRows; row++) {
      doc.line(startX, y + row * rowHeight, startX + totalWidth, y + row * rowHeight);
    }
    
    // Vertical lines
    x = startX;
    doc.setLineWidth(0.12);
    for (const col of columns) {
      doc.line(x, y, x, y + numRows * rowHeight);
      x += col.width;
    }
    doc.line(x, y, x, y + numRows * rowHeight);
    
    // Totals row
    const totalsY = y + numRows * rowHeight;
    setColor(doc, HEADER_BG, 'fill');
    doc.rect(startX, totalsY, totalWidth, 5, 'F');
    setColor(doc, SEPIA, 'draw');
    doc.setLineWidth(0.2);
    doc.rect(startX, totalsY, totalWidth, 5);
    
    setColor(doc, INK, 'text');
    doc.setFont('times', 'bold');
    doc.setFontSize(5);
    doc.text('PAGE TOTAL', startX + 2, totalsY + 3.5);
    
    addPageNumber(doc, currentPage);
  }
  
  return pageNum + numPages - 1;
}

function addPurchaseBook(doc: jsPDF, year: number, pageNum: number): number {
  const cols = [
    { name: 'DATE', width: 14 },
    { name: 'VENDOR', width: 35 },
    { name: 'DESCRIPTION', width: 45 },
    { name: 'AMOUNT', width: 18 },
    { name: '✓', width: 8 },
  ];
  return addAuxiliaryBook(doc, 'Purchase Day-Book', 'Dr. Merchandise, Cr. Persons (Buy From)', cols, year, pageNum);
}

function addSalesBook(doc: jsPDF, year: number, pageNum: number): number {
  const cols = [
    { name: 'DATE', width: 14 },
    { name: 'CUSTOMER', width: 35 },
    { name: 'DESCRIPTION', width: 45 },
    { name: 'AMOUNT', width: 18 },
    { name: '✓', width: 8 },
  ];
  return addAuxiliaryBook(doc, 'Sales Day-Book', 'Dr. Persons (Sell To), Cr. Merchandise', cols, year, pageNum);
}

function addBillsReceivableBook(doc: jsPDF, year: number, pageNum: number): number {
  const cols = [
    { name: 'DATE', width: 12 },
    { name: 'FROM WHOM', width: 30 },
    { name: 'AMOUNT', width: 16 },
    { name: 'DUE', width: 14 },
    { name: 'PAID', width: 14 },
    { name: 'REMARKS', width: 28 },
  ];
  return addAuxiliaryBook(doc, 'Bills Receivable', 'Notes we hold for collection', cols, year, pageNum);
}

function addBillsPayableBook(doc: jsPDF, year: number, pageNum: number): number {
  const cols = [
    { name: 'DATE', width: 12 },
    { name: 'TO WHOM', width: 30 },
    { name: 'AMOUNT', width: 16 },
    { name: 'DUE', width: 14 },
    { name: 'PAID', width: 14 },
    { name: 'REMARKS', width: 28 },
  ];
  return addAuxiliaryBook(doc, 'Bills Payable', 'Notes we owe to others', cols, year, pageNum);
}

function addPayrollBook(doc: jsPDF, year: number, pageNum: number): number {
  const cols = [
    { name: '#', width: 6 },
    { name: 'NAME', width: 32 },
    { name: 'DAYS', width: 12 },
    { name: 'RATE', width: 14 },
    { name: 'GROSS', width: 16 },
    { name: 'NET', width: 16 },
    { name: 'SIGN', width: 20 },
  ];
  return addAuxiliaryBook(doc, 'Time-Book & Payroll', 'Dr. Merchandise (Labor), Cr. Cash', cols, year, pageNum, 4);
}

// ============================================================================
// CLOSING WORKSHEETS
// ============================================================================

function addTrialBalance(doc: jsPDF, year: number, pageNum: number): number {
  doc.addPage();
  addRunningHeader(doc, `Closing Worksheets — ${year}`, pageNum);
  
  const marginL = getMarginLeft(pageNum);
  let y = MARGIN_TOP + 8;
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('TRIAL BALANCE', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 5;
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text(`As of _____________, ${year}`, PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 8;
  
  // Header
  const cols = [
    { name: 'ACCOUNT', width: 60 },
    { name: 'DEBIT', width: 28 },
    { name: 'CREDIT', width: 28 },
  ];
  
  let x = marginL;
  setColor(doc, HEADER_BG, 'fill');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.2);
  
  for (const col of cols) {
    doc.rect(x, y, col.width, 6, 'FD');
    setColor(doc, INK, 'text');
    doc.setFont('times', 'bold');
    doc.setFontSize(7);
    doc.text(col.name, x + col.width / 2, y + 4, { align: 'center' });
    x += col.width;
  }
  
  y += 6;
  
  // Pre-printed accounts
  const accounts = [
    'Cash',
    'Persons (We Sell To)',
    'Persons (We Buy From)',
    'Merchandise',
    'Bills Receivable',
    'Bills Payable',
    'Expense',
    'Interest & Discount',
    'Sundries — Capital',
    'Sundries — Drawing',
    'Sundries — P&L',
    '', '', '', '', '',
  ];
  
  const totalWidth = cols.reduce((sum, c) => sum + c.width, 0);
  const rowHeight = 6;
  
  setColor(doc, LINES, 'draw');
  doc.setLineWidth(0.1);
  doc.setFont('times', 'normal');
  doc.setFontSize(7);
  
  for (const acct of accounts) {
    doc.line(marginL, y + rowHeight, marginL + totalWidth, y + rowHeight);
    if (acct) {
      setColor(doc, INK, 'text');
      doc.text(acct, marginL + 2, y + 4);
    }
    y += rowHeight;
  }
  
  // Vertical lines
  x = marginL;
  doc.setLineWidth(0.12);
  for (const col of cols) {
    doc.line(x, y - accounts.length * rowHeight, x, y);
    x += col.width;
  }
  doc.line(x, y - accounts.length * rowHeight, x, y);
  
  // Totals
  setColor(doc, HEADER_BG, 'fill');
  doc.rect(marginL, y, totalWidth, 6, 'F');
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.3);
  doc.rect(marginL, y, totalWidth, 6);
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(7);
  doc.text('TOTALS (Must Balance)', marginL + 2, y + 4);
  
  addPageNumber(doc, pageNum);
  return pageNum;
}

function addProfitLossStatement(doc: jsPDF, year: number, pageNum: number): number {
  doc.addPage();
  addRunningHeader(doc, `Closing Worksheets — ${year}`, pageNum);
  
  const marginL = getMarginLeft(pageNum);
  let y = MARGIN_TOP + 8;
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('PROFIT & LOSS', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 5;
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text(`For Period Ending _____________, ${year}`, PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 12;
  
  const items = [
    { label: 'Merchandise — Debits (Purchases)', line: true },
    { label: 'Less: Merchandise — Credits (Sales)', line: true },
    { label: 'Merchandise Balance', line: true, bold: true },
    { label: '', spacer: true },
    { label: 'Actual Inventory (Count)', line: true },
    { label: 'GROSS PROFIT (LOSS)', line: true, bold: true },
    { label: '', spacer: true },
    { label: 'Less: Expenses', line: true },
    { label: 'Less: Interest & Discount', line: true },
    { label: 'NET PROFIT (LOSS)', line: true, bold: true },
    { label: '', spacer: true },
    { label: 'Distribution:', bold: true },
    { label: '  Partner: _____________  %____', line: true },
    { label: '  Partner: _____________  %____', line: true },
  ];
  
  doc.setFontSize(8);
  
  for (const item of items) {
    if (item.spacer) {
      y += 4;
      continue;
    }
    
    doc.setFont('times', item.bold ? 'bold' : 'normal');
    doc.text(item.label, marginL, y);
    
    if (item.line) {
      doc.text('$____________', PAGE_WIDTH - getMarginRight(pageNum), y, { align: 'right' });
    }
    
    y += 6;
  }
  
  addPageNumber(doc, pageNum);
  return pageNum;
}

function addBalanceSheet(doc: jsPDF, year: number, pageNum: number): number {
  doc.addPage();
  addRunningHeader(doc, `Closing Worksheets — ${year}`, pageNum);
  
  const marginL = getMarginLeft(pageNum);
  const marginR = getMarginRight(pageNum);
  let y = MARGIN_TOP + 8;
  
  setColor(doc, INK, 'text');
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('BALANCE SHEET', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 5;
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text(`As of _____________, ${year}`, PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 10;
  
  // ASSETS
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('ASSETS', marginL, y);
  y += 5;
  
  const assets = ['Cash', 'Accounts Receivable', 'Bills Receivable', 'Merchandise Inventory', 'Other: ____________'];
  
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  for (const a of assets) {
    doc.text('  ' + a, marginL, y);
    doc.text('$_________', PAGE_WIDTH - marginR, y, { align: 'right' });
    y += 5;
  }
  
  y += 2;
  doc.setFont('times', 'bold');
  doc.text('TOTAL ASSETS', marginL, y);
  doc.text('$_________', PAGE_WIDTH - marginR, y, { align: 'right' });
  
  y += 10;
  
  // LIABILITIES
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('LIABILITIES', marginL, y);
  y += 5;
  
  const liabilities = ['Accounts Payable', 'Bills Payable', 'Other: ____________'];
  
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  for (const l of liabilities) {
    doc.text('  ' + l, marginL, y);
    doc.text('$_________', PAGE_WIDTH - marginR, y, { align: 'right' });
    y += 5;
  }
  
  y += 2;
  doc.setFont('times', 'bold');
  doc.text('Total Liabilities', marginL, y);
  doc.text('$_________', PAGE_WIDTH - marginR, y, { align: 'right' });
  
  y += 8;
  
  // CAPITAL
  doc.setFontSize(9);
  doc.text('CAPITAL', marginL, y);
  y += 5;
  
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text('  Beginning Capital', marginL, y);
  doc.text('$_________', PAGE_WIDTH - marginR, y, { align: 'right' });
  y += 5;
  doc.text('  Add: Net Profit (Less: Loss)', marginL, y);
  doc.text('$_________', PAGE_WIDTH - marginR, y, { align: 'right' });
  y += 5;
  doc.text('  Less: Withdrawals', marginL, y);
  doc.text('$_________', PAGE_WIDTH - marginR, y, { align: 'right' });
  y += 5;
  
  doc.setFont('times', 'bold');
  doc.text('Total Capital', marginL, y);
  doc.text('$_________', PAGE_WIDTH - marginR, y, { align: 'right' });
  
  y += 8;
  setColor(doc, SEPIA, 'draw');
  doc.setLineWidth(0.5);
  doc.line(marginL, y, PAGE_WIDTH - marginR, y);
  y += 4;
  
  doc.setFontSize(9);
  doc.text('TOTAL LIABILITIES & CAPITAL', marginL, y);
  doc.text('$_________', PAGE_WIDTH - marginR, y, { align: 'right' });
  
  addPageNumber(doc, pageNum);
  return pageNum;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export function generatePrintableLedger(startYear: number, numYears: number = 1): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT], // 6x9 inches
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

  // Page 1: Title Page (recto, no page number)
  addTitlePage(doc, startYear, numYears);
  
  // Page 2: Copyright (verso)
  addCopyrightPage(doc, startYear, numYears);
  pageNum = 2;
  
  // Page 3: Table of Contents (recto)
  pageNum++;
  pageNum = addTableOfContents(doc, startYear, numYears, pageNum);
  
  // Page 4: Blank if needed to make instructions start on recto
  if (pageNum % 2 === 1) {
    addBlankPage(doc);
    pageNum++;
  }
  
  // Page 5: Instructions (recto)
  pageNum++;
  pageNum = addInstructionsPages(doc, pageNum);
  
  // Page 6: Quick Reference
  pageNum++;
  pageNum = addQuickReferencePage(doc, pageNum);
  
  // Ensure we start years on recto
  if (pageNum % 2 === 0) {
    addBlankPage(doc);
    pageNum++;
  }

  // Generate each year
  for (let yearOffset = 0; yearOffset < numYears; yearOffset++) {
    const year = startYear + yearOffset;
    
    // Year divider page (if multi-year)
    if (numYears > 1) {
      pageNum++;
      pageNum = addYearDivider(doc, year, pageNum);
      
      // Ensure synoptic starts on even page (left side of spread)
      if (pageNum % 2 === 1) {
        addBlankPage(doc);
        pageNum++;
      }
    } else {
      // Single year: ensure we start on even page
      if (pageNum % 2 === 1) {
        addBlankPage(doc);
        pageNum++;
      }
    }

    // Monthly Synoptic Ledger Spreads (2 pages per month = 24 pages)
    for (let m = 0; m < 12; m++) {
      pageNum++;
      pageNum = addSynopticSpread(doc, MONTHS[m], year, pageNum, (m % 2) + 1);
    }

    // Auxiliary books
    pageNum++;
    pageNum = addPurchaseBook(doc, year, pageNum);
    
    pageNum++;
    pageNum = addSalesBook(doc, year, pageNum);
    
    pageNum++;
    pageNum = addBillsReceivableBook(doc, year, pageNum);
    
    pageNum++;
    pageNum = addBillsPayableBook(doc, year, pageNum);
    
    pageNum++;
    pageNum = addPayrollBook(doc, year, pageNum);

    // Closing worksheets
    pageNum++;
    pageNum = addTrialBalance(doc, year, pageNum);
    
    pageNum++;
    pageNum = addProfitLossStatement(doc, year, pageNum);
    
    pageNum++;
    pageNum = addBalanceSheet(doc, year, pageNum);
  }

  // Final page count should be even for proper book printing
  if (pageNum % 2 === 1) {
    addBlankPage(doc);
  }

  // Save the PDF
  const filename = numYears > 1 
    ? `Bakers_Synoptic_Ledger_${startYear}-${endYear}_6x9.pdf`
    : `Bakers_Synoptic_Ledger_${startYear}_6x9.pdf`;
  doc.save(filename);
}

export function generateQuickLedger(year: number, months: number = 1): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
  });

  let pageNum = 0;
  
  for (let m = 0; m < months && m < 12; m++) {
    pageNum++;
    if (pageNum % 2 === 1 && pageNum > 1) {
      // Ensure spreads start on even pages
      addBlankPage(doc);
      pageNum++;
    }
    pageNum = addSynopticSpread(doc, MONTHS[m], year, pageNum, (m % 2) + 1);
  }

  doc.save(`Synoptic_Ledger_${year}_${months}mo_6x9.pdf`);
}
