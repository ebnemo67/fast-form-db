import React, { useState, useReducer, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  PiggyBank,
  HandCoins,
  Wallet,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Search,
  Plus,
  Filter,
  ChevronRight,
  ChevronDown,
  Calendar,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Receipt,
  CreditCard,
  History,
  FileBarChart,
  ShieldCheck,
  UserCircle
} from 'lucide-react';

// --- CONSTANTS & INITIAL DATA ---

const CDA_ACCOUNTS = [
  // ASSETS
  { code: '11100', name: 'Cash on Hand', class: 'Assets', type: 'Current' },
  { code: '11200', name: 'Cash in Bank', class: 'Assets', type: 'Current' },
  { code: '12100', name: 'Loans Receivable - Productive', class: 'Assets', type: 'Current' },
  { code: '12200', name: 'Loans Receivable - Providential', class: 'Assets', type: 'Current' },
  { code: '12900', name: 'Allowance for Probable Losses on Loans', class: 'Assets', type: 'Contra-Asset' },
  { code: '15000', name: 'Property, Plant and Equipment', class: 'Assets', type: 'Non-Current' },
  { code: '15900', name: 'Accumulated Depreciation', class: 'Assets', type: 'Contra-Asset' },

  // LIABILITIES
  { code: '21100', name: 'Savings Deposits', class: 'Liabilities', type: 'Current' },
  { code: '21200', name: 'Time Deposits', class: 'Liabilities', type: 'Current' },
  { code: '22100', name: 'Accounts Payable', class: 'Liabilities', type: 'Current' },
  { code: '23000', name: 'Interest on Share Capital Payable', class: 'Liabilities', type: 'Current' },
  { code: '24000', name: 'Patronage Refund Payable', class: 'Liabilities', type: 'Current' },

  // EQUITY
  { code: '31100', name: 'Paid-up Share Capital - Common', class: 'Equity', type: 'Capital' },
  { code: '31200', name: 'Paid-up Share Capital - Preferred', class: 'Equity', type: 'Capital' },
  { code: '32100', name: 'General Reserve Fund', class: 'Equity', type: 'Reserve' },
  { code: '32200', name: 'Education and Training Fund', class: 'Equity', type: 'Reserve' },
  { code: '32300', name: 'Community Development Fund', class: 'Equity', type: 'Reserve' },
  { code: '32400', name: 'Optional Fund', class: 'Equity', type: 'Reserve' },
  { code: '33000', name: 'Undivided Net Surplus', class: 'Equity', type: 'Surplus' },

  // REVENUE
  { code: '41100', name: 'Interest Income from Loans', class: 'Revenue', type: 'Operating' },
  { code: '41200', name: 'Service Fees', class: 'Revenue', type: 'Operating' },
  { code: '41300', name: 'Fines, Penalties, Surcharges', class: 'Revenue', type: 'Operating' },
  { code: '42000', name: 'Membership Fees', class: 'Revenue', type: 'Non-Operating' },

  // EXPENSES
  { code: '51100', name: 'Salaries and Wages', class: 'Expenses', type: 'Administrative' },
  { code: '51200', name: 'Interest Expense on Deposits', class: 'Expenses', type: 'Financial' },
  { code: '51300', name: 'Office Supplies', class: 'Expenses', type: 'Administrative' },
  { code: '51400', name: 'Travel and Transportation', class: 'Expenses', type: 'Administrative' },
  { code: '51500', name: 'Depreciation Expense', class: 'Expenses', type: 'Administrative' }
];

const ROLES = {
  MANAGER: 'Manager',
  TELLER: 'Teller',
  COLLECTOR: 'Collector',
  ACCOUNTANT: 'Accountant',
  MEMBER: 'Member'
};

const INITIAL_DOC_SERIES = [
  { id: 'OR', name: 'Official Receipt', prefix: 'OR-', next: 1001 },
  { id: 'JV', name: 'Journal Voucher', prefix: 'JV-', next: 2001 },
  { id: 'LN', name: 'Loan Release', prefix: 'LN-', next: 3001 },
  { id: 'TD', name: 'Time Deposit', prefix: 'TD-', next: 4001 },
  { id: 'CD', name: 'Cash Disbursement', prefix: 'CDV-', next: 5001 },
  { id: 'ME', name: 'Membership', prefix: 'MEM-', next: 6001 },
  { id: 'AJ', name: 'Adjusting Journal', prefix: 'AJV-', next: 7001 },
  { id: 'DM', name: 'Debit Memo', prefix: 'DM-', next: 8001 },
  { id: 'CM', name: 'Credit Memo', prefix: 'CM-', next: 9001 },
  { id: 'SV', name: 'Savings Voucher', prefix: 'SV-', next: 10001 },
];

const INITIAL_MEMBERS = [
  {
    id: 'M001',
    name: 'Juan Dela Cruz',
    username: 'juan',
    role: ROLES.MEMBER,
    status: 'Active',
    joinDate: '2023-01-15',
    creditScore: 85,
    address: '123 Sampaguita St, Manila',
    contact: '0917-123-4567',
    savingsBalance: 25000.00,
    shareCapital: 50000.00,
    loanBalance: 15000.00
  },
  {
    id: 'M002',
    name: 'Maria Clara',
    username: 'maria',
    role: ROLES.MEMBER,
    status: 'Active',
    joinDate: '2023-03-20',
    creditScore: 92,
    address: '456 Narra Ave, Quezon City',
    contact: '0918-987-6543',
    savingsBalance: 12000.00,
    shareCapital: 30000.00,
    loanBalance: 0.00
  }
];

// --- UTILS ---

const formatPHP = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
};

const generateDocNumber = (series, docSeries) => {
  const ds = docSeries.find(s => s.id === series);
  if (!ds) return '';
  return `${ds.prefix}${new Date().getFullYear()}-${ds.next.toString().padStart(5, '0')}`;
};

// --- MAIN COMPONENT ---

