# Baker's Labor-Saving Synoptic System

A faithful digital recreation of 19th-century double-entry bookkeeping systems: **Baker's Synoptic Ledger** and **Selden's Condensed Ledger**. This web application implements the innovative columnar accounting methods that revolutionized business record-keeping during the Industrial Revolution.

![Ledger Icon](public/ledger.svg)

## Historical Significance

The rapid industrialization of 1860s America created unprecedented challenges for business record-keeping. Charles Baker's "Labor-Saving System" (patented 1859) represented a revolutionary attempt to modernize accounting by combining all books of original entry—Day-Book, Journal, Cash-Book, and Ledger—onto a single columnar sheet.

These very forms became the subject of the landmark Supreme Court case **Baker v. Selden** (101 U.S. 99, 1879), which established the crucial distinction between an *idea* (the accounting method) and its *expression* (the specific ruled forms)—a principle that remains foundational to intellectual property law today.

## Features

### Core System: The Synoptic Ledger
- Combined Day-Book, Journal, Cash-Book, and Ledger on one page
- Nested columnar headers with Dr./Cr. sub-columns:
  - Cash, Persons (We Sell To), Persons (We Buy From), Merchandise
  - Expense, Bills Receivable, Bills Payable, Interest/Discount, Sundries
- **Row Validation**: Every row must balance (Debits = Credits)
- **Page Balancing**: Automatic column totals with balance verification
- **Daily Cash Proof**: Dynamic calculation of Cash on Hand

### Secondary System: Selden's Condensed Ledger
- Government/Treasury mode for public accounting
- Distribution, Brought Forward, Aggregates, Totals, and Balances columns
- **Floating Orders Module**: Track outstanding warrants and treasury reconciliation

### Auxiliary Books
- **Time-Book & Pay-Roll**: Employee tracking with automatic Synoptic entry generation
- **Purchase & Sales Books**: Invoice recording with ledger integration
- **Bill Books**: Notes Receivable and Payable with due date tracking

### Closing Process
- Inventory adjustment for Gross Profit/Loss calculation
- Automatic closure of representative accounts (Expense, Interest)
- Partner/Capital distribution based on ownership percentages
- **Red Ink styling** for closing entries (per historical convention)

### Special Features
- **Banker's Option**: Preset column names for banking operations
- **19th-Century Styling**: High-density data layout mimicking original ledger plates
- Frozen Date/Description columns for horizontal scrolling
- Print-friendly layout

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for complex grid styling
- **Zustand** for state management
- **Vite** for fast development and building

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## The Universal Rule

At the heart of this system lies the elegant accounting principle:

> *"Credit that which furnishes the value, and Debit that which receives the value."*

Every transaction, no matter how complex, can be analyzed through this lens:
- Cash received → Debit Cash, Credit the source account
- Cash paid → Credit Cash, Debit the receiving account
- Sales on account → Debit Persons (We Sell To), Credit Merchandise
- Purchases on account → Debit Merchandise, Credit Persons (We Buy From)

## Usage Examples

### Recording a Cash Sale
1. Navigate to the Synoptic Ledger
2. Click "Add Entry"
3. Enter the date and description
4. Debit Cash column, Credit Merchandise column
5. The row should show balanced (green indicator)

### Processing Payroll
1. Navigate to Time-Book & Pay-Roll
2. Create a new pay period
3. Add employees with days worked and daily rate
4. Click "Process Pay Day" to automatically generate the Synoptic entry

### Closing the Books
1. Navigate to Closing Process
2. Enter actual inventory value from physical count
3. Add partners/proprietors with ownership percentages
4. Click "Perform Closing" to generate red ink entries

## Legal Context

This system is based on the accounting method described in *Baker v. Selden* (101 U.S. 99, 1879). The Supreme Court ruled:

> *"The art of book-keeping cannot be the subject of copyright, but the particular forms and ruled lines prepared for use in that art may be."*

This application faithfully recreates Baker's columnar structure as a historical educational tool.

## License

MIT License - See LICENSE file for details.

## Acknowledgments

- Charles Baker's original 1859 patent for the Labor-Saving System
- Joseph Selden's Condensed Ledger method for government accounting
- The U.S. Supreme Court case that shaped intellectual property law
