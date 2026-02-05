import React, { useState, useMemo } from 'react';
import { Plus, Trash2, IndianRupee, Pencil, Check, X } from 'lucide-react';
import { IncomeEntry, ExpenseEntry, IncomeCategory, CURRENCY_FORMATTER, formatDateDisplay } from '../types';

interface IncomeSectionProps {
  entries: IncomeEntry[];
  allExpenses: ExpenseEntry[];
  totalExpense: number;
  searchTerm: string;
  onAddEntry: (entry: Omit<IncomeEntry, 'id'>) => void;
  onEditEntry: (id: string, entry: Omit<IncomeEntry, 'id'>) => void;
  onDeleteEntry: (id: string) => void;
}

const IncomeSection: React.FC<IncomeSectionProps> = ({ 
  entries, 
  allExpenses,
  totalExpense, 
  searchTerm,
  onAddEntry, 
  onEditEntry,
  onDeleteEntry 
}) => {
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [categoryInput, setCategoryInput] = useState<string>(IncomeCategory.AGRICULTURE);
  const [amountInput, setAmountInput] = useState<string>('');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalIncome = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const remainingBalance = totalIncome - totalExpense;

  const startEditing = (entry: IncomeEntry) => {
    setEditingId(entry.id);
    setDateInput(entry.date);
    setCategoryInput(entry.category);
    setAmountInput(entry.amount.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDateInput(new Date().toISOString().split('T')[0]);
    setCategoryInput(IncomeCategory.AGRICULTURE);
    setAmountInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput) return;

    const entryData = {
      date: dateInput,
      category: categoryInput,
      amount: parseFloat(amountInput)
    };

    if (editingId) {
      onEditEntry(editingId, entryData);
      setEditingId(null);
      setDateInput(new Date().toISOString().split('T')[0]);
      setCategoryInput(IncomeCategory.AGRICULTURE);
      setAmountInput('');
    } else {
      onAddEntry(entryData);
      setAmountInput('');
    }
  };

  const allDates = useMemo(() => {
    const dates = new Set([...entries.map(e => e.date), ...allExpenses.map(e => e.date)]);
    return Array.from(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [entries, allExpenses]);

  const monthlyIncomeMap = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(e => {
      const monthKey = e.date.substring(0, 7);
      map.set(monthKey, (map.get(monthKey) || 0) + e.amount);
    });
    return map;
  }, [entries]);

  const matchesSearch = (entry: IncomeEntry) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const formattedDate = formatDateDisplay(entry.date);
    return (
      entry.date.toLowerCase().includes(term) ||
      formattedDate.includes(term) ||
      entry.category.toLowerCase().includes(term) ||
      entry.amount.toString().includes(term)
    );
  };

  let runningBalance = 0;
  let srNoCounter = 1;

  return (
    <div className="flex flex-col h-full bg-ledger-paper border-r-4 border-double border-ledger-header/20 relative">
      <div className="bg-ledger-header text-white p-3 text-center shadow-md z-10">
        <h2 className="text-xl font-bold tracking-wider flex items-center justify-center gap-2">
          <IndianRupee size={20} /> INCOME (JAMA)
        </h2>
      </div>

      <div className="grid grid-cols-12 bg-ledger-line text-ledger-text font-bold text-sm border-b border-ledger-header sticky top-0 z-20">
        <div className="col-span-1 p-2 border-r border-ledger-header text-center">Sr No.</div>
        <div className="col-span-2 p-2 border-r border-ledger-header text-center">Date</div>
        <div className="col-span-4 p-2 border-r border-ledger-header text-center">Category</div>
        <div className="col-span-2 p-2 border-r border-ledger-header text-center">Amount</div>
        <div className="col-span-3 p-2 text-center">Total Amount</div>
      </div>

      <div className="flex-1 overflow-y-auto ledger-scroll relative">
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{ 
               backgroundImage: 'linear-gradient(#15803d 1px, transparent 1px), linear-gradient(90deg, #15803d 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        {allDates.length === 0 ? (
          <div className="p-8 text-center text-ledger-text/50 italic">
            No entries recorded yet.
          </div>
        ) : (
          allDates.map((date, dateIndex) => {
            const dateIncomes = entries.filter(e => e.date === date);
            const dateExpenses = allExpenses.filter(e => e.date === date);
            
            const dayIncomeSum = dateIncomes.reduce((sum, e) => sum + e.amount, 0);
            const dayExpenseSum = dateExpenses.reduce((sum, e) => sum + e.amount, 0);
            
            const openingBalance = runningBalance;
            runningBalance = runningBalance + dayIncomeSum - dayExpenseSum;
            const closingBalance = runningBalance;

            const currentMonth = date.substring(0, 7);
            const nextDate = allDates[dateIndex + 1];
            const nextMonth = nextDate ? nextDate.substring(0, 7) : null;
            const isLastDayOfRecordedMonth = currentMonth !== nextMonth;

            const visibleIncomes = dateIncomes.filter(matchesSearch);

            return (
              <React.Fragment key={date}>
                <div className="grid grid-cols-12 border-b border-ledger-line/50 bg-yellow-50/50 text-ledger-text text-sm italic">
                  <div className="col-span-1 p-2 border-r border-ledger-line"></div>
                  <div className="col-span-2 p-2 border-r border-ledger-line font-mono text-xs text-center font-bold">
                    {formatDateDisplay(date)}
                  </div>
                  <div className="col-span-4 p-2 border-r border-ledger-line text-ledger-text/70 px-3">
                    Opening Balance b/f
                  </div>
                  <div className="col-span-2 p-2 border-r border-ledger-line font-mono text-right px-3 text-ledger-text/70">
                    {CURRENCY_FORMATTER.format(openingBalance)}
                  </div>
                  <div className="col-span-3 p-2 border-ledger-line"></div>
                </div>

                {visibleIncomes.map((entry, idx) => {
                  const isLastEntryOfDate = idx === visibleIncomes.length - 1;
                  // Date is bold only if it's the first income entry shown for this date block
                  const isBoldDate = idx === 0;
                  
                  return (
                    <div key={entry.id} className={`grid grid-cols-12 border-b border-ledger-line text-ledger-text hover:bg-ledger-highlight transition-colors group text-sm relative ${editingId === entry.id ? 'bg-yellow-100 ring-2 ring-inset ring-yellow-400' : ''}`}>
                      <div className="col-span-1 p-2 border-r border-ledger-line flex items-center justify-center font-mono text-xs">
                        {srNoCounter++}
                      </div>
                      <div className={`col-span-2 p-2 border-r border-ledger-line flex items-center justify-center font-mono text-xs ${isBoldDate ? 'font-bold' : 'font-normal opacity-50'}`}>
                        {formatDateDisplay(entry.date)}
                      </div>
                      <div className="col-span-4 p-2 border-r border-ledger-line flex items-center truncate px-3">
                        {entry.category}
                      </div>
                      <div className="col-span-2 p-2 border-r border-ledger-line flex items-center justify-end font-mono font-medium px-3">
                        {CURRENCY_FORMATTER.format(entry.amount)}
                      </div>
                      <div className="col-span-3 p-2 flex items-center justify-between font-mono font-bold px-3 bg-ledger-header/5">
                        <span className="text-ledger-header">
                          {isLastEntryOfDate && !searchTerm ? CURRENCY_FORMATTER.format(dayIncomeSum) : ''}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditing(entry)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => onDeleteEntry(entry.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-ledger-header/10 border-b-2 border-ledger-header text-ledger-text text-sm font-bold px-4 py-1 flex justify-between items-center">
                  <span className="uppercase text-xs tracking-wider">Closing Balance ({formatDateDisplay(date)}):</span>
                  <div className="flex gap-4 text-xs font-normal opacity-75">
                    <span>(Op: {Math.round(openingBalance)} + Inc: {Math.round(dayIncomeSum)} - Exp: {Math.round(dayExpenseSum)})</span>
                  </div>
                  <span className="font-mono text-base">{CURRENCY_FORMATTER.format(closingBalance)}</span>
                </div>

                {isLastDayOfRecordedMonth && (
                  <div className="bg-ledger-header text-white border-b-4 border-double border-white text-sm font-bold px-4 py-2 flex justify-between items-center shadow-inner">
                    <span className="uppercase tracking-widest">Total Income ({new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' })}):</span>
                    <span className="font-mono text-lg">{CURRENCY_FORMATTER.format(monthlyIncomeMap.get(currentMonth) || 0)}</span>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      <div className={`border-t border-ledger-header shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 transition-colors ${editingId ? 'bg-yellow-50' : 'bg-white'}`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-2 p-2 bg-ledger-highlight border-b border-ledger-line items-center">
          <div className="col-span-1 flex justify-center text-ledger-text/50">
            {editingId ? <Pencil size={16} className="text-blue-600" /> : <Plus size={16} />}
          </div>
          <div className="col-span-2">
            <input 
              type="date" 
              required
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full bg-white text-black border border-ledger-line rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ledger-header placeholder-gray-500"
            />
          </div>
          <div className="col-span-4">
            <select 
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="w-full bg-white text-black border border-ledger-line rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ledger-header"
            >
              {Object.values(IncomeCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <input 
              type="number" 
              placeholder="Amount"
              required
              min="0"
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-white text-black border border-ledger-line rounded px-1 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ledger-header text-right placeholder-gray-500"
            />
          </div>
           <div className="col-span-3 flex justify-end gap-1">
             {editingId ? (
               <>
                 <button type="button" onClick={cancelEditing} className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 flex items-center gap-1">
                    <X size={12} /> Cancel
                 </button>
                 <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1">
                    <Check size={12} /> Update
                 </button>
               </>
             ) : (
               <button type="submit" className="bg-ledger-header text-white px-4 py-1 rounded text-xs hover:bg-ledger-text">Add</button>
             )}
           </div>
        </form>

        <div className="p-4 space-y-2 bg-ledger-paper">
          <div className="flex justify-between items-center text-ledger-text text-sm">
             <span>Total Income (All Time):</span>
             <span className="font-mono font-bold">{CURRENCY_FORMATTER.format(totalIncome)}</span>
          </div>
          <div className="flex justify-between items-center text-red-600 text-sm">
             <span>Less Total Expenditure (All Time):</span>
             <span className="font-mono font-medium">({CURRENCY_FORMATTER.format(totalExpense)})</span>
          </div>
          <div className="h-px bg-ledger-header w-full my-1"></div>
          <div className="flex justify-between items-center text-lg font-bold text-ledger-header bg-ledger-line/30 p-2 rounded border border-ledger-header">
             <span>NET BALANCE:</span>
             <span className="font-mono">{CURRENCY_FORMATTER.format(remainingBalance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeSection;