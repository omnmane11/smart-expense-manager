import React, { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingDown, Pencil, Check, X } from 'lucide-react';
import { ExpenseEntry, CURRENCY_FORMATTER, formatDateDisplay } from '../types';

interface ExpenseSectionProps {
  entries: ExpenseEntry[];
  searchTerm: string;
  onAddEntry: (entry: Omit<ExpenseEntry, 'id'>) => void;
  onEditEntry: (id: string, entry: Omit<ExpenseEntry, 'id'>) => void;
  onDeleteEntry: (id: string) => void;
}

const ExpenseSection: React.FC<ExpenseSectionProps> = ({ 
  entries, 
  searchTerm,
  onAddEntry, 
  onEditEntry,
  onDeleteEntry 
}) => {
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [descInput, setDescInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const totalExpense = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const startEditing = (entry: ExpenseEntry) => {
    setEditingId(entry.id);
    setDateInput(entry.date);
    setDescInput(entry.description);
    setAmountInput(entry.amount.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDateInput(new Date().toISOString().split('T')[0]);
    setDescInput('');
    setAmountInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || !descInput) return;

    const entryData = {
      date: dateInput,
      description: descInput,
      amount: parseFloat(amountInput)
    };

    if (editingId) {
      onEditEntry(editingId, entryData);
      setEditingId(null);
      setDateInput(new Date().toISOString().split('T')[0]);
      setDescInput('');
      setAmountInput('');
    } else {
      onAddEntry(entryData);
      setAmountInput('');
      setDescInput('');
    }
  };

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries]);

  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(entry => {
      map.set(entry.date, (map.get(entry.date) || 0) + entry.amount);
    });
    return map;
  }, [entries]);

  const monthlyTotals = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(entry => {
      const monthKey = entry.date.substring(0, 7);
      map.set(monthKey, (map.get(monthKey) || 0) + entry.amount);
    });
    return map;
  }, [entries]);

  const visibleEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (!searchTerm) return sorted;
    const term = searchTerm.toLowerCase();
    return sorted.filter(entry => {
      const formattedDate = formatDateDisplay(entry.date);
      return (
        entry.date.toLowerCase().includes(term) ||
        formattedDate.includes(term) ||
        entry.description.toLowerCase().includes(term) ||
        entry.amount.toString().includes(term)
      );
    });
  }, [entries, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-ledger-paper relative">
      <div className="bg-red-700 text-white p-3 text-center shadow-md z-10">
        <h2 className="text-xl font-bold tracking-wider flex items-center justify-center gap-2">
          <TrendingDown size={20} /> EXPENDITURE (KHARCH)
        </h2>
      </div>

      <div className="grid grid-cols-12 bg-red-100 text-red-900 font-bold text-sm border-b border-red-300 sticky top-0 z-20">
        <div className="col-span-1 p-2 border-r border-red-300 text-center">Sr No.</div>
        <div className="col-span-2 p-2 border-r border-red-300 text-center">Date</div>
        <div className="col-span-4 p-2 border-r border-red-300 text-center">Expenditure</div>
        <div className="col-span-2 p-2 border-r border-red-300 text-center">Amount</div>
        <div className="col-span-3 p-2 text-center">Total</div>
      </div>

      <div className="flex-1 overflow-y-auto ledger-scroll relative">
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{ 
               backgroundImage: 'linear-gradient(#b91c1c 1px, transparent 1px), linear-gradient(90deg, #b91c1c 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        {visibleEntries.length === 0 ? (
          <div className="p-8 text-center text-red-900/50 italic">
            {searchTerm ? 'No matching expenses found.' : 'No expenses recorded yet.'}
          </div>
        ) : (
          visibleEntries.map((entry, index) => {
            const isStartOfNewDay = index === 0 || visibleEntries[index - 1].date !== entry.date;
            const fullListIndex = sortedEntries.findIndex(e => e.id === entry.id);
            const isLastForDateInFullList = fullListIndex === sortedEntries.length - 1 || sortedEntries[fullListIndex + 1].date !== entry.date;
            
            const dailyTotal = dailyTotals.get(entry.date) || 0;
            const currentMonth = entry.date.substring(0, 7);
            const nextEntry = sortedEntries[fullListIndex + 1];
            const nextMonth = nextEntry ? nextEntry.date.substring(0, 7) : null;
            const isLastForMonth = currentMonth !== nextMonth;

            return (
              <React.Fragment key={entry.id}>
                <div className={`grid grid-cols-12 border-b border-red-200 text-red-900 hover:bg-red-50 transition-colors group text-sm ${editingId === entry.id ? 'bg-yellow-100 ring-2 ring-inset ring-yellow-400' : ''}`}>
                  <div className="col-span-1 p-2 border-r border-red-200 flex items-center justify-center font-mono text-xs">
                    {index + 1}
                  </div>
                  <div className={`col-span-2 p-2 border-r border-red-200 flex items-center justify-center font-mono text-xs ${isStartOfNewDay ? 'font-bold' : 'font-normal opacity-50'}`}>
                    {formatDateDisplay(entry.date)}
                  </div>
                  <div className="col-span-4 p-2 border-r border-red-200 flex items-center px-3 break-all">
                    {entry.description}
                  </div>
                  <div className="col-span-2 p-2 border-r border-red-200 flex items-center justify-end font-mono font-medium px-3">
                    {CURRENCY_FORMATTER.format(entry.amount)}
                  </div>
                  <div className="col-span-3 p-2 flex items-center justify-between font-mono font-bold px-3 bg-red-100/30">
                    <span className="text-red-700">
                      {isLastForDateInFullList && !searchTerm ? CURRENCY_FORMATTER.format(dailyTotal) : ''}
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

                {isLastForMonth && !searchTerm && (
                   <div className="bg-red-700 text-white border-b-4 border-double border-white text-sm font-bold px-4 py-2 flex justify-between items-center shadow-inner">
                    <span className="uppercase tracking-widest">Total Expenditure ({new Date(entry.date).toLocaleString('default', { month: 'long', year: 'numeric' })}):</span>
                    <span className="font-mono text-lg">{CURRENCY_FORMATTER.format(monthlyTotals.get(currentMonth) || 0)}</span>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      <div className={`border-t border-red-300 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 transition-colors ${editingId ? 'bg-yellow-50' : 'bg-white'}`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-2 p-2 bg-red-50 border-b border-red-200 items-center">
          <div className="col-span-1 flex justify-center text-red-900/50">
            {editingId ? <Pencil size={16} className="text-blue-600" /> : <Plus size={16} />}
          </div>
          <div className="col-span-2">
            <input 
              type="date" 
              required
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full bg-white text-black border border-red-300 rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-gray-500"
            />
          </div>
          <div className="col-span-4">
            <input 
              type="text" 
              placeholder="Description"
              required
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              className="w-full bg-white text-black border border-red-300 rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-gray-500"
            />
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
              className="w-full bg-white text-black border border-red-300 rounded px-1 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-red-600 text-right placeholder-gray-500"
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
                <button type="submit" className="bg-red-700 text-white px-4 py-1 rounded text-xs hover:bg-red-800">Add</button>
             )}
          </div>
        </form>

        <div className="p-4 space-y-2 bg-ledger-paper">
           <div className="flex justify-between items-center text-red-900 text-sm">
             <span>Total Expenditure (All Time):</span>
             <span className="font-mono font-bold text-lg">{CURRENCY_FORMATTER.format(totalExpense)}</span>
          </div>
          <div className="h-px bg-transparent w-full my-1"></div>
           <div className="p-2 opacity-0">
             <span>Spacer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSection;