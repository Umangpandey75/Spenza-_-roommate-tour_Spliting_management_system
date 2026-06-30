import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateGroupDialog } from '../index.js';

describe('CreateGroupDialog', () => {
  it('renders dialog when open', () => {
    render(
      <CreateGroupDialog 
        open={true} 
        onOpenChange={vi.fn()} 
        onCreateGroup={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Create New Group')).toBeInTheDocument();
    expect(screen.getByLabelText('Group Name *')).toBeInTheDocument();
    expect(screen.getByText('Currency *')).toBeInTheDocument();
  });

  it('does not render dialog when closed', () => {
    render(
      <CreateGroupDialog 
        open={false} 
        onOpenChange={vi.fn()} 
        onCreateGroup={vi.fn()} 
      />
    );
    
    expect(screen.queryByText('Create New Group')).not.toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    const onCreateGroup = vi.fn();
    
    render(
      <CreateGroupDialog 
        open={true} 
        onOpenChange={vi.fn()} 
        onCreateGroup={onCreateGroup} 
      />
    );
    
    // Try to submit without filling required fields
    await user.click(screen.getByText('Create Group'));
    
    expect(screen.getByText('Group name is required')).toBeInTheDocument();
    expect(onCreateGroup).not.toHaveBeenCalled();
  });

  it('calls onCreateGroup with form data when valid', async () => {
    const user = userEvent.setup();
    const onCreateGroup = vi.fn();
    
    render(
      <CreateGroupDialog 
        open={true} 
        onOpenChange={vi.fn()} 
        onCreateGroup={onCreateGroup} 
      />
    );
    
    // Fill form
    await user.type(screen.getByLabelText('Group Name *'), 'Test Group');
    
    // Submit
    await user.click(screen.getByText('Create Group'));
    
    await waitFor(() => {
      expect(onCreateGroup).toHaveBeenCalledWith({
        name: 'Test Group',
        currency: 'INR',
        participantNames: []
      });
    });
  });

  it('calls onOpenChange when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    
    render(
      <CreateGroupDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onCreateGroup={vi.fn()} 
      />
    );
    
    await user.click(screen.getByText('Cancel'));
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('resets form when cancelled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    
    render(
      <CreateGroupDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onCreateGroup={vi.fn()} 
      />
    );
    
    // Fill form
    await user.type(screen.getByLabelText('Group Name *'), 'Test Group');
    
    // Cancel
    await user.click(screen.getByText('Cancel'));
    
    // Reopen dialog
    render(
      <CreateGroupDialog 
        open={true} 
        onOpenChange={vi.fn()} 
        onCreateGroup={vi.fn()} 
      />
    );
    
    // Form should be reset
    expect(screen.getByLabelText('Group Name *')).toHaveValue('');
  });

  it('allows currency selection', async () => {
    const user = userEvent.setup();
    const onCreateGroup = vi.fn();
    
    render(
      <CreateGroupDialog 
        open={true} 
        onOpenChange={vi.fn()} 
        onCreateGroup={onCreateGroup} 
      />
    );
    
    // Fill form with different currency
    await user.type(screen.getByLabelText('Group Name *'), 'Euro Trip');
    await user.selectOptions(screen.getByLabelText('Currency *'), 'EUR');
    
    // Submit
    await user.click(screen.getByText('Create Group'));
    
    await waitFor(() => {
      expect(onCreateGroup).toHaveBeenCalledWith({
        name: 'Euro Trip',
        currency: 'EUR',
        participantNames: []
      });
    });
  });


});