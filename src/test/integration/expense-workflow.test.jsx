import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorageProvider } from '../../contexts/storage-context';
import GroupDashboard from '../../components/group/group-dashboard';

// Mock the storage manager
const mockStorageManager = {
  getGroup: vi.fn(),
  updateGroup: vi.fn(),
  addExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
};

const mockGroup = {
  id: 'test-group',
  name: 'Test Group',
  currency: 'USD',
  participants: [
    { id: 'alice', name: 'Alice', active: true, defaultWeight: 1 },
    { id: 'bob', name: 'Bob', active: true, defaultWeight: 1 },
    { id: 'charlie', name: 'Charlie', active: true, defaultWeight: 1 }
  ],
  expenses: []
};

const TestWrapper = ({ children }) => (
  <StorageProvider storageManager={mockStorageManager}>
    {children}
  </StorageProvider>
);

describe('Expense Management Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageManager.getGroup.mockResolvedValue(mockGroup);
    mockStorageManager.updateGroup.mockResolvedValue(mockGroup);
    mockStorageManager.addExpense.mockResolvedValue({ id: 'new-expense' });
  });

  it('should complete full expense creation workflow within 30 seconds', async () => {
    const user = userEvent.setup();
    const startTime = Date.now();

    render(
      <TestWrapper>
        <GroupDashboard groupId="test-group" />
      </TestWrapper>
    );

    // Wait for group to load
    await waitFor(() => {
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    // Navigate to Expenses tab
    const expensesTab = screen.getByRole('tab', { name: /expenses/i });
    await user.click(expensesTab);

    // Open add expense drawer
    const addButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(addButton);

    // Fill expense form
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test Dinner');

    const amountInput = screen.getByLabelText(/amount/i);
    await user.type(amountInput, '60.00');

    const payerSelect = screen.getByLabelText(/paid by/i);
    await user.click(payerSelect);
    await user.click(screen.getByText('Alice'));

    // Verify split matrix is populated
    await waitFor(() => {
      const splitInputs = screen.getAllByTestId('split-weight-input');
      expect(splitInputs).toHaveLength(3);
    });

    // Submit expense
    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    // Verify expense was added
    await waitFor(() => {
      expect(mockStorageManager.addExpense).toHaveBeenCalledWith(
        'test-group',
        expect.objectContaining({
          description: 'Test Dinner',
          amount: 60,
          payerId: 'alice'
        })
      );
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify 30-second performance target
    expect(duration).toBeLessThan(30000);
  }, 35000);

  it('should handle expense editing workflow', async () => {
    const user = userEvent.setup();
    
    const groupWithExpense = {
      ...mockGroup,
      expenses: [{
        id: 'existing-expense',
        description: 'Original Expense',
        amount: 50,
        payerId: 'alice',
        split: [
          { participantId: 'alice', weight: 1, included: true },
          { participantId: 'bob', weight: 1, included: true },
          { participantId: 'charlie', weight: 1, included: true }
        ],
        date: new Date().toISOString(),
        category: 'food'
      }]
    };

    mockStorageManager.getGroup.mockResolvedValue(groupWithExpense);

    render(
      <TestWrapper>
        <GroupDashboard groupId="test-group" />
      </TestWrapper>
    );

    // Navigate to Expenses tab
    const expensesTab = screen.getByRole('tab', { name: /expenses/i });
    await user.click(expensesTab);

    // Find and click edit button for expense
    const editButton = screen.getByRole('button', { name: /edit.*original expense/i });
    await user.click(editButton);

    // Modify expense
    const descriptionInput = screen.getByDisplayValue('Original Expense');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Expense');

    const amountInput = screen.getByDisplayValue('50');
    await user.clear(amountInput);
    await user.type(amountInput, '75.50');

    // Submit changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Verify expense was updated
    await waitFor(() => {
      expect(mockStorageManager.updateExpense).toHaveBeenCalledWith(
        'test-group',
        'existing-expense',
        expect.objectContaining({
          description: 'Updated Expense',
          amount: 75.5
        })
      );
    });
  });

  it('should handle expense deletion workflow', async () => {
    const user = userEvent.setup();
    
    const groupWithExpense = {
      ...mockGroup,
      expenses: [{
        id: 'expense-to-delete',
        description: 'Expense to Delete',
        amount: 30,
        payerId: 'bob',
        split: [
          { participantId: 'alice', weight: 1, included: true },
          { participantId: 'bob', weight: 1, included: true }
        ],
        date: new Date().toISOString(),
        category: 'transport'
      }]
    };

    mockStorageManager.getGroup.mockResolvedValue(groupWithExpense);

    render(
      <TestWrapper>
        <GroupDashboard groupId="test-group" />
      </TestWrapper>
    );

    // Navigate to Expenses tab
    const expensesTab = screen.getByRole('tab', { name: /expenses/i });
    await user.click(expensesTab);

    // Find and click delete button
    const deleteButton = screen.getByRole('button', { name: /delete.*expense to delete/i });
    await user.click(deleteButton);

    // Confirm deletion in dialog
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmButton);

    // Verify expense was deleted
    await waitFor(() => {
      expect(mockStorageManager.deleteExpense).toHaveBeenCalledWith(
        'test-group',
        'expense-to-delete'
      );
    });
  });

  it('should validate form inputs and show errors', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <GroupDashboard groupId="test-group" />
      </TestWrapper>
    );

    // Navigate to Expenses tab and open add form
    const expensesTab = screen.getByRole('tab', { name: /expenses/i });
    await user.click(expensesTab);

    const addButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(addButton);

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    // Verify validation errors appear
    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
    });

    // Test invalid amount
    const amountInput = screen.getByLabelText(/amount/i);
    await user.type(amountInput, '-10');
    
    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
    });

    // Test invalid description (too long)
    const descriptionInput = screen.getByLabelText(/description/i);
    const longDescription = 'a'.repeat(101);
    await user.type(descriptionInput, longDescription);

    await waitFor(() => {
      expect(screen.getByText(/description must be 100 characters or less/i)).toBeInTheDocument();
    });
  });

  it('should handle split matrix interactions', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <GroupDashboard groupId="test-group" />
      </TestWrapper>
    );

    // Navigate to Expenses tab and open add form
    const expensesTab = screen.getByRole('tab', { name: /expenses/i });
    await user.click(expensesTab);

    const addButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(addButton);

    // Fill basic expense info
    await user.type(screen.getByLabelText(/description/i), 'Split Test');
    await user.type(screen.getByLabelText(/amount/i), '90');

    const payerSelect = screen.getByLabelText(/paid by/i);
    await user.click(payerSelect);
    await user.click(screen.getByText('Alice'));

    // Wait for split matrix to appear
    await waitFor(() => {
      const splitInputs = screen.getAllByTestId('split-weight-input');
      expect(splitInputs).toHaveLength(3);
    });

    // Modify Alice's weight
    const aliceWeightInput = screen.getByTestId('split-weight-alice');
    await user.clear(aliceWeightInput);
    await user.type(aliceWeightInput, '2');

    // Exclude Charlie from split
    const charlieCheckbox = screen.getByTestId('split-included-charlie');
    await user.click(charlieCheckbox);

    // Verify split preview updates
    await waitFor(() => {
      const aliceAmount = screen.getByTestId('split-amount-alice');
      const bobAmount = screen.getByTestId('split-amount-bob');
      
      expect(aliceAmount).toHaveTextContent('$60.00'); // 2/3 of $90
      expect(bobAmount).toHaveTextContent('$30.00');   // 1/3 of $90
    });

    // Submit and verify split data
    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockStorageManager.addExpense).toHaveBeenCalledWith(
        'test-group',
        expect.objectContaining({
          split: [
            { participantId: 'alice', weight: 2, included: true },
            { participantId: 'bob', weight: 1, included: true },
            { participantId: 'charlie', weight: 1, included: false }
          ]
        })
      );
    });
  });
});