export default function CoopSystem() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [docSeries, setDocSeries] = useState(INITIAL_DOC_SERIES);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [accounts, setAccounts] = useState(CDA_ACCOUNTS);
  const [savingsAccounts, setSavingsAccounts] = useState([
    { id: 'S-001', memberId: 'M001', type: 'Regular Savings', balance: 25000, status: 'Active' },
    { id: 'SC-001', memberId: 'M001', type: 'Share Capital', balance: 50000, status: 'Active' },
    { id: 'TD-001', memberId: 'M001', type: 'Time Deposit', balance: 100000, status: 'Active', maturityDate: '2024-12-31', interestRate: 5 },
  ]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([
    {
      id: 'LN-2024-00001',
      memberId: 'M001',
      amount: 50000,
      balance: 15000,
      status: 'Released',
      type: 'Productive',
      term: 12,
      rate: 1,
      method: 'Diminishing',
      releaseDate: '2024-01-10',
      nextDue: '2024-04-10', // Set to past due for demo
      amortization: [
        { period: 1, principal: 4000, interest: 500, total: 4500, balance: 46000 },
        { period: 2, principal: 4040, interest: 460, total: 4500, balance: 41960 },
      ]
    }
  ]);
  const [journalEntries, setJournalEntries] = useState([
    {
      id: 'JV-2023-00001',
      date: '2023-12-31',
      ref: 'JV-2023-00001',
      total: 1000,
      status: 'Posted',
      entries: [
        { accountCode: '11100', debit: 1000, credit: 0 },
        { accountCode: '42000', debit: 0, credit: 1000 }
      ]
    }
  ]);
  const [notifications, setNotifications] = useState([]);
  const [coopSettings, setCoopSettings] = useState({
    name: 'Philippine Cooperative Inc.',
    address: '123 Cooperative St, Quezon City, Philippines',
    regNo: 'CDA REG 9520-12345678',
    logoText: 'COOP-SYS'
  });

  // --- NAVIGATION CONFIG ---
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: Object.values(ROLES) },
    { id: 'members', label: 'Members', icon: Users, roles: [ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.TELLER] },
    { id: 'savings', label: 'Savings & Deposits', icon: PiggyBank, roles: [ROLES.MANAGER, ROLES.TELLER, ROLES.ACCOUNTANT, ROLES.MEMBER] },
    { id: 'loans', label: 'Loans Lifecycle', icon: HandCoins, roles: [ROLES.MANAGER, ROLES.TELLER, ROLES.ACCOUNTANT, ROLES.MEMBER] },
    { id: 'collections', label: 'Collections', icon: Wallet, roles: [ROLES.MANAGER, ROLES.COLLECTOR, ROLES.TELLER] },
    { id: 'accounting', label: 'Accounting', icon: BookOpen, roles: [ROLES.MANAGER, ROLES.ACCOUNTANT] },
    { id: 'reports', label: 'Financial Reports', icon: FileBarChart, roles: [ROLES.MANAGER, ROLES.ACCOUNTANT] },
    { id: 'print-center', label: 'Print Center', icon: Printer, roles: [ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.TELLER] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: [ROLES.MANAGER] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Building2 className="w-16 h-16 text-indigo-600 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-slate-800">Philippine Cooperative</h1>
            <p className="text-slate-500">Accounting System (RA 9520)</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                id="login-username"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="admin, teller1, juan..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                id="login-password"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={() => {
                const u = document.getElementById('login-username').value;
                const p = document.getElementById('login-password').value;

                // Simple demo auth
                if (u === 'admin' && p === 'admin123') setUser({ name: 'Admin Manager', role: ROLES.MANAGER, username: 'admin' });
                else if (u === 'teller1' && p === 'teller123') setUser({ name: 'Tessie Teller', role: ROLES.TELLER, username: 'teller1' });
                else if (u === 'collector1' && p === 'col123') setUser({ name: 'Cody Collector', role: ROLES.COLLECTOR, username: 'collector1' });
                else if (u === 'accountant' && p === 'acct123') setUser({ name: 'Alice Accountant', role: ROLES.ACCOUNTANT, username: 'accountant' });
                else if (u === 'juan' && p === 'member123') setUser({ ...INITIAL_MEMBERS[0] });
                else alert('Invalid credentials');
              }}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            <p>Compliant with CDA Regulations under RA 9520</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0">
        <div className="p-6 flex items-center gap-3">
          <Building2 className="text-indigo-400" />
          <span className="font-bold text-lg tracking-tight">{coopSettings.logoText}</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                view === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <UserCircle size={24} className="text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {view.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Clock size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Business Date</p>
              <p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {view === 'dashboard' && <DashboardView user={user} members={members} loans={loans} />}
          {view === 'savings' && (
            <SavingsView
              user={user}
              members={members}
              savingsAccounts={savingsAccounts}
              setSavingsAccounts={setSavingsAccounts}
              transactions={transactions}
              setTransactions={setTransactions}
              setJournalEntries={setJournalEntries}
            />
          )}
          {view === 'loans' && (
            <LoansView
              user={user}
              members={members}
              loans={loans}
              setLoans={setLoans}
              setJournalEntries={setJournalEntries}
            />
          )}
          {view === 'collections' && (
            <CollectionsView
              user={user}
              members={members}
              loans={loans}
              setLoans={setLoans}
              setTransactions={setTransactions}
              setJournalEntries={setJournalEntries}
            />
          )}
          {view === 'accounting' && (
            <AccountingView
              user={user}
              accounts={accounts}
              setAccounts={setAccounts}
              journalEntries={journalEntries}
              setJournalEntries={setJournalEntries}
            />
          )}
          {view === 'reports' && (
            <ReportsView
              accounts={accounts}
              journalEntries={journalEntries}
            />
          )}
          {view === 'members' && (
            <Members360View
              user={user}
              members={members}
              setMembers={setMembers}
              loans={loans}
              savingsAccounts={savingsAccounts}
            />
          )}
          {view === 'print-center' && (
            <PrintCenterView
              docSeries={docSeries}
              setDocSeries={setDocSeries}
              coopSettings={coopSettings}
            />
          )}
          {view === 'settings' && (
            <SettingsView
              coopSettings={coopSettings}
              setCoopSettings={setCoopSettings}
            />
          )}
          {/* Other views will be added here... */}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SavingsView({ user, members, savingsAccounts, setSavingsAccounts, transactions, setTransactions, setJournalEntries }) {
  const [showModal, setShowModal] = useState(null); // 'deposit', 'withdraw', 'new'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formData, setFormData] = useState({});

  const postInterest = () => {
    if (!confirm('Post monthly interest for all eligible accounts?')) return;

    let totalPosted = 0;
    const newTransactions = [];

    const updatedAccounts = savingsAccounts.map(acc => {
      if (acc.type === 'Time Deposit' && acc.status === 'Active') {
        const interest = (acc.balance * (acc.interestRate / 100)) / 12;
        totalPosted += interest;
        newTransactions.push({
          id: `INT-${Date.now()}-${acc.id}`,
          accountId: acc.id,
          memberId: acc.memberId,
          type: 'Interest Posting',
          amount: interest,
          date: new Date().toISOString(),
          reference: 'SYS-INT-POST'
        });
        return { ...acc, balance: acc.balance + interest };
      }
      return acc;
    });

    setSavingsAccounts(updatedAccounts);
    setTransactions([...newTransactions, ...transactions]);

    // Add to Journal
    if (totalPosted > 0) {
      setJournalEntries(prev => [{
        id: `JV-INT-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        ref: 'SYS-INT-POST',
        total: totalPosted,
        status: 'Posted',
        entries: [
          { accountCode: '51200', debit: totalPosted, credit: 0 },
          { accountCode: '21100', debit: 0, credit: totalPosted }
        ]
      }, ...prev]);
    }

    alert(`Interest posting complete. Total posted: ${formatPHP(totalPosted)}`);
  };

  const handleTransaction = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return alert('Invalid amount');

    if (showModal === 'withdraw' && selectedAccount.balance < amount) {
      return alert('Insufficient balance');
    }

    const multiplier = showModal === 'withdraw' ? -1 : 1;

    // Update account balance
    setSavingsAccounts(prev => prev.map(acc =>
      acc.id === selectedAccount.id
        ? { ...acc, balance: acc.balance + (amount * multiplier) }
        : acc
    ));

    // Record transaction
    const ref = formData.reference || `SV-${Date.now().toString().slice(-6)}`;
    const newTx = {
      id: `TX-${Date.now()}`,
      accountId: selectedAccount.id,
      memberId: selectedAccount.memberId,
      type: showModal === 'deposit' ? 'Deposit' : 'Withdrawal',
      amount: amount,
      date: new Date().toISOString(),
      reference: ref
    };
    setTransactions([newTx, ...transactions]);

    // Add to Journal
    const isDeposit = showModal === 'deposit';
    setJournalEntries(prev => [{
      id: `JV-SV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ref: ref,
      total: amount,
      status: 'Posted',
      entries: [
        { accountCode: isDeposit ? '11100' : '21100', debit: amount, credit: 0 },
        { accountCode: isDeposit ? '21100' : '11100', debit: 0, credit: amount }
      ]
    }, ...prev]);

    setShowModal(null);
    setFormData({});
  };

  const openNewAccount = (e) => {
    e.preventDefault();
    const newAcc = {
      id: `${formData.type === 'Time Deposit' ? 'TD' : 'S'}-${Date.now()}`,
      memberId: formData.memberId,
      type: formData.type,
      balance: parseFloat(formData.initialDeposit || 0),
      status: 'Active',
      interestRate: formData.type === 'Time Deposit' ? parseFloat(formData.rate) : 0,
      maturityDate: formData.type === 'Time Deposit' ? formData.maturity : null,
    };
    setSavingsAccounts([...savingsAccounts, newAcc]);
    setShowModal(null);
    setFormData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Savings & Time Deposits</h3>
        <div className="flex gap-2">
          {(user.role === ROLES.ACCOUNTANT || user.role === ROLES.MANAGER) && (
            <button
              onClick={postInterest}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition"
            >
              <History size={18} /> Post Interest
            </button>
          )}
          {(user.role === ROLES.MANAGER || user.role === ROLES.TELLER) && (
            <button
              onClick={() => setShowModal('new')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <Plus size={18} /> New Account
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {savingsAccounts
          .filter(acc => user.role === ROLES.MEMBER ? acc.memberId === user.id : true)
          .map(acc => {
            const member = members.find(m => m.id === acc.memberId);
            return (
              <div key={acc.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{acc.type}</p>
                    <h4 className="font-bold text-slate-800">{member?.name}</h4>
                    <p className="text-xs text-slate-500">{acc.id}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
                    {acc.status}
                  </span>
                </div>
                <div className="mb-6">
                  <p className="text-slate-500 text-xs font-medium">Available Balance</p>
                  <p className="text-2xl font-bold text-slate-800">{formatPHP(acc.balance)}</p>
                </div>
                {acc.type === 'Time Deposit' && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interest Rate:</span>
                      <span className="font-bold">{acc.interestRate}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Maturity:</span>
                      <span className="font-bold">{acc.maturityDate}</span>
                    </div>
                  </div>
                )}
                {(user.role === ROLES.MANAGER || user.role === ROLES.TELLER) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedAccount(acc); setShowModal('deposit'); }}
                      className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => { setSelectedAccount(acc); setShowModal('withdraw'); }}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                    >
                      Withdraw
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-bold text-slate-800">Recent Transactions</h4>
          <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">No transactions recorded yet.</td>
              </tr>
            ) : (
              transactions.map(tx => (
                <tr key={tx.id}>
                  <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{tx.accountId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      tx.type === 'Deposit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{tx.reference}</td>
                  <td className={`px-6 py-4 text-right font-bold ${tx.type === 'Deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'Deposit' ? '+' : '-'}{formatPHP(tx.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h4 className="text-xl font-bold text-slate-800 mb-4 capitalize">
              {showModal === 'new' ? 'Open New Account' : `${showModal} Funds`}
            </h4>

            {showModal === 'new' ? (
              <form onSubmit={openNewAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Member</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                  >
                    <option value="">Select Member</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="">Select Type</option>
                    <option value="Regular Savings">Regular Savings</option>
                    <option value="Share Capital">Share Capital</option>
                    <option value="Time Deposit">Time Deposit</option>
                  </select>
                </div>
                {formData.type === 'Time Deposit' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Rate (%)</label>
                      <input type="number" step="0.01" className="w-full px-4 py-2 border border-slate-300 rounded-lg" onChange={e => setFormData({ ...formData, rate: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Maturity</label>
                      <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg" onChange={e => setFormData({ ...formData, maturity: e.target.value })} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Deposit</label>
                  <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg" onChange={e => setFormData({ ...formData, initialDeposit: e.target.value })} />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Create Account</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleTransaction} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg mb-4 text-sm">
                  <p className="text-slate-500">Account: <span className="font-bold text-slate-800">{selectedAccount?.id}</span></p>
                  <p className="text-slate-500">Current Balance: <span className="font-bold text-slate-800">{formatPHP(selectedAccount?.balance)}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0.00"
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference/OR Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="OR-12345"
                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  <button type="submit" className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition ${
                    showModal === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}>
                    Confirm {showModal === 'deposit' ? 'Deposit' : 'Withdrawal'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoansView({ user, members, loans, setLoans, setJournalEntries }) {
  const [showModal, setShowModal] = useState(null); // 'apply', 'details'
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({ method: 'Straight-line', rate: 1, term: 12 });

  const getAging = (nextDue) => {
    if (!nextDue) return { days: 0, status: 'Current' };
    const diff = Math.floor((new Date() - new Date(nextDue)) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return { days: 0, status: 'Current' };
    if (diff <= 30) return { days: diff, status: 'Past Due (1-30)' };
    if (diff <= 60) return { days: diff, status: 'Past Due (31-60)' };
    if (diff <= 90) return { days: diff, status: 'Past Due (61-90)' };
    return { days: diff, status: 'Past Due (90+)' };
  };

  const calculateAmortization = (principal, rate, term, method) => {
    const schedule = [];
    let balance = principal;
    const monthlyRate = rate / 100;

    if (method === 'Straight-line') {
      const principalPay = principal / term;
      const interestPay = principal * monthlyRate;
      for (let i = 1; i <= term; i++) {
        balance -= principalPay;
        schedule.push({
          period: i,
          principal: principalPay,
          interest: interestPay,
          total: principalPay + interestPay,
          balance: Math.max(0, balance)
        });
      }
    } else {
      // Diminishing Balance (Equal Payments / Annuity)
      const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
      for (let i = 1; i <= term; i++) {
        const interest = balance * monthlyRate;
        const principalPay = monthlyPayment - interest;
        balance -= principalPay;
        schedule.push({
          period: i,
          principal: principalPay,
          interest: interest,
          total: monthlyPayment,
          balance: Math.max(0, balance)
        });
      }
    }
    return schedule;
  };

  const handleApply = (e) => {
    e.preventDefault();
    const principal = parseFloat(formData.amount);
    const schedule = calculateAmortization(principal, formData.rate, formData.term, formData.method);

    const newLoan = {
      id: `LN-${new Date().getFullYear()}-${(loans.length + 1).toString().padStart(5, '0')}`,
      memberId: formData.memberId || user.id,
      amount: principal,
      balance: principal,
      status: 'Pending',
      type: formData.type,
      term: formData.term,
      rate: formData.rate,
      method: formData.method,
      applyDate: new Date().toISOString().split('T')[0],
      amortization: schedule
    };

    setLoans([newLoan, ...loans]);
    setShowModal(null);
  };

  const updateStatus = (loanId, newStatus) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        if (newStatus === 'Released' && l.status !== 'Released') {
          // Add to Journal on Release
          setJournalEntries(prevJE => [{
            id: `JV-LN-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            ref: l.id,
            total: l.amount,
            status: 'Posted',
            entries: [
              { accountCode: l.type === 'Productive' ? '12100' : '12200', debit: l.amount, credit: 0 },
              { accountCode: '11100', debit: 0, credit: l.amount }
            ]
          }, ...prevJE]);
        }
        return { ...l, status: newStatus, releaseDate: newStatus === 'Released' ? new Date().toISOString().split('T')[0] : l.releaseDate };
      }
      return l;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Loans Management</h3>
        {(user.role !== ROLES.COLLECTOR) && (
          <button
            onClick={() => setShowModal('apply')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Plus size={18} /> New Loan Application
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Loan ID</th>
                <th className="px-6 py-4">Borrower</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Principal</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loans
                .filter(l => user.role === ROLES.MEMBER ? l.memberId === user.id : true)
                .map(loan => {
                const member = members.find(m => m.id === loan.memberId);
                return (
                  <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{loan.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{member?.name}</p>
                      <p className="text-xs text-slate-500">{member?.id}</p>
                    </td>
                    <td className="px-6 py-4">{loan.type}</td>
                    <td className="px-6 py-4 font-bold">{formatPHP(loan.amount)}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      {formatPHP(loan.balance)}
                      {loan.status === 'Released' && getAging(loan.nextDue).days > 0 && (
                        <p className="text-[10px] text-red-600 font-bold uppercase">{getAging(loan.nextDue).status}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          loan.status === 'Released' ? 'bg-emerald-100 text-emerald-700' :
                          loan.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                          loan.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => { setSelectedLoan(loan); setShowModal('details'); }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                      >
                        Ledger
                      </button>
                      {user.role === ROLES.MANAGER && loan.status === 'Pending' && (
                        <button onClick={() => updateStatus(loan.id, 'Approved')} className="text-emerald-600 hover:text-emerald-800 font-bold text-xs">Approve</button>
                      )}
                      {user.role === ROLES.TELLER && loan.status === 'Approved' && (
                        <button onClick={() => updateStatus(loan.id, 'Released')} className="text-blue-600 hover:text-blue-800 font-bold text-xs">Release</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal === 'apply' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8">
            <h4 className="text-2xl font-bold text-slate-800 mb-6">Loan Application</h4>
            <form onSubmit={handleApply} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Borrower</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                    defaultValue={user.role === ROLES.MEMBER ? user.id : ""}
                    disabled={user.role === ROLES.MEMBER}
                  >
                    <option value="">Select Member</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loan Type</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="">Select Type</option>
                    <option value="Productive">Productive</option>
                    <option value="Providential">Providential</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Principal Amount</label>
                  <input
                    required type="number"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (% monthly)</label>
                  <input
                    required type="number" step="0.01" value={formData.rate}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={e => setFormData({ ...formData, rate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Term (months)</label>
                  <input
                    required type="number" value={formData.term}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={e => setFormData({ ...formData, term: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Computation Method</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={e => setFormData({ ...formData, method: e.target.value })}
                    value={formData.method}
                  >
                    <option value="Straight-line">Straight-line</option>
                    <option value="Diminishing">Diminishing Balance</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg transition">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'details' && selectedLoan && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h4 className="text-xl font-bold text-slate-800">Loan Ledger: {selectedLoan.id}</h4>
                <p className="text-sm text-slate-500">Method: {selectedLoan.method} • Rate: {selectedLoan.rate}% monthly</p>
              </div>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600"><AlertCircle /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-xs text-indigo-600 font-bold uppercase">Principal</p>
                  <p className="text-xl font-bold text-indigo-900">{formatPHP(selectedLoan.amount)}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-600 font-bold uppercase">Balance</p>
                  <p className="text-xl font-bold text-emerald-900">{formatPHP(selectedLoan.balance)}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-600 font-bold uppercase">Interest Paid</p>
                  <p className="text-xl font-bold text-amber-900">{formatPHP(0)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-xs text-red-600 font-bold uppercase">Penalty Due</p>
                  <p className="text-xl font-bold text-red-900">
                    {formatPHP(getAging(selectedLoan.nextDue).days > 0 ? selectedLoan.amount * 0.02 : 0)}
                  </p>
                </div>
              </div>

              <h5 className="font-bold text-slate-800 mb-4">Amortization Schedule</h5>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2">No.</th>
                    <th className="px-4 py-2">Principal</th>
                    <th className="px-4 py-2">Interest</th>
                    <th className="px-4 py-2 text-right">Total Payment</th>
                    <th className="px-4 py-2 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {selectedLoan.amortization.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">{row.period}</td>
                      <td className="px-4 py-3">{formatPHP(row.principal)}</td>
                      <td className="px-4 py-3">{formatPHP(row.interest)}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatPHP(row.total)}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{formatPHP(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition">
                <Printer size={16} /> Print Schedule
              </button>
              <button onClick={() => setShowModal(null)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollectionsView({ user, members, loans, setLoans, setTransactions, setJournalEntries }) {
  const [remittance, setRemittance] = useState([]);
  const [showOR, setShowOR] = useState(null);
  const [inputAmounts, setInputAmounts] = useState({});

  const postCollection = (loan) => {
    const amount = parseFloat(inputAmounts[loan.id]);
    if (!amount || amount <= 0) return alert('Invalid amount');

    // 1. Update Loan Balance
    setLoans(prev => prev.map(l =>
      l.id === loan.id ? { ...l, balance: l.balance - amount } : l
    ));

    // 2. Add to Remittance
    const orNum = `OR-${Date.now().toString().slice(-6)}`;
    const entry = {
      id: Date.now(),
      orNumber: orNum,
      loanId: loan.id,
      memberId: loan.memberId,
      amount: parseFloat(amount),
      date: new Date().toISOString()
    };
    setRemittance([entry, ...remittance]);

    // 3. Add to Transactions
    setTransactions(prev => [{
      id: `TX-COL-${Date.now()}`,
      accountId: loan.id,
      memberId: loan.memberId,
      type: 'Loan Payment',
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      reference: orNum
    }, ...prev]);

    // 4. Add to Journal
    setJournalEntries(prev => [{
      id: `JV-COL-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ref: orNum,
      total: amount,
      status: 'Posted',
      entries: [
        { accountCode: '11100', debit: amount, credit: 0 },
        { accountCode: loan.type === 'Productive' ? '12100' : '12200', debit: 0, credit: amount }
      ]
    }, ...prev]);

    setShowOR(entry);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Field Collections</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
          <Printer size={18} /> Daily Collection Sheet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h4 className="font-bold text-slate-800 mb-4">Assigned Borrowers</h4>
          <div className="space-y-4">
            {loans.filter(l => l.status === 'Released' && l.balance > 0).map(loan => {
              const member = members.find(m => m.id === loan.memberId);
              return (
                <div key={loan.id} className="p-4 border border-slate-100 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{member?.name}</p>
                    <p className="text-xs text-slate-500">{loan.id} • Balance: {formatPHP(loan.balance)}</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={inputAmounts[loan.id] || ''}
                      onChange={e => setInputAmounts({...inputAmounts, [loan.id]: e.target.value})}
                      className="w-24 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <button
                      onClick={() => {
                        postCollection(loan);
                        setInputAmounts({...inputAmounts, [loan.id]: ''});
                      }}
                      className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-emerald-700"
                    >
                      Post
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h4 className="font-bold text-slate-800 mb-4">Today's Remittance Summary</h4>
          <div className="space-y-3">
            {remittance.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-8">No collections posted yet.</p>
            ) : (
              remittance.map(entry => (
                <div key={entry.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                  <div>
                    <p className="font-bold text-slate-700">{entry.orNumber}</p>
                    <p className="text-[10px] text-slate-500">{new Date(entry.date).toLocaleTimeString()}</p>
                  </div>
                  <p className="font-bold text-emerald-600">{formatPHP(entry.amount)}</p>
                </div>
              ))
            )}
            {remittance.length > 0 && (
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800 uppercase text-xs">Total Remittance:</span>
                <span className="font-bold text-xl text-indigo-600">{formatPHP(remittance.reduce((s, e) => s + e.amount, 0))}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showOR && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-600" size={32} />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-1">Collection Successful</h4>
            <p className="text-sm text-slate-500 mb-6">Official Receipt generated.</p>

            <div className="bg-slate-50 p-4 rounded-lg text-left mb-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">OR Number:</span><span className="font-bold">{showOR.orNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Amount Paid:</span><span className="font-bold text-emerald-600">{formatPHP(showOR.amount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date:</span><span>{new Date(showOR.date).toLocaleDateString()}</span></div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowOR(null)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-600">Close</button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                <Printer size={16} /> Print OR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountantToolsView({ accounts, journalEntries, setJournalEntries }) {
  const [closedPeriods, setClosedPeriods] = useState([]);
  const [showAdjustingForm, setShowAdjustingForm] = useState(false);
  const [fixedAssets, setFixedAssets] = useState([
    { id: 'FA-001', name: 'Office Building', cost: 5000000, life: 20, acquired: '2020-01-01' },
    { id: 'FA-002', name: 'Delivery Van', cost: 1200000, life: 5, acquired: '2022-06-15' },
  ]);

  const runDepreciation = () => {
    if (!confirm('Run monthly depreciation for all fixed assets?')) return;
    alert('Depreciation entries generated and posted.');
  };

  const closePeriod = () => {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    if (confirm(`Close accounting period for ${month} ${year}? This will lock all entries.`)) {
      setClosedPeriods([...closedPeriods, `${month} ${year}`]);
      alert('Period closed successfully.');
    }
  };

  const distributeSurplus = () => {
    const undividedSurplus = 1000000; // Mock undivided surplus
    const grf = undividedSurplus * 0.10;
    const etf = undividedSurplus * 0.02;
    const cdf = undividedSurplus * 0.03;
    const distributable = undividedSurplus - grf - etf - cdf;

    alert(`Surplus Distribution (CDA Formula):
    - General Reserve Fund (10%): ${formatPHP(grf)}
    - Education/Training (2%): ${formatPHP(etf)}
    - Community Dev (3%): ${formatPHP(cdf)}
    - Interest on Share Capital & Patronage Refund: ${formatPHP(distributable)}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg"><Building2 className="text-purple-600" size={24} /></div>
          <h4 className="font-bold text-slate-800">Depreciation Management</h4>
        </div>
        <div className="space-y-4 mb-6">
          {fixedAssets.map(asset => (
            <div key={asset.id} className="flex justify-between items-center text-sm">
              <div><p className="font-bold">{asset.name}</p><p className="text-xs text-slate-500">Cost: {formatPHP(asset.cost)}</p></div>
              <p className="font-mono text-xs">{formatPHP(asset.cost / (asset.life * 12))}/mo</p>
            </div>
          ))}
        </div>
        <button onClick={runDepreciation} className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition">Run Monthly Depreciation</button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-lg"><Clock className="text-red-600" size={24} /></div>
          <h4 className="font-bold text-slate-800">Period Closing</h4>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg mb-6 text-xs space-y-2">
          <p className="flex items-center gap-2"><CheckCircle className="text-emerald-500" size={14} /> All journal entries posted</p>
          <p className="flex items-center gap-2"><CheckCircle className="text-emerald-500" size={14} /> Bank reconciliation complete</p>
          <p className="flex items-center gap-2"><CheckCircle className="text-emerald-500" size={14} /> Depreciation processed</p>
        </div>
        <button onClick={closePeriod} className="w-full py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition">Close Current Period</button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 rounded-lg"><ShieldCheck className="text-emerald-600" size={24} /></div>
          <h4 className="font-bold text-slate-800">Surplus Distribution</h4>
        </div>
        <p className="text-xs text-slate-500 mb-6">Apply CDA standard formula for statutory funds and distributable net surplus.</p>
        <button onClick={distributeSurplus} className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition">Compute & Distribute Surplus</button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 rounded-lg"><FileText className="text-amber-600" size={24} /></div>
          <h4 className="font-bold text-slate-800">Adjusting Entries</h4>
        </div>
        <p className="text-xs text-slate-500 mb-6">Create accruals, deferrals, and reversing entries for the current period.</p>
        <button onClick={() => setShowAdjustingForm(true)} className="w-full py-2 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition">Create Adjusting Entry</button>
      </div>

      {showAdjustingForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8">
            <h4 className="text-2xl font-bold text-slate-800 mb-6">New Adjusting Entry</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adjustment Type</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                  <option>Accrued Income</option>
                  <option>Accrued Expense</option>
                  <option>Prepaid Expense</option>
                  <option>Deferred Revenue</option>
                  <option>Depreciation</option>
                  <option>Bad Debts</option>
                  <option>Inventory Adjustment</option>
                  <option>Reversing Entry</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Effective Date</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input type="number" step="0.01" className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="0.00" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="adj-reverse" className="rounded border-slate-300" />
                <label htmlFor="adj-reverse" className="text-xs text-slate-600 font-medium">Auto-reverse next period</label>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setShowAdjustingForm(false)} className="flex-1 py-2 border border-slate-300 rounded-lg font-bold text-slate-600">Cancel</button>
                <button onClick={() => { alert('Adjusting entry posted.'); setShowAdjustingForm(false); }} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">Post Entry</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountingView({ user, accounts, setAccounts, journalEntries, setJournalEntries }) {
  const [subView, setSubView] = useState('chart'); // 'chart', 'journal', 'accountant'
  const [showAdd, setShowAdd] = useState(false);
  const [showJV, setShowJV] = useState(false);
  const [newAcc, setNewAcc] = useState({ class: 'Assets', type: 'Current' });
  const [jvData, setJvData] = useState({
    date: new Date().toISOString().split('T')[0],
    ref: `JV-${Date.now().toString().slice(-6)}`,
    entries: [{ accountCode: '', debit: 0, credit: 0 }, { accountCode: '', debit: 0, credit: 0 }]
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (accounts.some(a => a.code === newAcc.code)) return alert('Account code already exists');
    setAccounts([...accounts, newAcc]);
    setShowAdd(false);
    setNewAcc({ class: 'Assets', type: 'Current' });
  };

  const handleJvSubmit = (e) => {
    e.preventDefault();
    const totalDebit = jvData.entries.reduce((sum, ent) => sum + parseFloat(ent.debit || 0), 0);
    const totalCredit = jvData.entries.reduce((sum, ent) => sum + parseFloat(ent.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return alert(`Out of balance! Debit: ${totalDebit}, Credit: ${totalCredit}`);
    }

    const newJv = {
      ...jvData,
      id: Date.now(),
      status: 'Posted',
      total: totalDebit
    };

    setJournalEntries([newJv, ...journalEntries]);
    setShowJV(false);
    setJvData({
      date: new Date().toISOString().split('T')[0],
      ref: `JV-${Date.now().toString().slice(-6)}`,
      entries: [{ accountCode: '', debit: 0, credit: 0 }, { accountCode: '', debit: 0, credit: 0 }]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => setSubView('chart')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition ${subView === 'chart' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          Chart of Accounts
        </button>
        <button
          onClick={() => setSubView('journal')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition ${subView === 'journal' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          Journal Entries
        </button>
        {user.role === ROLES.ACCOUNTANT && (
          <button
            onClick={() => setSubView('accountant')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition ${subView === 'accountant' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Accountant Tools
          </button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">
          {subView === 'chart' ? 'Chart of Accounts (CDA Compliant)' : subView === 'journal' ? 'General Journal' : 'Specialized Accountant Tools'}
        </h3>
        {subView === 'chart' ? (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Plus size={18} /> Add Account
          </button>
        ) : subView === 'journal' ? (
          <button
            onClick={() => setShowJV(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Plus size={18} /> New Journal Entry
          </button>
        ) : null}
      </div>

      {subView === 'chart' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Account Name</th>
              <th className="px-6 py-4">Classification</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {accounts.sort((a, b) => a.code.localeCompare(b.code)).map(acc => (
              <tr key={acc.code} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-indigo-600">{acc.code}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{acc.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    acc.class === 'Assets' ? 'bg-blue-100 text-blue-700' :
                    acc.class === 'Liabilities' ? 'bg-red-100 text-red-700' :
                    acc.class === 'Equity' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {acc.class}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{acc.type}</td>
                <td className="px-6 py-4 text-right">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : subView === 'journal' ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search reference or date..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <button className="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Filter size={18} /> Filters
            </button>
          </div>

          {journalEntries.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-100">
              <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-400 italic">No journal entries found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {journalEntries.map(jv => (
                    <tr key={jv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">{jv.date}</td>
                      <td className="px-6 py-4 font-mono font-bold">{jv.ref}</td>
                      <td className="px-6 py-4 font-bold">{formatPHP(jv.total)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setJournalEntries(journalEntries.map(j => j.id === jv.id ? {...j, status: j.status === 'Posted' ? 'Unposted' : 'Posted'} : j));
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${jv.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                          {jv.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 font-bold hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <AccountantToolsView accounts={accounts} journalEntries={journalEntries} setJournalEntries={setJournalEntries} />
      )}

      {showJV && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-8 overflow-y-auto max-h-[90vh]">
            <h4 className="text-2xl font-bold text-slate-800 mb-6">New Journal Voucher</h4>
            <form onSubmit={handleJvSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={jvData.date} className="w-full px-4 py-2 border border-slate-300 rounded-lg" onChange={e => setJvData({...jvData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference No.</label>
                  <input type="text" value={jvData.ref} className="w-full px-4 py-2 border border-slate-300 rounded-lg" onChange={e => setJvData({...jvData, ref: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase px-2">
                  <div className="col-span-6">Account</div>
                  <div className="col-span-3 text-right">Debit</div>
                  <div className="col-span-3 text-right">Credit</div>
                </div>
                {jvData.entries.map((entry, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <select
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        value={entry.accountCode}
                        onChange={e => {
                          const newEntries = [...jvData.entries];
                          newEntries[idx].accountCode = e.target.value;
                          setJvData({...jvData, entries: newEntries});
                        }}
                      >
                        <option value="">Select Account</option>
                        {accounts.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number" step="0.01" placeholder="0.00"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-right"
                        value={entry.debit || ''}
                        onChange={e => {
                          const newEntries = [...jvData.entries];
                          newEntries[idx].debit = e.target.value;
                          setJvData({...jvData, entries: newEntries});
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number" step="0.01" placeholder="0.00"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-right"
                        value={entry.credit || ''}
                        onChange={e => {
                          const newEntries = [...jvData.entries];
                          newEntries[idx].credit = e.target.value;
                          setJvData({...jvData, entries: newEntries});
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setJvData({...jvData, entries: [...jvData.entries, { accountCode: '', debit: 0, credit: 0 }]})}
                  className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  <Plus size={16} /> Add Row
                </button>
              </div>

              <div className="flex justify-end gap-6 pt-4 border-t border-slate-100 text-sm">
                <div className="text-right">
                  <p className="text-slate-500 uppercase font-bold text-[10px]">Total Debit</p>
                  <p className="text-lg font-bold text-slate-800">{formatPHP(jvData.entries.reduce((s, e) => s + parseFloat(e.debit || 0), 0))}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 uppercase font-bold text-[10px]">Total Credit</p>
                  <p className="text-lg font-bold text-slate-800">{formatPHP(jvData.entries.reduce((s, e) => s + parseFloat(e.credit || 0), 0))}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowJV(false)} className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-slate-600">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg">Post Journal Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h4 className="text-xl font-bold text-slate-800 mb-6">New Account Code</h4>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Code</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg" onChange={e => setNewAcc({ ...newAcc, code: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg" onChange={e => setNewAcc({ ...newAcc, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Classification</label>
                <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg" onChange={e => setNewAcc({ ...newAcc, class: e.target.value })}>
                  <option value="Assets">Assets</option>
                  <option value="Liabilities">Liabilities</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expenses">Expenses</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <input required type="text" placeholder="e.g. Current, Non-Current, Operating" className="w-full px-4 py-2 border border-slate-300 rounded-lg" onChange={e => setNewAcc({ ...newAcc, type: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Add Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsView({ accounts, journalEntries }) {
  const [reportType, setReportsType] = useState('balance-sheet');

  const getAccountBalance = (code) => {
    let balance = 0;
    const account = accounts.find(a => a.code === code);
    if (!account) return 0;

    journalEntries.forEach(jv => {
      if (jv.status !== 'Posted') return;
      jv.entries.forEach(ent => {
        if (ent.accountCode === code) {
          const debit = parseFloat(ent.debit || 0);
          const credit = parseFloat(ent.credit || 0);
          if (account.class === 'Assets' || account.class === 'Expenses') {
            balance += (debit - credit);
          } else {
            balance += (credit - debit);
          }
        }
      });
    });
    return balance;
  };

  const getTotalsByClass = (className) => {
    return accounts
      .filter(a => a.class === className)
      .reduce((sum, a) => sum + getAccountBalance(a.code), 0);
  };

  const renderBalanceSheet = () => {
    const totalAssets = getTotalsByClass('Assets');
    const totalLiabilities = getTotalsByClass('Liabilities');
    const totalEquity = getTotalsByClass('Equity');

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">STATEMENT OF FINANCIAL CONDITION</h2>
          <p className="text-slate-500 uppercase text-sm font-bold">As of {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h4 className="font-bold border-b-2 border-slate-900 pb-1 text-slate-800">ASSETS</h4>
            <div className="space-y-2">
              {accounts.filter(a => a.class === 'Assets').map(a => {
                const bal = getAccountBalance(a.code);
                if (bal === 0) return null;
                return (
                  <div key={a.code} className="flex justify-between text-sm">
                    <span className="text-slate-600">{a.name}</span>
                    <span className="font-mono font-bold">{formatPHP(bal)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between pt-4 border-t border-slate-200 font-bold">
                <span>TOTAL ASSETS</span>
                <span className="underline underline-offset-4 decoration-double">{formatPHP(totalAssets)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="font-bold border-b-2 border-slate-900 pb-1 text-slate-800">LIABILITIES</h4>
              <div className="space-y-2">
                {accounts.filter(a => a.class === 'Liabilities').map(a => {
                  const bal = getAccountBalance(a.code);
                  if (bal === 0) return null;
                  return (
                    <div key={a.code} className="flex justify-between text-sm">
                      <span className="text-slate-600">{a.name}</span>
                      <span className="font-mono font-bold">{formatPHP(bal)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2 font-bold border-t border-slate-100">
                  <span>Total Liabilities</span>
                  <span>{formatPHP(totalLiabilities)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold border-b-2 border-slate-900 pb-1 text-slate-800">EQUITY</h4>
              <div className="space-y-2">
                {accounts.filter(a => a.class === 'Equity').map(a => {
                  const bal = getAccountBalance(a.code);
                  if (bal === 0) return null;
                  return (
                    <div key={a.code} className="flex justify-between text-sm">
                      <span className="text-slate-600">{a.name}</span>
                      <span className="font-mono font-bold">{formatPHP(bal)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2 font-bold border-t border-slate-100">
                  <span>Total Equity</span>
                  <span>{formatPHP(totalEquity)}</span>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-slate-900 font-bold">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span className="underline underline-offset-4 decoration-double">{formatPHP(totalLiabilities + totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIncomeStatement = () => {
    const totalRevenue = getTotalsByClass('Revenue');
    const totalExpenses = getTotalsByClass('Expenses');
    const netSurplus = totalRevenue - totalExpenses;

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">STATEMENT OF OPERATIONS</h2>
          <p className="text-slate-500 uppercase text-sm font-bold">For the Period Ended {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-bold border-b border-slate-200 pb-1">REVENUE</h4>
            {accounts.filter(a => a.class === 'Revenue').map(a => {
              const bal = getAccountBalance(a.code);
              if (bal === 0) return null;
              return (
                <div key={a.code} className="flex justify-between text-sm pl-4">
                  <span>{a.name}</span>
                  <span className="font-mono font-bold">{formatPHP(bal)}</span>
                </div>
              );
            })}
            <div className="flex justify-between pt-2 font-bold bg-slate-50 p-2">
              <span>GROSS REVENUE</span>
              <span>{formatPHP(totalRevenue)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold border-b border-slate-200 pb-1">EXPENSES</h4>
            {accounts.filter(a => a.class === 'Expenses').map(a => {
              const bal = getAccountBalance(a.code);
              if (bal === 0) return null;
              return (
                <div key={a.code} className="flex justify-between text-sm pl-4">
                  <span>{a.name}</span>
                  <span className="font-mono">{formatPHP(bal)}</span>
                </div>
              );
            })}
            <div className="flex justify-between pt-2 font-bold bg-slate-50 p-2">
              <span>TOTAL EXPENSES</span>
              <span>{formatPHP(totalExpenses)}</span>
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t-2 border-slate-900 font-bold text-lg">
            <span>NET SURPLUS (LOSS)</span>
            <span className="underline underline-offset-4 decoration-double">{formatPHP(netSurplus)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTrialBalance = () => {
    let totalDebit = 0;
    let totalCredit = 0;

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">TRIAL BALANCE</h2>
          <p className="text-slate-500 uppercase text-sm font-bold">As of {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b-2 border-slate-900">
            <tr>
              <th className="py-2 text-left">Account Title</th>
              <th className="py-2 text-right">Debit</th>
              <th className="py-2 text-right">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map(a => {
              const balance = getAccountBalance(a.code);
              if (balance === 0) return null;

              const isDebitNormal = a.class === 'Assets' || a.class === 'Expenses';
              const debit = isDebitNormal ? balance : 0;
              const credit = !isDebitNormal ? balance : 0;

              totalDebit += debit;
              totalCredit += credit;

              return (
                <tr key={a.code}>
                  <td className="py-2">{a.code} - {a.name}</td>
                  <td className="py-2 text-right font-mono">{debit !== 0 ? formatPHP(debit) : ''}</td>
                  <td className="py-2 text-right font-mono">{credit !== 0 ? formatPHP(credit) : ''}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-900 font-bold">
            <tr>
              <td className="py-2">TOTAL</td>
              <td className="py-2 text-right">{formatPHP(totalDebit)}</td>
              <td className="py-2 text-right">{formatPHP(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex gap-2">
          <button onClick={() => setReportsType('balance-sheet')} className={`px-4 py-2 text-sm font-bold rounded-lg ${reportType === 'balance-sheet' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Balance Sheet</button>
          <button onClick={() => setReportsType('income-statement')} className={`px-4 py-2 text-sm font-bold rounded-lg ${reportType === 'income-statement' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Income Statement</button>
          <button onClick={() => setReportsType('trial-balance')} className={`px-4 py-2 text-sm font-bold rounded-lg ${reportType === 'trial-balance' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Trial Balance</button>
        </div>
        <div className="flex gap-2">
          <input type="date" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 min-h-[800px]">
        {reportType === 'balance-sheet' && renderBalanceSheet()}
        {reportType === 'income-statement' && renderIncomeStatement()}
        {reportType === 'trial-balance' && renderTrialBalance()}
      </div>
    </div>
  );
}

function Members360View({ user, members, setMembers, loans, savingsAccounts }) {
  const [selectedMember, setSelectedLoanMember] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTableView, setIsTableView] = useState(true);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedMember) {
    const memberLoans = loans.filter(l => l.memberId === selectedMember.id);
    const memberSavings = savingsAccounts.filter(s => s.memberId === selectedMember.id);

    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedLoanMember(null)} className="flex items-center gap-2 text-indigo-600 font-bold hover:underline">
          <ChevronRight className="rotate-180" size={18} /> Back to Member List
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-3xl font-bold">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                <p className="text-slate-400 text-sm">{selectedMember.id} • Member since {selectedMember.joinDate}</p>
                <div className="flex gap-2 mt-2">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-emerald-500/30">Active</span>
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-blue-500/30">Regular</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Credit Score</p>
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${selectedMember.creditScore}%` }}></div>
                </div>
                <span className="text-2xl font-bold text-emerald-400">{selectedMember.creditScore}</span>
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-100 bg-slate-50 px-8">
            {['Overview', 'Savings', 'Loans', 'Collections', 'Documents', 'History'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <h5 className="font-bold text-slate-800 flex items-center gap-2"><UserCircle size={18} className="text-indigo-600" /> Personal Info</h5>
                  <div className="space-y-3 text-sm">
                    <div><p className="text-slate-500">Address</p><p className="font-medium">{selectedMember.address}</p></div>
                    <div><p className="text-slate-500">Contact</p><p className="font-medium">{selectedMember.contact}</p></div>
                    <div><p className="text-slate-500">Membership Date</p><p className="font-medium">{selectedMember.joinDate}</p></div>
                  </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Savings</p>
                    <p className="text-2xl font-bold text-slate-800">{formatPHP(selectedMember.savingsBalance)}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Share Capital</p>
                    <p className="text-2xl font-bold text-slate-800">{formatPHP(selectedMember.shareCapital)}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Outstanding Loans</p>
                    <p className="text-2xl font-bold text-indigo-600">{formatPHP(selectedMember.loanBalance)}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Loan Eligibility</p>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                      <CheckCircle size={16} /> Eligible
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'Savings' && (
              <div className="space-y-4">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                    <tr><th className="px-4 py-2">Account ID</th><th className="px-4 py-2">Type</th><th className="px-4 py-2 text-right">Balance</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberSavings.map(s => (
                      <tr key={s.id}><td className="px-4 py-3 font-medium">{s.id}</td><td className="px-4 py-3">{s.type}</td><td className="px-4 py-3 text-right font-bold">{formatPHP(s.balance)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'Loans' && (
              <div className="space-y-4">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                    <tr><th className="px-4 py-2">Loan ID</th><th className="px-4 py-2">Type</th><th className="px-4 py-2 text-right">Balance</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberLoans.map(l => (
                      <tr key={l.id}><td className="px-4 py-3 font-medium">{l.id}</td><td className="px-4 py-3">{l.type}</td><td className="px-4 py-3 text-right font-bold">{formatPHP(l.balance)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'History' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg text-slate-600 text-sm font-medium">Transaction history for {selectedMember.name}</div>
                <div className="text-center py-8 text-slate-400 italic text-sm">Member transaction logs are up to date.</div>
              </div>
            )}
            {activeTab === 'Collections' && (
              <div className="space-y-4 text-center py-12">
                <Wallet className="mx-auto text-slate-300 mb-2" size={48} />
                <p className="text-slate-500 font-medium">No recent field collections found for this member.</p>
              </div>
            )}
            {activeTab === 'Documents' && (
              <div className="grid grid-cols-2 gap-4">
                {['Membership Form.pdf', 'Valid ID.jpg', 'Proof of Address.pdf'].map(doc => (
                  <div key={doc} className="p-4 border border-slate-100 rounded-xl flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition">
                    <FileText className="text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">{doc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Member Directory</h3>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search members..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setIsTableView(!isTableView)} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">
            {isTableView ? <LayoutDashboard size={20} /> : <Users size={20} />}
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-md">
            <Plus size={18} /> Add Member
          </button>
        </div>
      </div>

      {isTableView ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Member Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Savings</th>
                <th className="px-6 py-4">Loans</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredMembers.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{m.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <p className="text-[10px] text-slate-500">{m.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded uppercase">{m.status}</span></td>
                  <td className="px-6 py-4 font-medium">{formatPHP(m.savingsBalance)}</td>
                  <td className="px-6 py-4 font-medium">{formatPHP(m.loanBalance)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${m.creditScore}%` }}></div>
                      </div>
                      <span className="font-bold text-xs">{m.creditScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedLoanMember(m)} className="text-indigo-600 font-bold hover:underline">360° Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(m => (
            <div key={m.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">{m.name.charAt(0)}</div>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{m.status}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-lg mb-1">{m.name}</h4>
              <p className="text-xs text-slate-500 mb-6">{m.id} • Joined {m.joinDate}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Savings</p><p className="font-bold text-slate-700">{formatPHP(m.savingsBalance)}</p></div>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Loans</p><p className="font-bold text-indigo-600">{formatPHP(m.loanBalance)}</p></div>
              </div>
              <button onClick={() => setSelectedLoanMember(m)} className="w-full py-2 bg-slate-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition border border-indigo-100">View 360° Profile</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrintCenterView({ docSeries, setDocSeries, coopSettings }) {
  const [lookup, setLookup] = useState('');
  const [voidLog, setVoidLog] = useState([
    { id: 1, docNum: 'OR-2023-00892', reason: 'Encoding error', date: '2023-12-15', user: 'teller1' }
  ]);

  const templates = [
    'Official Receipt', 'Loan Agreement', 'Amortization Schedule',
    'Passbook Page', 'Member ID', 'Time Deposit Certificate',
    'Collection Sheet', 'Remittance Report', 'Trial Balance',
    'Balance Sheet', 'Income Statement', 'Journal Voucher',
    'Cash Disbursement Voucher', 'Membership Application'
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Settings size={20} className="text-indigo-600" /> Document Numbering System</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docSeries.map(series => (
              <div key={series.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-slate-700 text-sm">{series.name}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded uppercase text-slate-500">{series.id}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500">Pattern: <span className="font-mono font-bold text-slate-700">{series.prefix}{new Date().getFullYear()}-XXXXX</span></p>
                  <p className="text-[10px] text-slate-500">Next: <span className="font-bold text-indigo-600">{series.next}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm"><Search size={16} /> Number Lookup</h4>
            <div className="flex gap-2">
              <input
                type="text" placeholder="Search number..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                value={lookup} onChange={e => setLookup(e.target.value)}
              />
              <button className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold">Find</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm"><AlertCircle size={16} className="text-red-500" /> Void Control Audit</h4>
            <div className="space-y-3">
              {voidLog.map(log => (
                <div key={log.id} className="p-2 bg-red-50 rounded border border-red-100 text-[10px]">
                  <p className="font-bold text-red-700">{log.docNum}</p>
                  <p className="text-red-600/70">{log.reason} • {log.date}</p>
                </div>
              ))}
              <button className="w-full py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition">Void a Document</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Printer size={20} className="text-indigo-600" /> Document Templates</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {templates.map(template => (
            <button key={template} className="group p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition text-center">
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-indigo-600 group-hover:shadow-md transition">
                <FileText size={20} />
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter leading-tight">{template}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-8 text-white">
        <div className="max-w-2xl mx-auto border border-slate-700 bg-white text-slate-900 p-12 min-h-[400px] shadow-2xl relative">
          <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-400">PRINT PREVIEW PANE</div>
          <div className="text-center mb-8">
            <h2 className="text-xl font-black uppercase tracking-tight">{coopSettings.name}</h2>
            <p className="text-xs">{coopSettings.address}</p>
            <p className="text-xs font-bold mt-1">{coopSettings.regNo}</p>
          </div>
          <div className="border-t border-b border-slate-200 py-4 mb-8 flex justify-between items-center">
            <h3 className="font-bold uppercase">Official Receipt</h3>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">OR Number</p>
              <p className="font-mono font-bold text-red-600">OR-2024-00001</p>
            </div>
          </div>
          <div className="space-y-4 h-32 border-b border-slate-100 mb-8">
            <div className="w-full h-2 bg-slate-100 rounded"></div>
            <div className="w-2/3 h-2 bg-slate-100 rounded"></div>
            <div className="w-1/2 h-2 bg-slate-100 rounded"></div>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-center border-t border-slate-300 w-48 pt-2">
              <p className="text-[10px] font-bold uppercase">Authorized Signatory</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total Amount</p>
              <p className="text-2xl font-bold">₱0.00</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <button onClick={() => window.print()} className="px-8 py-3 bg-indigo-600 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg">
            <Printer size={20} /> Print Document
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ coopSettings, setCoopSettings }) {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Settings size={24} className="text-indigo-600" /> Cooperative Settings
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cooperative Name</label>
          <input
            type="text" value={coopSettings.name}
            onChange={e => setCoopSettings({...coopSettings, name: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <textarea
            value={coopSettings.address}
            onChange={e => setCoopSettings({...coopSettings, address: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">CDA Registration No.</label>
          <input
            type="text" value={coopSettings.regNo}
            onChange={e => setCoopSettings({...coopSettings, regNo: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">System Logo Text</label>
          <input
            type="text" value={coopSettings.logoText}
            onChange={e => setCoopSettings({...coopSettings, logoText: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition mt-4">
          Save Configuration
        </button>
      </div>
    </div>
  );
}

function DashboardView({ user, members, loans }) {
  const getStats = () => {
    switch(user.role) {
      case ROLES.MANAGER:
        return [
          { label: 'Total Members', value: members.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Loan Portfolio', value: formatPHP(loans.reduce((sum, l) => sum + (l.balance || 0), 0)), icon: HandCoins, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Savings Volume', value: formatPHP(members.reduce((sum, m) => sum + m.savingsBalance, 0)), icon: PiggyBank, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Collection Rate', value: '94.2%', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ];
      case ROLES.TELLER:
        return [
          { label: 'Today\'s Deposits', value: formatPHP(54200), icon: ArrowDownRight, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Today\'s Withdrawals', value: formatPHP(12500), icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Loan Applications', value: '8 Pending', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'New Members', value: '3 Today', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ];
      case ROLES.COLLECTOR:
        return [
          { label: 'My Collections Today', value: formatPHP(8450), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Assigned Borrowers', value: '42', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Efficiency Rate', value: '88%', icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Remitted Amount', value: formatPHP(7000), icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-100' },
        ];
      case ROLES.ACCOUNTANT:
        return [
          { label: 'Unposted Entries', value: '14', icon: BookOpen, color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Cash in Bank', value: formatPHP(1250000), icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Net Surplus', value: formatPHP(452000), icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Total Assets', value: formatPHP(8750000), icon: FileBarChart, color: 'text-blue-600', bg: 'bg-blue-100' },
        ];
      case ROLES.MEMBER:
        return [
          { label: 'My Savings', value: formatPHP(user.savingsBalance || 0), icon: PiggyBank, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'My Share Capital', value: formatPHP(user.shareCapital || 0), icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Active Loan', value: formatPHP(user.loanBalance || 0), icon: HandCoins, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Credit Score', value: user.creditScore || 0, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
        ];
      default:
        return [];
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h4 className="font-bold text-slate-800 mb-6">Recent Activities</h4>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Receipt className="text-slate-500" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-800"><span className="font-semibold">Deposit Received</span> from Member Juan Dela Cruz</p>
                  <p className="text-xs text-slate-500 mt-1">2 hours ago • Savings Deposit</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">+₱1,500.00</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h4 className="font-bold text-slate-800 mb-6">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-center group">
              <div className="bg-white w-10 h-10 rounded-full mx-auto mb-2 shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white">
                <Plus size={20} />
              </div>
              <span className="text-xs font-semibold">New Loan</span>
            </button>
            <button className="p-4 bg-slate-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-center group">
              <div className="bg-white w-10 h-10 rounded-full mx-auto mb-2 shadow-sm flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white">
                <ArrowDownRight size={20} />
              </div>
              <span className="text-xs font-semibold">Deposit</span>
            </button>
            <button className="p-4 bg-slate-50 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors text-center group">
              <div className="bg-white w-10 h-10 rounded-full mx-auto mb-2 shadow-sm flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white">
                <Users size={20} />
              </div>
              <span className="text-xs font-semibold">New Member</span>
            </button>
            <button className="p-4 bg-slate-50 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors text-center group">
              <div className="bg-white w-10 h-10 rounded-full mx-auto mb-2 shadow-sm flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white">
                <FileText size={20} />
              </div>
              <span className="text-xs font-semibold">Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
