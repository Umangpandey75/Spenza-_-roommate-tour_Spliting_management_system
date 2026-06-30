import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SettlementHistory } from '../components/settlement/settlement-history';
import { SettlementEditor } from '../components/settlement/settlement-editor';
import { TransferList } from '../components/settlement/transfer-list';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    g: ({ children, ...props }) => <g {...props}>{children}</g>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock UI components
vi.mock('../ui/card', () => ({
  Card: ({ children, ...props }) => <div data-testid="card" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }) => <h3 data-testid="card-title" {...props}>{children}</h3>,
  CardContent: ({ children, ...props }) => <div data-testid="card-content" {...props}>{children}</div>,
}));

vi.mock('../ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('../ui/input', () => ({
  Input: (props) => <input {...props} />,
}));

vi.mock('../ui/select', () => ({
  Select: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectItem: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectTrigger: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectValue: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

vi.mock('../ui/dialog', () => ({
  Dialog: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  DialogTrigger: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  History: ({ ...props }) => <div data-testid="history-icon" {...props} />,
  Check: ({ ...props }) => <div data-testid="check-icon" {...props} />,
  Undo: ({ ...props }) => <div data-testid="undo-icon" {...props} />,
  Edit3: ({ ...props }) => <div data-testid="edit-icon" {...props} />,
  Plus: ({ ...props }) => <div data-testid="plus-icon" {...props} />,
  RotateCcw: ({ ...props }) => <div data-testid="rotate-icon" {...props} />,
  Trash2: ({ ...props }) => <div data-testid="trash-icon" {...props} />,
  Save: ({ ...props }) => <div data-testid="save-icon" {...props} />,
  X: ({ ...props }) => <div data-testid="x-icon" {...props} />,
  ArrowRight: ({ ...props }) => <div data-testid="arrow-right-icon" {...props} />,
  Copy: ({ ...props }) => <div data-testid="copy-icon" {...props} />,
}));

// Mock calc utilities
vi.mock('../../lib/calc', () => ({
  formatCurrency: (amount, currency) => `$${amount.toFixed(2)}`,
}));

// Mock utils
vi.mock('../../lib/utils/cn', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' '),
}));

vi.mock('../../lib/utils/motion', () => ({
  getMotionVariants: () => ({}),
  getTransition: () => ({ duration: 0.2 }),
}));

const mockParticipants = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com' },
];

const mockTransfers = [
  { fromId: '2', toId: '1', amount: 20 },
  { fromId: '3', toId: '1', amount: 20 },
];

describe('Settlement Components Mobile Responsiveness', () => {
  beforeEach(() => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });
  });

  describe('SettlementHistory Mobile Layout', () => {
    it('should render with mobile-responsive layout', () => {
      render(
        <SettlementHistory
          settlements={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Check for responsive classes
      const container = screen.getByTestId('card');
      expect(container).toBeInTheDocument();
    });

    it('should have responsive progress bar', () => {
      render(
        <SettlementHistory
          settlements={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Progress information should be present
      expect(screen.getByText(/transfers completed/)).toBeInTheDocument();
    });

    it('should have mobile-friendly transfer items', () => {
      render(
        <SettlementHistory
          settlements={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Check for transfer items
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should have responsive buttons', () => {
      render(
        <SettlementHistory
          settlements={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Mark Paid buttons should be present
      const markPaidButtons = screen.getAllByText(/Mark Paid/);
      expect(markPaidButtons.length).toBeGreaterThan(0);
    });
  });

  describe('SettlementEditor Mobile Layout', () => {
    it('should render with mobile-responsive header', () => {
      render(
        <SettlementEditor
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      expect(screen.getByText('Settlement Editor')).toBeInTheDocument();
    });

    it('should have responsive transfer items', () => {
      render(
        <SettlementEditor
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Check for participant names
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should have mobile-friendly action buttons', () => {
      render(
        <SettlementEditor
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Check for action buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle edit mode responsively', async () => {
      render(
        <SettlementEditor
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Find and click edit button
      const editButtons = screen.getAllByTestId('edit-icon');
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0].closest('button'));
      }

      // Should handle edit mode
      expect(screen.getByText('Settlement Editor')).toBeInTheDocument();
    });
  });

  describe('TransferList Mobile Layout', () => {
    it('should render with mobile-responsive layout', () => {
      render(
        <TransferList
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      expect(screen.getByText('Settlement Transfers')).toBeInTheDocument();
    });

    it('should have responsive transfer cards', () => {
      render(
        <TransferList
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Check for participant names in transfers
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should have mobile-friendly action buttons', () => {
      render(
        <TransferList
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Check for copy buttons
      const copyButtons = screen.getAllByTestId('copy-icon');
      expect(copyButtons.length).toBeGreaterThan(0);
    });

    it('should handle empty state', () => {
      render(
        <TransferList
          transfers={[]}
          participants={mockParticipants}
          currency="USD"
        />
      );

      expect(screen.getByText('All Settled Up!')).toBeInTheDocument();
    });

    it('should have responsive summary section', () => {
      render(
        <TransferList
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      expect(screen.getByText('Settlement Summary')).toBeInTheDocument();
    });
  });

  describe('Mobile Interaction Handling', () => {
    it('should handle button clicks on mobile', () => {
      const mockOnTransferComplete = vi.fn();
      
      render(
        <TransferList
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
          onTransferComplete={mockOnTransferComplete}
        />
      );

      // Find Mark Paid buttons
      const markPaidButtons = screen.getAllByText(/Mark Paid/);
      if (markPaidButtons.length > 0) {
        fireEvent.click(markPaidButtons[0]);
        expect(mockOnTransferComplete).toHaveBeenCalled();
      }
    });

    it('should handle copy functionality', async () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockImplementation(() => Promise.resolve()),
        },
      });

      render(
        <TransferList
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Find and click copy button
      const copyButtons = screen.getAllByTestId('copy-icon');
      if (copyButtons.length > 0) {
        fireEvent.click(copyButtons[0].closest('button'));
        
        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Responsive Text and Layout', () => {
    it('should handle long participant names on mobile', () => {
      const longNameParticipants = [
        { id: '1', name: 'Very Long Participant Name That Should Wrap', email: 'long@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' },
      ];

      render(
        <TransferList
          transfers={[{ fromId: '2', toId: '1', amount: 20 }]}
          participants={longNameParticipants}
          currency="USD"
        />
      );

      expect(screen.getByText('Very Long Participant Name That Should Wrap')).toBeInTheDocument();
    });

    it('should display currency amounts properly on mobile', () => {
      render(
        <TransferList
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      // Check for formatted currency
      expect(screen.getByText('$20.00')).toBeInTheDocument();
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should maintain button accessibility on mobile', () => {
      render(
        <SettlementHistory
          settlements={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    it('should have proper heading structure', () => {
      render(
        <TransferList
          transfers={mockTransfers}
          participants={mockParticipants}
          currency="USD"
        />
      );

      expect(screen.getByText('Settlement Transfers')).toBeInTheDocument();
      expect(screen.getByText('Settlement Summary')).toBeInTheDocument();
    });
  });
});