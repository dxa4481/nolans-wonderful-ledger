/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'ledger': ['Courier New', 'Courier', 'monospace'],
        'heading': ['Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        'ledger-paper': '#f5f0e6',
        'ledger-lines': '#c4b89e',
        'ledger-ink': '#1a1a2e',
        'ledger-red': '#8b0000',
        'ledger-green': '#006400',
        'ledger-header': '#d4c5a9',
      },
      boxShadow: {
        'ledger': 'inset 0 0 10px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
