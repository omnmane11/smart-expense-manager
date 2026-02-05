import React, { useState, useEffect } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import IncomeSection from './components/IncomeSection';
import ExpenseSection from './components/ExpenseSection';
import { LedgerState, IncomeEntry, ExpenseEntry } from './types';

const App: React.FC = () => {
  // Initialize state from local storage or defaults
  const [ledgerData, setLedgerData] = useState<LedgerState>({ incomes: [], expenses: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const STORAGE_KEY = 'smartRojmelData';

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLedgerData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data");
        setLedgerData({ incomes: [], expenses: [] });
      }
    } else {
      setLedgerData({ incomes: [], expenses: [] });
    }
    setIsLoaded(true);
  }, []);

  // Save Data
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ledgerData));
    setLastSaved(new Date());
  }, [ledgerData, isLoaded]);

  const addIncome = (entry: Omit<IncomeEntry, 'id'>) => {
    const newEntry: IncomeEntry = {
      ...entry,
      id: crypto.randomUUID()
    };
    setLedgerData(prev => ({
      ...prev,
      incomes: [...prev.incomes, newEntry]
    }));
  };

  const editIncome = (id: string, updatedEntry: Omit<IncomeEntry, 'id'>) => {
    setLedgerData(prev => ({
      ...prev,
      incomes: prev.incomes.map(entry => 
        entry.id === id ? { ...updatedEntry, id } : entry
      )
    }));
  };

  const deleteIncome = (id: string) => {
    setLedgerData(prev => ({
      ...prev,
      incomes: prev.incomes.filter(i => i.id !== id)
    }));
  };

  const addExpense = (entry: Omit<ExpenseEntry, 'id'>) => {
    const newEntry: ExpenseEntry = {
      ...entry,
      id: crypto.randomUUID()
    };
    setLedgerData(prev => ({
      ...prev,
      expenses: [...prev.expenses, newEntry]
    }));
  };

  const editExpense = (id: string, updatedEntry: Omit<ExpenseEntry, 'id'>) => {
    setLedgerData(prev => ({
      ...prev,
      expenses: prev.expenses.map(entry => 
        entry.id === id ? { ...updatedEntry, id } : entry
      )
    }));
  };

  const deleteExpense = (id: string) => {
    setLedgerData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  const resetLedger = () => {
    if (confirm("Are you sure you want to clear the entire ledger? This cannot be undone.")) {
      setLedgerData({ incomes: [], expenses: [] });
    }
  };

  const totalExpense = ledgerData.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col h-screen bg-gray-200 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-3 shadow-lg shrink-0 z-20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
               <BookOpen size={24} className="text-yellow-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">SMART EXPENSE MANAGER</h1>
              <p className="text-xs text-green-200">Digital Khatavahi & Expense Manager</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full mx-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-emerald-200" />
            </div>
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-emerald-900/50 border border-emerald-600 text-white placeholder-emerald-300/50 text-sm rounded-md pl-10 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-300 focus:border-yellow-300 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-emerald-200 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={resetLedger}
              className="text-xs bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded border border-red-700 transition-colors whitespace-nowrap"
            >
              Clear Book
            </button>
          </div>
        </div>
      </header>

      {/* Main Ledger Book View */}
      <main className="flex-1 overflow-hidden p-2 md:p-4">
        <div className="h-full w-full max-w-7xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-400">
          
          {/* Left Page (Income) */}
          <div className="flex-1 h-1/2 md:h-full overflow-hidden relative">
             <IncomeSection 
               entries={ledgerData.incomes} 
               allExpenses={ledgerData.expenses}
               totalExpense={totalExpense}
               searchTerm={searchTerm}
               onAddEntry={addIncome}
               onEditEntry={editIncome}
               onDeleteEntry={deleteIncome}
             />
             <div className="hidden md:block absolute top-0 right-0 w-4 h-full bg-gradient-to-r from-transparent to-black/10 z-20 pointer-events-none"></div>
          </div>

          {/* Right Page (Expense) */}
          <div className="flex-1 h-1/2 md:h-full overflow-hidden relative">
             <div className="hidden md:block absolute top-0 left-0 w-4 h-full bg-gradient-to-l from-transparent to-black/10 z-20 pointer-events-none"></div>
             
             <ExpenseSection 
               entries={ledgerData.expenses}
               searchTerm={searchTerm}
               onAddEntry={addExpense}
               onEditEntry={editExpense}
               onDeleteEntry={deleteExpense}
             />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-xs py-1 text-center shrink-0 flex justify-center items-center gap-2">
        <span>Data auto-saved to device.</span>
        {lastSaved && <span className="text-emerald-400">Last saved: {lastSaved.toLocaleTimeString()}</span>}
      </footer>
    </div>
  );
};

export default App;