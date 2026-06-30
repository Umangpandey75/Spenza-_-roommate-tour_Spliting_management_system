import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParticipantList } from '../index.js';

const mockGroup = {
  id: 'group-1',
  name: 'Test Group',
  participants: [
    { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
    { id: 'p2', name: 'Bob', active: true, defaultWeight: 1.5 },
    { id: 'p3', name: 'Charlie', active: false, defaultWeight: 1 }, // Inactive participant
  ],
  expenses: [
    {
      id: 'e1',
      payerId: 'p1',
      split: [
        { participantId: 'p1', weight: 1, included: true },
        { participantId: 'p2', weight: 1, included: true },
      ]
    }
  ]
};

describe('ParticipantList', () => {
  it('renders participant list correctly', () => {
    render(<ParticipantList group={mockGroup} />);
    
    expect(screen.getByText('Participants (2)')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument(); // Inactive
  });

  it('displays participant weights when showWeights is true', () => {
    render(<ParticipantList group={mockGroup} showWeights={true} />);
    
    expect(screen.getByText('Default weight: 1')).toBeInTheDocument();
    expect(screen.getByText('Default weight: 1.5')).toBeInTheDocument();
  });

  it('hides participant weights when showWeights is false', () => {
    render(<ParticipantList group={mockGroup} showWeights={false} />);
    
    expect(screen.queryByText('Default weight: 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Default weight: 1.5')).not.toBeInTheDocument();
  });

  it('shows empty state when no participants', () => {
    const emptyGroup = { ...mockGroup, participants: [] };
    render(<ParticipantList group={emptyGroup} />);
    
    expect(screen.getByText('No participants yet')).toBeInTheDocument();
    expect(screen.getByText('Add participants to start tracking expenses')).toBeInTheDocument();
    expect(screen.getByText('Add First Participant')).toBeInTheDocument();
  });

  it('opens add participant dialog when Add Participant button is clicked', async () => {
    const user = userEvent.setup();
    render(<ParticipantList group={mockGroup} />);
    
    await user.click(screen.getByText('Add Participant'));
    
    expect(screen.getByText('Add New Participant')).toBeInTheDocument();
    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
  });

  it('calls onAddParticipant when form is submitted', async () => {
    const user = userEvent.setup();
    const onAddParticipant = vi.fn();
    render(<ParticipantList group={mockGroup} onAddParticipant={onAddParticipant} />);
    
    // Open dialog
    await user.click(screen.getByText('Add Participant'));
    
    // Fill form
    await user.type(screen.getByLabelText('Name *'), 'David');
    await user.clear(screen.getByLabelText('Default Weight'));
    await user.type(screen.getByLabelText('Default Weight'), '2');
    
    // Submit
    await user.click(screen.getByRole('button', { name: 'Add Participant' }));
    
    expect(onAddParticipant).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'David',
        defaultWeight: 2,
        active: true,
        id: expect.stringMatching(/^participant_\d+_[a-z0-9]+$/),
      })
    );
  });

  it('validates required fields in add form', async () => {
    const user = userEvent.setup();
    render(<ParticipantList group={mockGroup} />);
    
    // Open dialog
    await user.click(screen.getByText('Add Participant'));
    
    // Submit without filling name
    await user.click(screen.getByRole('button', { name: 'Add Participant' }));
    
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it.skip('validates weight field when showWeights is true', async () => {
    const user = userEvent.setup();
    const onAddParticipant = vi.fn();
    render(<ParticipantList group={mockGroup} showWeights={true} onAddParticipant={onAddParticipant} />);
    
    // Open dialog
    await user.click(screen.getByText('Add Participant'));
    
    // Fill name but invalid weight (0 should fail our validation but pass browser validation)
    await user.type(screen.getByLabelText('Name *'), 'David');
    const weightInput = screen.getByLabelText('Default Weight');
    await user.clear(weightInput);
    await user.type(weightInput, '0');
    
    // Submit
    await user.click(screen.getByRole('button', { name: 'Add Participant' }));
    
    // Should show validation error and not call onAddParticipant
    expect(screen.getByText('Weight must be a positive number')).toBeInTheDocument();
    expect(onAddParticipant).not.toHaveBeenCalled();
  });

  it('opens edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ParticipantList group={mockGroup} />);
    
    // Click edit button for Alice
    const editButtons = screen.getAllByLabelText(/Edit/);
    await user.click(editButtons[0]);
    
    expect(screen.getByText('Edit Participant')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
  });

  it('calls onUpdateParticipant when edit form is submitted', async () => {
    const user = userEvent.setup();
    const onUpdateParticipant = vi.fn();
    render(<ParticipantList group={mockGroup} onUpdateParticipant={onUpdateParticipant} />);
    
    // Open edit dialog
    const editButtons = screen.getAllByLabelText(/Edit/);
    await user.click(editButtons[0]);
    
    // Modify name
    const nameInput = screen.getByDisplayValue('Alice');
    await user.clear(nameInput);
    await user.type(nameInput, 'Alice Smith');
    
    // Submit
    await user.click(screen.getByText('Update Participant'));
    
    expect(onUpdateParticipant).toHaveBeenCalledWith('p1', {
      name: 'Alice Smith',
      defaultWeight: 1,
    });
  });

  it('calls onRemoveParticipant when remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveParticipant = vi.fn();
    
    // Create group without expenses for Bob so he can be removed
    const groupWithoutBobExpenses = {
      ...mockGroup,
      expenses: []
    };
    
    render(<ParticipantList group={groupWithoutBobExpenses} onRemoveParticipant={onRemoveParticipant} />);
    
    // Click remove button for Bob
    const removeButtons = screen.getAllByLabelText(/Remove/);
    await user.click(removeButtons[1]); // Bob is second in alphabetical order
    
    expect(onRemoveParticipant).toHaveBeenCalledWith('p2');
  });

  it('disables remove button for participants with expenses', () => {
    render(<ParticipantList group={mockGroup} />);
    
    // Alice has expenses (is payer), so remove should be disabled
    const aliceCard = screen.getByText('Alice').closest('.bg-card');
    const lockIcon = aliceCard.querySelector('svg');
    expect(lockIcon).toBeInTheDocument();
  });

  it('sorts participants alphabetically', () => {
    const unsortedGroup = {
      ...mockGroup,
      participants: [
        { id: 'p1', name: 'Zoe', active: true, defaultWeight: 1 },
        { id: 'p2', name: 'Alice', active: true, defaultWeight: 1 },
        { id: 'p3', name: 'Bob', active: true, defaultWeight: 1 },
      ]
    };
    
    render(<ParticipantList group={unsortedGroup} />);
    
    const participantNames = screen.getAllByText(/Alice|Bob|Zoe/);
    expect(participantNames[0]).toHaveTextContent('Alice');
    expect(participantNames[1]).toHaveTextContent('Bob');
    expect(participantNames[2]).toHaveTextContent('Zoe');
  });

  it('cancels add dialog when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ParticipantList group={mockGroup} />);
    
    // Open dialog
    await user.click(screen.getByText('Add Participant'));
    expect(screen.getByText('Add New Participant')).toBeInTheDocument();
    
    // Cancel
    await user.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Add New Participant')).not.toBeInTheDocument();
    });
  });

  it('cancels edit dialog when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ParticipantList group={mockGroup} />);
    
    // Open edit dialog
    const editButtons = screen.getAllByLabelText(/Edit/);
    await user.click(editButtons[0]);
    expect(screen.getByText('Edit Participant')).toBeInTheDocument();
    
    // Cancel
    await user.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Edit Participant')).not.toBeInTheDocument();
    });
  });

  it('generates participant avatars from first letter of name', () => {
    render(<ParticipantList group={mockGroup} />);
    
    expect(screen.getByText('A')).toBeInTheDocument(); // Alice
    expect(screen.getByText('B')).toBeInTheDocument(); // Bob
  });

  it('handles missing group gracefully', () => {
    render(<ParticipantList group={null} />);
    
    expect(screen.getByText('Participants (0)')).toBeInTheDocument();
    expect(screen.getByText('No participants yet')).toBeInTheDocument();
  });
});