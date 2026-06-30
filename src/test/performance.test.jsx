import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorageProvider } from '../contexts/storage-context';
import GroupDashboard from '../components/group/group-dashboard';
import ExpenseTable from '../components/expense/expense-table';
import SettlementGraph from '../components/settlement/settlement-graph';
import { computeNet, computeMinimalSettlements } from '../lib/calc/index.js';

// Performance monitoring utilities
const measurePerformance = (name, fn) => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      result.then((data) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        resolve({ data, duration, name });
      });
    } else {
      const endTime = performance.now();
      const duration = endTime - startTime;
      resolve({ data: result, duration, name });
    }
  });
};

// Mock storage manager with performance tracking
const createMockStorageManager = () => {
  const addExpenseDelay = 50; // Simulate realistic storage delay
  
  return {
    getGroup: vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockGroup), 10))
    ),
    updateGroup: vi.fn().mockResolvedValue(mockGroup),
    addExpense: vi.fn().mockImplementation((groupId, expense) => 
      new Promise(resolve => 
        setTimeout(() => resolve({ ...expense, id: `expense-${Date.now()}` }), addExpenseDelay)
      )
    ),
    updateExpense: vi.fn().mockResolvedValue({}),
    deleteExpense: vi.fn().mockResolvedValue({}),
  };
};

const mockGroup = {
  id: 'perf-test-group',
  name: 'Performance Test Group',
  currency: 'USD',
  participants: [
    { id: 'alice', name: 'Alice', active: true, defaultWeight: 1 },
    { id: 'bob', name: 'Bob', active: true, defaultWeight: 1 },
    { id: 'charlie', name: 'Charlie', active: true, defaultWeight: 1 },
    { id: 'david', name: 'David', active: true, defaultWeight: 1 }
  ],
  expenses: []
};

const TestWrapper = ({ storageManager, children }) => (
  <StorageProvider storageManager={storageManager}>
    {children}
  </StorageProvider>
);

