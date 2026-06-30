import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroupCard } from '../index.js';
import * as calcModule from '../../../lib/calc';

// Mock the calculation functions
vi.mock('../../../lib/calc', () => ({
  computeNet: vi.fn(),
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
      payerId: 'p2',
      split: [
        { participantId: 'p1', weight: 1, included: true },
        { participantId: 'p2', weight: 1, included: true },
      ]
    }
  ]
};

describe('GroupCard', () => {
  beforeEach(() => {
    // Mock computeNet to return realistic balances
    vi.mocked(calcModule.computeNet).mockReturnValue([
      { participantId: 'p1', totalPaid: 60, totalOwed: 35, netBalance: 25 },
      { participantId: 'p2', totalPaid: 30, totalOwed: 35, netBalance: -5 },
      { participantId: 'p3', totalPaid: 0, totalOwed: 20, netBalance: -20 },
    ]);
  });

  it('renders group information correctly', () => {
    render(<GroupCard group={mockGroup} />);
    
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('$90.00')).toBeInTheDocument(); // Total spent
    expect(screen.getByText('2')).toBeInTheDocument(); // Number of expenses
    expect(screen.getByText('3 participants')).toBeInTheDocument();
  });

  it('displays balance information when there are debts', () => {
    render(<GroupCard group={mockGroup} />);
    
    expect(screen.getByText('Alice is owed')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('Charlie owes')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
  });

  it('shows "All settled up!" when no debts exist', () => {
    vi.mocked(calcModule.computeNet).mockReturnValue([
      { participantId: 'p1', totalPaid: 30, totalOwed: 30, netBalance: 0 },
      { participantId: 'p2', totalPaid: 30, totalOwed: 30, netBalance: 0 },
      { participantId: 'p3', totalPaid: 30, totalOwed: 30, netBalance: 0 },
    ]);

    render(<GroupCard group={mockGroup} />);
    
    expect(screen.getByText('All settled up!')).toBeInTheDocument();
  });

  it('shows "No expenses yet" for empty group', () => {
    const emptyGroup = {
      ...mockGroup,
      expenses: []
    };

    vi.mocked(calcModule.computeNet).mockReturnValue([
      { participantId: 'p1', totalPaid: 0, totalOwed: 0, netBalance: 0 },
      { participantId: 'p2', totalPaid: 0, totalOwed: 0, netBalance: 0 },
      { participantId: 'p3', totalPaid: 0, totalOwed: 0, netBalance: 0 },
    ]);

    render(<GroupCard group={emptyGroup} />);
    
    expect(screen.getByText('No expenses yet')).toBeInTheDocument();
  });

  it('calls onView when card is clicked', () => {
    const onView = vi.fn();
    render(<GroupCard group={mockGroup} onView={onView} />);
    
    fireEvent.click(screen.getByText('Test Group'));
    expect(onView).toHaveBeenCalledWith('group-1');
  });

  it('calls onView when View Details button is clicked', () => {
    const onView = vi.fn();
    render(<GroupCard group={mockGroup} onView={onView} />);
    
    fireEvent.click(screen.getByText('View Details'));
    expect(onView).toHaveBeenCalledWith('group-1');
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<GroupCard group={mockGroup} onDelete={onDelete} />);
    
    const deleteButton = screen.getByLabelText('Delete Test Group group');
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith('group-1');
  });

  it('shows Settle Up button when there are debts', () => {
    render(<GroupCard group={mockGroup} />);
    
    expect(screen.getByText('Settle Up')).toBeInTheDocument();
  });

  it('does not show Settle Up button when no debts exist', () => {
    vi.mocked(calcModule.computeNet).mockReturnValue([
      { participantId: 'p1', totalPaid: 30, totalOwed: 30, netBalance: 0 },
      { participantId: 'p2', totalPaid: 30, totalOwed: 30, netBalance: 0 },
      { participantId: 'p3', totalPaid: 30, totalOwed: 30, netBalance: 0 },
    ]);

    render(<GroupCard group={mockGroup} />);
    
    expect(screen.queryByText('Settle Up')).not.toBeInTheDocument();
  });

  it('handles missing group data gracefully', () => {
    render(<GroupCard group={null} />);
    
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0 participants')).toBeInTheDocument();
  });

  it('prevents event bubbling on delete button click', () => {
    const onView = vi.fn();
    const onDelete = vi.fn();
    render(<GroupCard group={mockGroup} onView={onView} onDelete={onDelete} />);
    
    const deleteButton = screen.getByLabelText('Delete Test Group group');
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith('group-1');
    expect(onView).not.toHaveBeenCalled();
  });
});