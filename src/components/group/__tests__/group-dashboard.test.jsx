import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GroupDashboard } from '../index.js';

// Mock the calculation functions
vi.mock('../../../lib/calc', () => ({
  computeNet: vi.fn(),
  computeMinimalSettlements: vi.fn(),
  formatCurrency: vi.fn((amount, currency) => `$${amount.toFixed(2)}`),
}));

const mockGroup = {
  id: 'group-1',
  name: 'Test Group',
  currency: 'USD',
  createdAt: new Date('2024-01-01'),
  participants: [
    { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
    { id: 'p2', name: 'Bob', active: true, defaultWeight: 1 },
    { id: 'p3', name: 'Charlie', active: true, defaultWeight: 1 },
  ],
  expenses: [
    {
      id: 'e1',
      amount: 60,
      description: 'Dinner',
      category: 'Food',
      payerId: 'p1',
      split: [
        { participantId: 'p1', weight: 1, included: true },
        { participantId: 'p2', weight: 1, included: true },
        { participantId: 'p3', weight: 1, included: true },
      ]
    },
    {
      id: 'e2',
      amount: 30,
      description: 'Lunch',
      category: 'Food',
      payerId: 'p2',
      split: [
        { participantId: 'p1', weight: 1, included: true },
        { participantId: 'p2', weight: 1, included: true },
      ]
    }
  ]
};

describe('GroupDashboard', () => {
  beforeEach(() => {
    // Mock calculation functions
    const { computeNet, computeMinimalSettlements } = require('../../../lib/calc');
    
    computeNet.mockReturnValue([
      { participantId: 'p1', totalPaid: 60, totalOwed: 35, netBalance: 25 },
      { participantId: 'p2', totalPaid: 30, totalOwed: 35, netBalance: -5 },
      { participantId: 'p3', totalPaid: 0, totalOwed: 20, netBalance: -20 },
    ]);
    
    computeMinimalSettlements.mockReturnValue([
      { fromId: 'p3', toId: 'p1', amount: 20 },
      { fromId: 'p2', toId: 'p1', amount: 5 },
    ]);
  });

  it('renders group header information correctly', () => {
    render(<GroupDashboard group={mockGroup} />);
    
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('3 participants • $90.00 total')).toBeInTheDocument();
  });

  it('renders all tab triggers', () => {
    render(<GroupDashboard group={mockGroup} />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Settle')).toBeInTheDocument();
    expect(screen.getByText('What-If')).toBeInTheDocument();
  });

  it('shows overview tab by default', () => {
    render(<GroupDashboard group={mockGroup} />);
    
    // Overview content should be visible
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
    expect(screen.getByText('$90.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Number of expenses
  });

  it('switches tabs when tab triggers are clicked', async () => {
    const user = userEvent.setup();
    render(<GroupDashboard group={mockGroup} />);
    
    // Click on Expenses tab
    await user.click(screen.getByText('Expenses'));
    expect(screen.getByText('Expenses Management')).toBeInTheDocument();
    
    // Click on Participants tab
    await user.click(screen.getByText('Participants'));
    expect(screen.getByText('Participants Management')).toBeInTheDocument();
    
    // Click on Settle tab
    await user.click(screen.getByText('Settle'));
    expect(screen.getByText('Settlement Management')).toBeInTheDocument();
    
    // Click on What-If tab
    await user.click(screen.getByText('What-If'));
    expect(screen.getByText('What-If Simulation')).toBeInTheDocument();
  });

  it('respects defaultTab prop', () => {
    render(<GroupDashboard group={mockGroup} defaultTab="expenses" />);
    
    expect(screen.getByText('Expenses Management')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<GroupDashboard group={mockGroup} onBack={onBack} />);
    
    const backButton = screen.getByLabelText('Back to groups');
    await user.click(backButton);
    
    expect(onBack).toHaveBeenCalled();
  });

  it('displays category breakdown in overview tab', () => {
    render(<GroupDashboard group={mockGroup} />);
    
    expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('$90.00')).toBeInTheDocument(); // Total for Food category
  });

  it('displays current balances in overview tab', () => {
    render(<GroupDashboard group={mockGroup} />);
    
    expect(screen.getByText('Current Balances')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows quick action buttons in overview tab', () => {
    render(<GroupDashboard group={mockGroup} />);
    
    expect(screen.getByText('Add Expense')).toBeInTheDocument();
    expect(screen.getByText('Add Participant')).toBeInTheDocument();
    expect(screen.getByText('View Settlements')).toBeInTheDocument();
  });

  it('does not show View Settlements button when no debts exist', () => {
    const { computeNet } = require('../../../lib/calc');
    computeNet.mockReturnValue([
      { participantId: 'p1', totalPaid: 30, totalOwed: 30, netBalance: 0 },
      { participantId: 'p2', totalPaid: 30, totalOwed: 30, netBalance: 0 },
      { participantId: 'p3', totalPaid: 30, totalOwed: 30, netBalance: 0 },
    ]);

    render(<GroupDashboard group={mockGroup} />);
    
    expect(screen.queryByText('View Settlements')).not.toBeInTheDocument();
  });

  it('handles missing group gracefully', () => {
    render(<GroupDashboard group={null} />);
    
    expect(screen.getByText('Group not found')).toBeInTheDocument();
    expect(screen.getByText('Back to Groups')).toBeInTheDocument();
  });

  it('handles group with no expenses', () => {
    const emptyGroup = {
      ...mockGroup,
      expenses: []
    };

    const { computeNet, computeMinimalSettlements } = require('../../../lib/calc');
    computeNet.mockReturnValue([]);
    computeMinimalSettlements.mockReturnValue([]);

    render(<GroupDashboard group={emptyGroup} />);
    
    expect(screen.getByText('3 participants • $0.00 total')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Expenses count
    expect(screen.getByText('0')).toBeInTheDocument(); // Settlements count
  });

  it('handles group with no participants', () => {
    const groupWithoutParticipants = {
      ...mockGroup,
      participants: []
    };

    render(<GroupDashboard group={groupWithoutParticipants} />);
    
    expect(screen.getByText('0 participants • $90.00 total')).toBeInTheDocument();
    expect(screen.getByText('No participants yet')).toBeInTheDocument();
  });

  it('shows correct pluralization for participants', () => {
    const singleParticipantGroup = {
      ...mockGroup,
      participants: [{ id: 'p1', name: 'Alice', active: true, defaultWeight: 1 }]
    };

    render(<GroupDashboard group={singleParticipantGroup} />);
    
    expect(screen.getByText('1 participant • $90.00 total')).toBeInTheDocument();
  });

  it('displays placeholder content for non-overview tabs', async () => {
    const user = userEvent.setup();
    render(<GroupDashboard group={mockGroup} />);
    
    // Check Expenses tab
    await user.click(screen.getByText('Expenses'));
    expect(screen.getByText('2 expenses in this group')).toBeInTheDocument();
    
    // Check Participants tab
    await user.click(screen.getByText('Participants'));
    expect(screen.getByText('3 participants in this group')).toBeInTheDocument();
    
    // Check Settle tab
    await user.click(screen.getByText('Settle'));
    expect(screen.getByText('2 transfers needed to settle up')).toBeInTheDocument();
    
    // Check What-If tab
    await user.click(screen.getByText('What-If'));
    expect(screen.getByText('Simulate changes to participant weights and exclusions')).toBeInTheDocument();
  });

  it('sorts categories by amount in descending order', () => {
    const groupWithMultipleCategories = {
      ...mockGroup,
      expenses: [
        { id: 'e1', amount: 30, category: 'Transport', payerId: 'p1' },
        { id: 'e2', amount: 60, category: 'Food', payerId: 'p2' },
        { id: 'e3', amount: 20, category: 'Entertainment', payerId: 'p3' },
      ]
    };

    render(<GroupDashboard group={groupWithMultipleCategories} />);
    
    const categoryElements = screen.getAllByText(/Food|Transport|Entertainment/);
    expect(categoryElements[0]).toHaveTextContent('Food'); // $60
    expect(categoryElements[1]).toHaveTextContent('Transport'); // $30
    expect(categoryElements[2]).toHaveTextContent('Entertainment'); // $20
  });

  it('handles expenses without categories', () => {
    const groupWithUncategorizedExpenses = {
      ...mockGroup,
      expenses: [
        { id: 'e1', amount: 30, payerId: 'p1' }, // No category
        { id: 'e2', amount: 60, category: 'Food', payerId: 'p2' },
      ]
    };

    render(<GroupDashboard group={groupWithUncategorizedExpenses} />);
    
    expect(screen.getByText('Other')).toBeInTheDocument(); // Default category
    expect(screen.getByText('Food')).toBeInTheDocument();
  });
});