import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GroupSettings } from '../index.js';

const mockGroup = {
  id: 'group-1',
  name: 'Test Group',
  currency: 'USD',
  createdAt: new Date('2024-01-01'),
  participants: [
    { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
    { id: 'p2', name: 'Bob', active: true, defaultWeight: 1 },
  ],
  expenses: [
    {
      id: 'e1',
      amount: 60,
      description: 'Dinner',
      payerId: 'p1',
    }
  ]
};

describe('GroupSettings', () => {
  it('renders group information in display mode', () => {
    render(<GroupSettings group={mockGroup} />);
    
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('$ US Dollar (USD)')).toBeInTheDocument();
    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Participants count
    expect(screen.getByText('1')).toBeInTheDocument(); // Expenses count
  });

  it('enters edit mode when Edit Settings button is clicked', async () => {
    const user = userEvent.setup();
    render(<GroupSettings group={mockGroup} />);
    
    await user.click(screen.getByText('Edit Settings'));
    
    expect(screen.getByLabelText('Group Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency *')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onUpdateGroup when form is submitted with valid data', async () => {
    const user = userEvent.setup();
    const onUpdateGroup = vi.fn();
    render(<GroupSettings group={mockGroup} onUpdateGroup={onUpdateGroup} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit Settings'));
    
    // Modify group name
    const nameInput = screen.getByDisplayValue('Test Group');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Group Name');
    
    // Save changes
    await user.click(screen.getByText('Save Changes'));
    
    expect(onUpdateGroup).toHaveBeenCalledWith({
      ...mockGroup,
      name: 'Updated Group Name',
      currency: 'USD',
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<GroupSettings group={mockGroup} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit Settings'));
    
    // Clear name field
    const nameInput = screen.getByDisplayValue('Test Group');
    await user.clear(nameInput);
    
    // Try to save
    await user.click(screen.getByText('Save Changes'));
    
    expect(screen.getByText('Group name is required')).toBeInTheDocument();
  });

  it('shows currency change warning when group has expenses', async () => {
    const user = userEvent.setup();
    render(<GroupSettings group={mockGroup} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit Settings'));
    
    // Change currency
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('€ Euro (EUR)'));
    
    expect(screen.getByText('⚠️ Changing currency will not convert existing expense amounts')).toBeInTheDocument();
  });

  it('does not show currency warning when group has no expenses', async () => {
    const user = userEvent.setup();
    const groupWithoutExpenses = { ...mockGroup, expenses: [] };
    render(<GroupSettings group={groupWithoutExpenses} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit Settings'));
    
    // Change currency
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('€ Euro (EUR)'));
    
    expect(screen.queryByText('⚠️ Changing currency will not convert existing expense amounts')).not.toBeInTheDocument();
  });

  it('cancels edit mode when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<GroupSettings group={mockGroup} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit Settings'));
    
    // Modify name
    const nameInput = screen.getByDisplayValue('Test Group');
    await user.clear(nameInput);
    await user.type(nameInput, 'Modified Name');
    
    // Cancel
    await user.click(screen.getByText('Cancel'));
    
    // Should be back in display mode with original values
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('Edit Settings')).toBeInTheDocument();
  });

  it('opens delete confirmation dialog when Delete Group button is clicked', async () => {
    const user = userEvent.setup();
    render(<GroupSettings group={mockGroup} />);
    
    await user.click(screen.getByText('Delete Group'));
    
    expect(screen.getByText('Delete Group')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete "Test Group"?')).toBeInTheDocument();
    expect(screen.getByText('2 participants')).toBeInTheDocument();
    expect(screen.getByText('1 expense')).toBeInTheDocument();
  });

  it('calls onDeleteGroup when delete is confirmed', async () => {
    const user = userEvent.setup();
    const onDeleteGroup = vi.fn();
    render(<GroupSettings group={mockGroup} onDeleteGroup={onDeleteGroup} />);
    
    // Open delete dialog
    await user.click(screen.getByText('Delete Group'));
    
    // Confirm deletion
    const deleteButtons = screen.getAllByText('Delete Group');
    const confirmButton = deleteButtons[deleteButtons.length - 1]; // Last one is the confirm button
    await user.click(confirmButton);
    
    expect(onDeleteGroup).toHaveBeenCalledWith('group-1');
  });

  it('cancels delete when Cancel button is clicked in dialog', async () => {
    const user = userEvent.setup();
    const onDeleteGroup = vi.fn();
    render(<GroupSettings group={mockGroup} onDeleteGroup={onDeleteGroup} />);
    
    // Open delete dialog
    await user.click(screen.getByText('Delete Group'));
    
    // Cancel deletion
    await user.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Are you sure you want to delete "Test Group"?')).not.toBeInTheDocument();
    });
    
    expect(onDeleteGroup).not.toHaveBeenCalled();
  });

  it('displays group ID in truncated format', () => {
    render(<GroupSettings group={mockGroup} />);
    
    expect(screen.getByText('group-1')).toBeInTheDocument();
  });

  it('handles missing createdAt gracefully', () => {
    const groupWithoutDate = { ...mockGroup, createdAt: null };
    render(<GroupSettings group={groupWithoutDate} />);
    
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('handles missing group gracefully', () => {
    render(<GroupSettings group={null} />);
    
    expect(screen.getByText('Group not found')).toBeInTheDocument();
  });

  it('disables Delete Group button when in edit mode', async () => {
    const user = userEvent.setup();
    render(<GroupSettings group={mockGroup} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit Settings'));
    
    // Delete button should be disabled
    const deleteButton = screen.getByText('Delete Group');
    expect(deleteButton).toBeDisabled();
  });

  it('shows correct pluralization for participants and expenses', () => {
    const singleItemGroup = {
      ...mockGroup,
      participants: [{ id: 'p1', name: 'Alice', active: true, defaultWeight: 1 }],
      expenses: [{ id: 'e1', amount: 60, description: 'Dinner', payerId: 'p1' }]
    };
    
    render(<GroupSettings group={singleItemGroup} />);
    
    // Should show singular forms
    expect(screen.getByText('1 participant')).toBeInTheDocument();
    expect(screen.getByText('1 expense')).toBeInTheDocument();
  });

  it('displays all available currencies in select', async () => {
    const user = userEvent.setup();
    render(<GroupSettings group={mockGroup} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit Settings'));
    
    // Open currency select
    await user.click(screen.getByRole('combobox'));
    
    // Check for some common currencies
    expect(screen.getByText('$ US Dollar (USD)')).toBeInTheDocument();
    expect(screen.getByText('€ Euro (EUR)')).toBeInTheDocument();
    expect(screen.getByText('£ British Pound (GBP)')).toBeInTheDocument();
  });
});