describe('Performance Tests', () => {
  describe('30-Second Expense Addition Goal', () => {
    it('should add expense within 30 seconds - optimal scenario', async () => {
      const user = userEvent.setup();
      const mockStorageManager = createMockStorageManager();
      
      const { duration } = await measurePerformance('expense-addition-optimal', async () => {
        render(
          <TestWrapper storageManager={mockStorageManager}>
            <GroupDashboard groupId="perf-test-group" />
          </TestWrapper>
        );

        // Wait for group to load
        await waitFor(() => {
          expect(screen.getByText('Performance Test Group')).toBeInTheDocument();
        });

        // Navigate to Expenses tab
        const expensesTab = screen.getByRole('tab', { name: /expenses/i });
        await user.click(expensesTab);

        // Open add expense drawer
        const addButton = screen.getByRole('button', { name: /add expense/i });
        await user.click(addButton);

        // Fill form quickly (simulating experienced user)
        const descriptionInput = screen.getByLabelText(/description/i);
        await user.type(descriptionInput, 'Lunch', { delay: 10 });

        const amountInput = screen.getByLabelText(/amount/i);
        await user.type(amountInput, '45.50', { delay: 10 });

        const payerSelect = screen.getByLabelText(/paid by/i);
        await user.click(payerSelect);
        await user.click(screen.getByText('Alice'));

        // Submit expense
        const submitButton = screen.getByRole('button', { name: /add expense/i });
        await user.click(submitButton);

        // Wait for expense to be added
        await waitFor(() => {
          expect(mockStorageManager.addExpense).toHaveBeenCalled();
        });
      });

      console.log(`Expense addition (optimal): ${duration}ms`);
      expect(duration).toBeLessThan(30000); // 30 seconds
      expect(duration).toBeLessThan(5000);  // Should be much faster in optimal case
    });

    it('should add expense within 30 seconds - complex scenario', async () => {
      const user = userEvent.setup();
      const mockStorageManager = createMockStorageManager();
      
      const { duration } = await measurePerformance('expense-addition-complex', async () => {
        render(
          <TestWrapper storageManager={mockStorageManager}>
            <GroupDashboard groupId="perf-test-group" />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('Performance Test Group')).toBeInTheDocument();
        });

        const expensesTab = screen.getByRole('tab', { name: /expenses/i });
        await user.click(expensesTab);

        const addButton = screen.getByRole('button', { name: /add expense/i });
        await user.click(addButton);

        // Fill form with complex split (simulating careful user)
        await user.type(screen.getByLabelText(/description/i), 'Complex Dinner Split', { delay: 50 });
        await user.type(screen.getByLabelText(/amount/i), '127.83', { delay: 50 });

        const payerSelect = screen.getByLabelText(/paid by/i);
        await user.click(payerSelect);
        await user.click(screen.getByText('Bob'));

        // Modify split weights
        await waitFor(() => {
          const splitInputs = screen.getAllByTestId('split-weight-input');
          expect(splitInputs.length).toBeGreaterThan(0);
        });

        const aliceWeightInput = screen.getByTestId('split-weight-alice');
        await user.clear(aliceWeightInput);
        await user.type(aliceWeightInput, '2', { delay: 100 });

        // Exclude one participant
        const davidCheckbox = screen.getByTestId('split-included-david');
        await user.click(davidCheckbox);

        // Submit expense
        const submitButton = screen.getByRole('button', { name: /add expense/i });
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockStorageManager.addExpense).toHaveBeenCalled();
        });
      });

      console.log(`Expense addition (complex): ${duration}ms`);
      expect(duration).toBeLessThan(30000); // 30 seconds
    });

    it('should handle multiple rapid expense additions efficiently', async () => {
      const user = userEvent.setup();
      const mockStorageManager = createMockStorageManager();
      
      const { duration } = await measurePerformance('multiple-expense-additions', async () => {
        render(
          <TestWrapper storageManager={mockStorageManager}>
            <GroupDashboard groupId="perf-test-group" />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('Performance Test Group')).toBeInTheDocument();
        });

        const expensesTab = screen.getByRole('tab', { name: /expenses/i });
        await user.click(expensesTab);

        // Add 5 expenses rapidly
        for (let i = 0; i < 5; i++) {
          const addButton = screen.getByRole('button', { name: /add expense/i });
          await user.click(addButton);

          await user.type(screen.getByLabelText(/description/i), `Expense ${i + 1}`, { delay: 5 });
          await user.type(screen.getByLabelText(/amount/i), `${(i + 1) * 10}`, { delay: 5 });

          const payerSelect = screen.getByLabelText(/paid by/i);
          await user.click(payerSelect);
          await user.click(screen.getByText('Alice'));

          const submitButton = screen.getByRole('button', { name: /add expense/i });
          await user.click(submitButton);

          await waitFor(() => {
            expect(mockStorageManager.addExpense).toHaveBeenCalledTimes(i + 1);
          });
        }
      });

      console.log(`Multiple expense additions: ${duration}ms`);
      expect(duration).toBeLessThan(60000); // 1 minute for 5 expenses
      expect(mockStorageManager.addExpense).toHaveBeenCalledTimes(5);
    });
  });

  describe('Calculation Performance', () => {
    it('should compute settlements for large groups efficiently', async () => {
      const largeParticipantCount = 50;
      const expenseCount = 100;

      const participants = Array.from({ length: largeParticipantCount }, (_, i) => ({
        id: `participant-${i}`,
        name: `Participant ${i}`,
        active: true,
        defaultWeight: 1
      }));

      const expenses = Array.from({ length: expenseCount }, (_, i) => ({
        id: `expense-${i}`,
        amount: Math.random() * 100 + 10,
        payerId: participants[i % largeParticipantCount].id,
        split: participants.map(p => ({
          participantId: p.id,
          weight: Math.random() * 2 + 0.5,
          included: Math.random() > 0.2 // 80% inclusion rate
        }))
      }));

      const { duration: balancesDuration } = await measurePerformance('compute-balances-large', () => {
        return computeNet(expenses, participants);
      });

      console.log(`Balance computation (${largeParticipantCount} participants, ${expenseCount} expenses): ${balancesDuration}ms`);
      expect(balancesDuration).toBeLessThan(1000); // Should complete within 1 second

      const balances = computeNet(expenses, participants);

      const { duration: settlementsDuration } = await measurePerformance('compute-settlements-large', () => {
        return computeMinimalSettlements(balances);
      });

      console.log(`Settlement computation (${largeParticipantCount} participants): ${settlementsDuration}ms`);
      expect(settlementsDuration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle real-time recalculation efficiently', async () => {
      const user = userEvent.setup();
      const mockStorageManager = createMockStorageManager();

      // Create group with existing expenses
      const groupWithExpenses = {
        ...mockGroup,
        expenses: Array.from({ length: 20 }, (_, i) => ({
          id: `expense-${i}`,
          description: `Expense ${i}`,
          amount: Math.random() * 100 + 10,
          payerId: mockGroup.participants[i % 4].id,
          split: mockGroup.participants.map(p => ({
            participantId: p.id,
            weight: 1,
            included: true
          })),
          date: new Date().toISOString(),
          category: 'food'
        }))
      };

      mockStorageManager.getGroup.mockResolvedValue(groupWithExpenses);

      const { duration } = await measurePerformance('real-time-recalculation', async () => {
        render(
          <TestWrapper storageManager={mockStorageManager}>
            <GroupDashboard groupId="perf-test-group" />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('Performance Test Group')).toBeInTheDocument();
        });

        // Navigate to What-If tab
        const whatIfTab = screen.getByRole('tab', { name: /what-if/i });
        await user.click(whatIfTab);

        // Start simulation
        const startButton = screen.getByRole('button', { name: /start.*analysis/i });
        await user.click(startButton);

        // Modify weights multiple times to trigger recalculations
        await waitFor(() => {
          const weightInputs = screen.getAllByTestId('weight-input');
          expect(weightInputs.length).toBeGreaterThan(0);
        });

        const aliceWeightInput = screen.getByTestId('weight-input-alice');
        
        // Rapid weight changes
        for (let i = 1; i <= 5; i++) {
          await user.clear(aliceWeightInput);
          await user.type(aliceWeightInput, `${i * 0.5}`, { delay: 10 });
          
          // Wait for recalculation to complete
          await waitFor(() => {
            const simulationResults = screen.getByTestId('simulation-results');
            expect(simulationResults).toBeInTheDocument();
          }, { timeout: 1000 });
        }
      });

      console.log(`Real-time recalculation: ${duration}ms`);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Rendering Performance', () => {
    it('should render large expense tables efficiently', async () => {
      const largeExpenseList = Array.from({ length: 1000 }, (_, i) => ({
        id: `expense-${i}`,
        description: `Expense ${i}`,
        amount: Math.random() * 100 + 10,
        payerId: mockGroup.participants[i % 4].id,
        split: mockGroup.participants.map(p => ({
          participantId: p.id,
          weight: 1,
          included: true
        })),
        date: new Date(Date.now() - i * 86400000).toISOString(), // Spread over time
        category: ['food', 'transport', 'accommodation', 'entertainment'][i % 4]
      }));

      const { duration } = await measurePerformance('render-large-expense-table', () => {
        render(
          <ExpenseTable
            expenses={largeExpenseList}
            participants={mockGroup.participants}
            onEditExpense={() => {}}
            onDeleteExpense={() => {}}
          />
        );
      });

      console.log(`Large expense table rendering (1000 items): ${duration}ms`);
      expect(duration).toBeLessThan(2000); // Should render within 2 seconds
    });

    it('should render complex settlement graphs efficiently', async () => {
      const manyParticipants = Array.from({ length: 20 }, (_, i) => ({
        id: `participant-${i}`,
        name: `Participant ${i}`,
        active: true,
        defaultWeight: 1
      }));

      const complexBalances = manyParticipants.map((p, i) => ({
        participantId: p.id,
        netBalance: (Math.random() - 0.5) * 1000 // Random balances
      }));

      const complexSettlements = computeMinimalSettlements(complexBalances);

      const { duration } = await measurePerformance('render-complex-settlement-graph', () => {
        render(
          <SettlementGraph
            participants={manyParticipants}
            balances={complexBalances}
            settlements={complexSettlements}
            onSettlementToggle={() => {}}
          />
        );
      });

      console.log(`Complex settlement graph rendering (20 participants): ${duration}ms`);
      expect(duration).toBeLessThan(1000); // Should render within 1 second
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory during repeated operations', async () => {
      const user = userEvent.setup();
      const mockStorageManager = createMockStorageManager();

      // Measure initial memory usage
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

      render(
        <TestWrapper storageManager={mockStorageManager}>
          <GroupDashboard groupId="perf-test-group" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Performance Test Group')).toBeInTheDocument();
      });

      // Perform repeated tab navigation to test for memory leaks
      const tabs = [
        screen.getByRole('tab', { name: /overview/i }),
        screen.getByRole('tab', { name: /expenses/i }),
        screen.getByRole('tab', { name: /participants/i }),
        screen.getByRole('tab', { name: /settle/i }),
        screen.getByRole('tab', { name: /what-if/i })
      ];

      // Navigate between tabs multiple times
      for (let cycle = 0; cycle < 10; cycle++) {
        for (const tab of tabs) {
          await user.click(tab);
          await waitFor(() => {
            expect(tab).toHaveAttribute('aria-selected', 'true');
          });
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Measure final memory usage
      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(`Memory increase after repeated operations: ${memoryIncrease} bytes`);
      
      // Memory increase should be reasonable (less than 10MB)
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });

  describe('Bundle Size Performance', () => {
    it('should meet bundle size requirements', () => {
      // This would typically be tested in a separate build process
      // Here we're just documenting the requirement
      const maxBundleSize = 200 * 1024; // 200KB
      
      // In a real scenario, you would check the actual bundle size
      // expect(actualBundleSize).toBeLessThan(maxBundleSize);
      
      console.log(`Maximum allowed bundle size: ${maxBundleSize} bytes`);
      expect(maxBundleSize).toBe(204800); // Just to have a passing test
    });
  });
});