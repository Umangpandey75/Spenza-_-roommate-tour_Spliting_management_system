import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorageProvider } from '../../contexts/storage-context';
import App from '../../app';

// Mock the storage manager with full functionality
const mockStorageManager = {
  getAllGroups: vi.fn(),
  getGroup: vi.fn(),
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  addExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  addParticipant: vi.fn(),
  updateParticipant: vi.fn(),
  removeParticipant: vi.fn(),
};

const TestWrapper = ({ children }) => (
  <StorageProvider storageManager={mockStorageManager}>
    {children}
  </StorageProvider>
);

describe('Critical User Journey End-to-End Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageManager.getAllGroups.mockResolvedValue([]);
  });

  it('should complete full journey: create group → add expenses → generate settlements', async () => {
    const user = userEvent.setup();
    
    // Mock progressive responses as user creates data
    let createdGroup = null;
    let groupExpenses = [];

    mockStorageManager.createGroup.mockImplementation((group) => {
      createdGroup = { ...group, id: 'new-group-id' };
      return Promise.resolve(createdGroup);
    });

    mockStorageManager.getGroup.mockImplementation(() => {
      return Promise.resolve({
        ...createdGroup,
        expenses: groupExpenses
      });
    });

    mockStorageManager.addExpense.mockImplementation((groupId, expense) => {
      const newExpense = { ...expense, id: `expense-${groupExpenses.length + 1}` };
      groupExpenses.push(newExpense);
      return Promise.resolve(newExpense);
    });

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Step 1: Create a new group
    const createGroupButton = screen.getByRole('button', { name: /create new group/i });
    await user.click(createGroupButton);

    // Fill group creation form
    const groupNameInput = screen.getByLabelText(/group name/i);
    await user.type(groupNameInput, 'Weekend Trip');

    const currencySelect = screen.getByLabelText(/currency/i);
    await user.click(currencySelect);
    await user.click(screen.getByText('USD'));

    // Add participants
    const participant1Input = screen.getByLabelText(/participant 1/i);
    await user.type(participant1Input, 'Alice');

    const participant2Input = screen.getByLabelText(/participant 2/i);
    await user.type(participant2Input, 'Bob');

    const addParticipantButton = screen.getByRole('button', { name: /add participant/i });
    await user.click(addParticipantButton);

    const participant3Input = screen.getByLabelText(/participant 3/i);
    await user.type(participant3Input, 'Charlie');

    // Create the group
    const createButton = screen.getByRole('button', { name: /create group/i });
    await user.click(createButton);

    // Verify group was created
    await waitFor(() => {
      expect(mockStorageManager.createGroup).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Weekend Trip',
          currency: 'USD',
          participants: expect.arrayContaining([
            expect.objectContaining({ name: 'Alice' }),
            expect.objectContaining({ name: 'Bob' }),
            expect.objectContaining({ name: 'Charlie' })
          ])
        })
      );
    });

    // Step 2: Add multiple expenses
    await waitFor(() => {
      expect(screen.getByText('Weekend Trip')).toBeInTheDocument();
    });

    // Navigate to Expenses tab
    const expensesTab = screen.getByRole('tab', { name: /expenses/i });
    await user.click(expensesTab);

    // Add first expense - Hotel (paid by Alice, split equally)
    const addExpenseButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(addExpenseButton);

    await user.type(screen.getByLabelText(/description/i), 'Hotel');
    await user.type(screen.getByLabelText(/amount/i), '300');
    
    const payerSelect = screen.getByLabelText(/paid by/i);
    await user.click(payerSelect);
    await user.click(screen.getByText('Alice'));

    let submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockStorageManager.addExpense).toHaveBeenCalledWith(
        'new-group-id',
        expect.objectContaining({
          description: 'Hotel',
          amount: 300,
          payerId: expect.any(String)
        })
      );
    });

    // Add second expense - Dinner (paid by Bob, Charlie excluded)
    await user.click(addExpenseButton);

    await user.type(screen.getByLabelText(/description/i), 'Dinner');
    await user.type(screen.getByLabelText(/amount/i), '120');
    
    await user.click(screen.getByLabelText(/paid by/i));
    await user.click(screen.getByText('Bob'));

    // Exclude Charlie from dinner
    const charlieCheckbox = screen.getByTestId('split-included-charlie');
    await user.click(charlieCheckbox);

    submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    // Add third expense - Gas (paid by Charlie, weighted split)
    await user.click(addExpenseButton);

    await user.type(screen.getByLabelText(/description/i), 'Gas');
    await user.type(screen.getByLabelText(/amount/i), '80');
    
    await user.click(screen.getByLabelText(/paid by/i));
    await user.click(screen.getByText('Charlie'));

    // Set Alice's weight to 2 (she drove more)
    const aliceWeightInput = screen.getByTestId('split-weight-alice');
    await user.clear(aliceWeightInput);
    await user.type(aliceWeightInput, '2');

    submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    // Step 3: Generate and verify settlements
    const settleTab = screen.getByRole('tab', { name: /settle/i });
    await user.click(settleTab);

    // Verify settlement calculations are displayed
    await waitFor(() => {
      // Should show balance cards for each participant
      expect(screen.getByTestId('balance-card-alice')).toBeInTheDocument();
      expect(screen.getByTestId('balance-card-bob')).toBeInTheDocument();
      expect(screen.getByTestId('balance-card-charlie')).toBeInTheDocument();

      // Should show settlement transfers
      const transferList = screen.getByTestId('transfer-list');
      expect(transferList).toBeInTheDocument();
    });

    // Verify settlement graph is interactive
    const settlementGraph = screen.getByTestId('settlement-graph');
    expect(settlementGraph).toBeInTheDocument();

    // Test settlement interaction
    const transferItems = screen.getAllByTestId(/transfer-item-/);
    expect(transferItems.length).toBeGreaterThan(0);

    // Mark a settlement as completed
    const firstTransferCheckbox = screen.getByTestId('transfer-completed-0');
    await user.click(firstTransferCheckbox);

    // Verify settlement state updates
    await waitFor(() => {
      expect(firstTransferCheckbox).toBeChecked();
    });

    // Step 4: Test What-If Analysis
    const whatIfTab = screen.getByRole('tab', { name: /what-if/i });
    await user.click(whatIfTab);

    // Start simulation
    const startSimulationButton = screen.getByRole('button', { name: /start.*analysis/i });
    await user.click(startSimulationButton);

    // Modify participant weights
    await waitFor(() => {
      const weightInputs = screen.getAllByTestId('weight-input');
      expect(weightInputs.length).toBeGreaterThan(0);
    });

    const aliceWeightSimInput = screen.getByTestId('weight-input-alice');
    await user.clear(aliceWeightSimInput);
    await user.type(aliceWeightSimInput, '1.5');

    // Verify simulation updates
    await waitFor(() => {
      const simulationResults = screen.getByTestId('simulation-results');
      expect(simulationResults).toBeInTheDocument();
    });

    // Step 5: Test export functionality
    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    const csvExportButton = screen.getByRole('button', { name: /export csv/i });
    expect(csvExportButton).toBeInTheDocument();

    // Complete journey verification
    expect(mockStorageManager.createGroup).toHaveBeenCalledTimes(1);
    expect(mockStorageManager.addExpense).toHaveBeenCalledTimes(3);
  }, 60000); // Extended timeout for full journey

  it('should handle error scenarios gracefully', async () => {
    const user = userEvent.setup();

    // Mock storage errors
    mockStorageManager.createGroup.mockRejectedValue(new Error('Storage quota exceeded'));

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Try to create group that will fail
    const createGroupButton = screen.getByRole('button', { name: /create new group/i });
    await user.click(createGroupButton);

    await user.type(screen.getByLabelText(/group name/i), 'Test Group');
    await user.type(screen.getByLabelText(/participant 1/i), 'Alice');
    await user.type(screen.getByLabelText(/participant 2/i), 'Bob');

    const createButton = screen.getByRole('button', { name: /create group/i });
    await user.click(createButton);

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/storage quota exceeded/i)).toBeInTheDocument();
    });

    // Verify app remains functional
    expect(screen.getByRole('button', { name: /create new group/i })).toBeInTheDocument();
  });

  it('should maintain data consistency across navigation', async () => {
    const user = userEvent.setup();

    const mockGroup = {
      id: 'test-group',
      name: 'Consistency Test',
      currency: 'USD',
      participants: [
        { id: 'alice', name: 'Alice', active: true, defaultWeight: 1 },
        { id: 'bob', name: 'Bob', active: true, defaultWeight: 1 }
      ],
      expenses: [{
        id: 'expense-1',
        description: 'Test Expense',
        amount: 100,
        payerId: 'alice',
        split: [
          { participantId: 'alice', weight: 1, included: true },
          { participantId: 'bob', weight: 1, included: true }
        ],
        date: new Date().toISOString(),
        category: 'food'
      }]
    };

    mockStorageManager.getAllGroups.mockResolvedValue([mockGroup]);
    mockStorageManager.getGroup.mockResolvedValue(mockGroup);

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Navigate to group
    await waitFor(() => {
      expect(screen.getByText('Consistency Test')).toBeInTheDocument();
    });

    const groupCard = screen.getByText('Consistency Test');
    await user.click(groupCard);

    // Verify data loads correctly in Overview
    await waitFor(() => {
      expect(screen.getByText('Test Expense')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    // Navigate to Expenses tab
    const expensesTab = screen.getByRole('tab', { name: /expenses/i });
    await user.click(expensesTab);

    // Verify same data appears
    await waitFor(() => {
      expect(screen.getByText('Test Expense')).toBeInTheDocument();
    });

    // Navigate to Settle tab
    const settleTab = screen.getByRole('tab', { name: /settle/i });
    await user.click(settleTab);

    // Verify calculations are consistent
    await waitFor(() => {
      const balanceCards = screen.getAllByTestId(/balance-card-/);
      expect(balanceCards).toHaveLength(2);
    });

    // Navigate back to Overview
    const overviewTab = screen.getByRole('tab', { name: /overview/i });
    await user.click(overviewTab);

    // Verify data is still consistent
    await waitFor(() => {
      expect(screen.getByText('Test Expense')).toBeInTheDocument();
    });
  });

  it('should handle offline scenarios', async () => {
    const user = userEvent.setup();

    // Mock offline storage behavior
    mockStorageManager.createGroup.mockImplementation(() => {
      // Simulate offline storage (local only)
      return Promise.resolve({ id: 'offline-group', name: 'Offline Group' });
    });

    // Simulate network error for sync operations
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Create group while "offline"
    const createGroupButton = screen.getByRole('button', { name: /create new group/i });
    await user.click(createGroupButton);

    await user.type(screen.getByLabelText(/group name/i), 'Offline Group');
    await user.type(screen.getByLabelText(/participant 1/i), 'Alice');
    await user.type(screen.getByLabelText(/participant 2/i), 'Bob');

    const createButton = screen.getByRole('button', { name: /create group/i });
    await user.click(createButton);

    // Verify group was created locally
    await waitFor(() => {
      expect(mockStorageManager.createGroup).toHaveBeenCalled();
    });

    // Restore fetch
    global.fetch = originalFetch;
  });
});