import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { WhatIfPanel } from '../components/what-if/what-if-panel';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock UI components
vi.mock('../ui/card', () => ({
  Card: ({ children, ...props }) => <div data-testid="card" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }) => <h3 data-testid="card-title" {...props}>{children}</h3>,
  CardContent: ({ children, ...props }) => <div data-testid="card-content" {...props}>{children}</div>,
}));

vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('../ui/input', () => ({
  Input: ({ onChange, onBlur, value, ...props }) => (
    <input 
      onChange={onChange} 
      onBlur={onBlur}
      value={value}
      data-testid="weight-input"
      {...props} 
    />
  ),
}));

// Mock calc utilities
vi.mock('../../lib/calc', () => ({
  formatCurrency: (amount, currency) => `$${amount.toFixed(2)}`,
  computeNet: vi.fn(() => []),
  computeMinimalSettlements: vi.fn(() => []),
}));

// Mock utils
vi.mock('../../lib/utils/performance', () => ({
  useDebounce: (fn) => fn,
}));

vi.mock('../../lib/utils/cn', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' '),
}));

vi.mock('../../lib/utils/motion', () => ({
  getMotionVariants: () => ({}),
  getTransition: () => ({ duration: 0.2 }),
}));

const mockGroup = {
  participants: [
    { id: '1', name: 'Alice', email: 'alice@example.com', defaultWeight: 1 },
    { id: '2', name: 'Bob', email: 'bob@example.com', defaultWeight: 1 },
  ],
  expenses: [],
  currency: 'USD',
};

const mockBalances = [
  { participantId: '1', netBalance: 10 },
  { participantId: '2', netBalance: -10 },
];

const mockSettlements = [
  { fromId: '2', toId: '1', amount: 10 },
];

describe('WhatIfPanel Weight Input Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start simulation and allow weight input', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockBalances}
        originalSettlements={mockSettlements}
      />
    );

    // Start simulation
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    // Should show simulation controls
    await waitFor(() => {
      expect(screen.getByText('Simulation Controls')).toBeInTheDocument();
    });

    // Should show participant controls
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('should initialize weight inputs with 1.0', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockBalances}
        originalSettlements={mockSettlements}
      />
    );

    // Start simulation
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    await waitFor(() => {
      const weightInputs = screen.getAllByTestId('weight-input');
      expect(weightInputs).toHaveLength(2);
      
      // Both inputs should start with 1.0, not 5
      weightInputs.forEach(input => {
        expect(input.value).toBe('1');
      });
    });
  });

  it('should accept keyboard input for weight values', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockBalances}
        originalSettlements={mockSettlements}
      />
    );

    // Start simulation
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    await waitFor(() => {
      const weightInputs = screen.getAllByTestId('weight-input');
      const firstInput = weightInputs[0];

      // Clear the input and type a new value
      fireEvent.change(firstInput, { target: { value: '' } });
      fireEvent.change(firstInput, { target: { value: '2' } });
      
      expect(firstInput.value).toBe('2');

      // Type a decimal value
      fireEvent.change(firstInput, { target: { value: '2.5' } });
      expect(firstInput.value).toBe('2.5');
    });
  });

  it('should handle partial input during typing', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockBalances}
        originalSettlements={mockSettlements}
      />
    );

    // Start simulation
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    await waitFor(() => {
      const weightInputs = screen.getAllByTestId('weight-input');
      const firstInput = weightInputs[0];

      // Should allow empty input while typing
      fireEvent.change(firstInput, { target: { value: '' } });
      expect(firstInput.value).toBe('');

      // Should allow decimal point
      fireEvent.change(firstInput, { target: { value: '.' } });
      expect(firstInput.value).toBe('.');

      // Should allow building up a decimal number
      fireEvent.change(firstInput, { target: { value: '.5' } });
      expect(firstInput.value).toBe('.5');
    });
  });

  it('should reset to 1.0 on blur if input is invalid', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockBalances}
        originalSettlements={mockSettlements}
      />
    );

    // Start simulation
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    await waitFor(() => {
      const weightInputs = screen.getAllByTestId('weight-input');
      const firstInput = weightInputs[0];

      // Clear the input
      fireEvent.change(firstInput, { target: { value: '' } });
      expect(firstInput.value).toBe('');

      // Blur the input (user clicks away)
      fireEvent.blur(firstInput);

      // Should reset to 1.0
      await waitFor(() => {
        expect(firstInput.value).toBe('1');
      });
    });
  });

  it('should clamp values between 0.1 and 5.0', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockBalances}
        originalSettlements={mockSettlements}
      />
    );

    // Start simulation
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    await waitFor(() => {
      const weightInputs = screen.getAllByTestId('weight-input');
      const firstInput = weightInputs[0];

      // Test value too low
      fireEvent.change(firstInput, { target: { value: '0.05' } });
      expect(firstInput.value).toBe('0.1'); // Should be clamped to minimum

      // Test value too high
      fireEvent.change(firstInput, { target: { value: '10' } });
      expect(firstInput.value).toBe('5'); // Should be clamped to maximum
    });
  });

  it('should not accept non-numeric input', async () => {
    render(
      <WhatIfPanel
        group={mockGroup}
        originalBalances={mockBalances}
        originalSettlements={mockSettlements}
      />
    );

    // Start simulation
    const startButton = screen.getByText('Start Simulation');
    fireEvent.click(startButton);

    await waitFor(() => {
      const weightInputs = screen.getAllByTestId('weight-input');
      const firstInput = weightInputs[0];

      const originalValue = firstInput.value;

      // Try to input letters
      fireEvent.change(firstInput, { target: { value: 'abc' } });
      
      // Value should not change from original
      expect(firstInput.value).toBe(originalValue);
    });
  });
});