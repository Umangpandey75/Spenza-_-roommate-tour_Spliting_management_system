import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WhatIfPanel } from '../what-if-panel';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

// Mock motion utils
vi.mock('../../../lib/utils/motion', () => ({
  getMotionVariants: () => ({}),
  getTransition: () => ({})
}));

// Mock performance utils
vi.mock('../../../lib/utils/performance', () => ({
  useDebounce: (callback) => callback
}));

const mockGroup = {
  id: 'group1',
  name: 'Test Group',
  currency: 'USD',
  participants: [
    { id: 'p1', name: 'Alice', defaultWeight: 1 },
    { id: 'p2', name: 'Bob', defaultWeight: 1 },
    { id: 'p3', name: 'Charlie', defaultWeight: 2 }
  ],
  expenses: [
    {
      id: 'e1',
      description: 'Dinner',
      amount: 60,
      payerId: 'p1',
      split: [
        { participantId: 'p1', weight: 1, included: true },
        { participantId: 'p2', weight: 1, included: true },
        { participantId: 'p3', weight: 2, included: true }
      ]
    }
  ]
};

const mockOriginalBalances = [
  { participantId: 'p1', totalPaid: 60, totalOwed: 15, netBalance: 45 },
  { participantId: 'p2', totalPaid: 0, totalOwed: 15, netBalance: -15 },
  { participantId: 'p3', totalPaid: 0, totalOwed: 30, netBalance: -30 }
];

const mockOriginalSettlements = [
  { fromId: 'p2', toId: 'p1', amount: 15 },
  { fromId: 'p3', toId: 'p1', amount: 30 }
];

describe('WhatIfPanel', () => {
  it('should render initial state with start simulation button', () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockOriginalBalances}
        originalSettlements={mockOriginalSettlements}
      />
    );

    expect(screen.getByText('What-If Simulation')).toBeInTheDocument();
    expect(screen.getByText('Start Simulation')).toBeInTheDocument();
    expect(screen.getByText(/simulate changes to participant weights/i)).toBeInTheDocument();
  });

  it('should show simulation controls after starting simulation', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockOriginalBalances}
        originalSettlements={mockOriginalSettlements}
      />
    );

    fireEvent.click(screen.getByText('Start Simulation'));

    await waitFor(() => {
      expect(screen.getByText('Simulation Controls')).toBeInTheDocument();
      expect(screen.getByText('Simulation Active')).toBeInTheDocument();
    });

    // Should show participant controls
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('should allow weight adjustments', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockOriginalBalances}
        originalSettlements={mockOriginalSettlements}
      />
    );

    fireEvent.click(screen.getByText('Start Simulation'));

    await waitFor(() => {
      expect(screen.getByText('Simulation Controls')).toBeInTheDocument();
    });

    // Find weight input for Alice and change it
    const weightInputs = screen.getAllByDisplayValue('1');
    fireEvent.change(weightInputs[0], { target: { value: '2' } });

    // Should show simulation results
    expect(screen.getByText('Simulation Results')).toBeInTheDocument();
  });

  it('should allow participant exclusion', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockOriginalBalances}
        originalSettlements={mockOriginalSettlements}
      />
    );

    fireEvent.click(screen.getByText('Start Simulation'));

    await waitFor(() => {
      expect(screen.getByText('Simulation Controls')).toBeInTheDocument();
    });

    // Find and click exclude button for Bob
    const includeButtons = screen.getAllByText('Include');
    fireEvent.click(includeButtons[1]); // Bob's button

    await waitFor(() => {
      expect(screen.getByText('Excluded')).toBeInTheDocument();
    });
  });

  it('should reset simulation', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockOriginalBalances}
        originalSettlements={mockOriginalSettlements}
      />
    );

    fireEvent.click(screen.getByText('Start Simulation'));

    await waitFor(() => {
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Reset'));

    await waitFor(() => {
      expect(screen.getByText('Start Simulation')).toBeInTheDocument();
    });
  });

  it('should handle empty group gracefully', () => {
    const emptyGroup = {
      ...mockGroup,
      participants: []
    };

    render(
      <WhatIfPanel
        group={emptyGroup}
        originalBalances={[]}
        originalSettlements={[]}
      />
    );

    expect(screen.getByText('No participants available for simulation')).toBeInTheDocument();
  });
});