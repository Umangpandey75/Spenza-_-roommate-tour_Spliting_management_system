import React from 'react';

export const ExpenseTable = React.memo(function ExpenseTable({ expenses = [], onEdit, onDelete }) {
  return (
    <div className="space-y-3 sm:space-y-0">
      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{expense.description}</h3>
                <p className="text-sm text-muted-foreground">{expense.category}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="font-semibold text-foreground">{expense.amount}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(expense)} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium min-h-[44px] transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(expense)} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium min-h-[44px] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto rounded-lg bg-card border border-border">
        <table className="min-w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-muted/25 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground">{expense.description}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{expense.amount}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{expense.category}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onEdit(expense)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(expense)} 
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
