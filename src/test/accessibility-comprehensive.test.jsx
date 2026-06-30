import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StorageProvider } from '../contexts/storage-context';
import GroupDashboard from '../components/group/group-dashboard';
import ExpenseDrawer from '../components/expense/expense-drawer';
import SettlementGraph from '../components/settlement/settlement-graph';
import WhatIfPanel from '../components/what-if/what-if-panel';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock storage manager
const mockStorageManager = {
  getGroup: vi.fn(),
  updateGroup: vi.fn(),
  addExpense: vi.fn(),
  updateExpense: vi.fn(),
};

const mockGroup = {
  id: 'test-group',
  name: 'Accessibility Test Group',
  currency: 'USD',
  participants: [
    { id: 'alice', name: 'Alice', active: true, defaultWeight: 1 },
    { id: 'bob', name: 'Bob', active: true, defaultWeight: 1 },
    { id: 'charlie', name: 'Charlie', active: true, defaultWeight: 1 }
  ],
  expenses: [
    {
      id: 'expense-1',
      description: 'Test Expense',
      amount: 100,
      payerId: 'alice',
      split: [
        { participantId: 'alice', weight: 1, included: true },
        { participantId: 'bob', weight: 1, included: true },
        { participantId: 'charlie', weight: 1, included: true }
      ],
      date: new Date().toISOString(),
      category: 'food'
    }
  ]
};

const TestWrapper = ({ children }) => (
  <StorageProvider storageManager={mockStorageManager}>
    {children}
  </StorageProvider>
);

describe('Comprehensive Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageManager.getGroup.mockResolvedValue(mockGroup);
  });

  describe('Axe-core Automated Testing', () => {
    it('should have no accessibility violations in GroupDashboard', async () => {
      const { container } = render(
        <TestWrapper>
          <GroupDashboard groupId="test-group" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Group')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in ExpenseDrawer', async () => {
      const { container } = render(
        <TestWrapper>
          <ExpenseDrawer
            isOpen={true}
            onClose={() => {}}
            group={mockGroup}
            onExpenseAdded={() => {}}
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in SettlementGraph', async () => {
      const mockBalances = [
        { participantId: 'alice', netBalance: 50 },
        { participantId: 'bob', netBalance: -25 },
        { participantId: 'charlie', netBalance: -25 }
      ];

      const mockSettlements = [
        { fromId: 'bob', toId: 'alice', amount: 25 },
        { fromId: 'charlie', toId: 'alice', amount: 25 }
      ];

      const { container } = render(
        <SettlementGraph
          participants={mockGroup.participants}
          balances={mockBalances}
          settlements={mockSettlements}
          onSettlementToggle={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in WhatIfPanel', async () => {
      const mockBalances = [
        { participantId: 'alice', netBalance: 50 },
        { participantId: 'bob', netBalance: -25 },
        { participantId: 'charlie', netBalance: -25 }
      ];

      const mockSettlements = [
        { fromId: 'bob', toId: 'alice', amount: 25 },
        { fromId: 'charlie', toId: 'alice', amount: 25 }
      ];

      const { container } = render(
        <WhatIfPanel
          group={mockGroup}
          originalBalances={mockBalances}
          originalSettlements={mockSettlements}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('should support full keyboard navigation in GroupDashboard', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GroupDashboard groupId="test-group" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Group')).toBeInTheDocument();
      });

      // Test tab navigation through main tabs
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      const expensesTab = screen.getByRole('tab', { name: /expenses/i });
      const participantsTab = screen.getByRole('tab', { name: /participants/i });
      const settleTab = screen.getByRole('tab', { name: /settle/i });
      const whatIfTab = screen.getByRole('tab', { name: /what-if/i });

      // Start from overview tab
      overviewTab.focus();
      expect(document.activeElement).toBe(overviewTab);

      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(expensesTab);

      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(participantsTab);

      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(settleTab);

      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(whatIfTab);

      // Test Enter key activation
      await user.keyboard('{Enter}');
      expect(whatIfTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should support keyboard navigation in ExpenseDrawer', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <TestWrapper>
          <ExpenseDrawer
            isOpen={true}
            onClose={onClose}
            group={mockGroup}
            onExpenseAdded={() => {}}
          />
        </TestWrapper>
      );

      // Test Escape key closes drawer
      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalled();

      // Reset mock
      onClose.mockClear();

      // Test Tab navigation through form fields
      const descriptionInput = screen.getByLabelText(/description/i);
      const amountInput = screen.getByLabelText(/amount/i);
      const payerSelect = screen.getByLabelText(/paid by/i);

      descriptionInput.focus();
      expect(document.activeElement).toBe(descriptionInput);

      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(amountInput);

      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(payerSelect);
    });

    it('should support keyboard navigation in SettlementGraph', async () => {
      const user = userEvent.setup();
      const onSettlementToggle = vi.fn();

      const mockBalances = [
        { participantId: 'alice', netBalance: 50 },
        { participantId: 'bob', netBalance: -25 },
        { participantId: 'charlie', netBalance: -25 }
      ];

      const mockSettlements = [
        { fromId: 'bob', toId: 'alice', amount: 25 },
        { fromId: 'charlie', toId: 'alice', amount: 25 }
      ];

      render(
        <SettlementGraph
          participants={mockGroup.participants}
          balances={mockBalances}
          settlements={mockSettlements}
          onSettlementToggle={onSettlementToggle}
        />
      );

      // Test keyboard interaction with settlement items
      const settlementButtons = screen.getAllByRole('button', { name: /settlement/i });
      
      if (settlementButtons.length > 0) {
        settlementButtons[0].focus();
        expect(document.activeElement).toBe(settlementButtons[0]);

        await user.keyboard('{Enter}');
        expect(onSettlementToggle).toHaveBeenCalled();
      }
    });
  });

  describe('Screen Reader Support Tests', () => {
    it('should provide proper ARIA labels for form controls', async () => {
      render(
        <TestWrapper>
          <ExpenseDrawer
            isOpen={true}
            onClose={() => {}}
            group={mockGroup}
            onExpenseAdded={() => {}}
          />
        </TestWrapper>
      );

      // Check for proper labeling
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/paid by/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();

      // Check for ARIA descriptions
      const amountInput = screen.getByLabelText(/amount/i);
      expect(amountInput).toHaveAttribute('aria-describedby');
    });

    it('should provide proper ARIA labels for interactive elements', async () => {
      const mockBalances = [
        { participantId: 'alice', netBalance: 50 },
        { participantId: 'bob', netBalance: -25 },
        { participantId: 'charlie', netBalance: -25 }
      ];

      const mockSettlements = [
        { fromId: 'bob', toId: 'alice', amount: 25 },
        { fromId: 'charlie', toId: 'alice', amount: 25 }
      ];

      render(
        <SettlementGraph
          participants={mockGroup.participants}
          balances={mockBalances}
          settlements={mockSettlements}
          onSettlementToggle={() => {}}
        />
      );

      // Check for proper ARIA labels on interactive elements
      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        expect(element).toHaveAttribute('aria-label');
      });
    });

    it('should provide live region updates for dynamic content', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GroupDashboard groupId="test-group" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Group')).toBeInTheDocument();
      });

      // Navigate to What-If tab
      const whatIfTab = screen.getByRole('tab', { name: /what-if/i });
      await user.click(whatIfTab);

      // Check for live region that announces changes
      const liveRegion = screen.queryByRole('status');
      if (liveRegion) {
        expect(liveRegion).toHaveAttribute('aria-live');
      }
    });
  });

  describe('Focus Management Tests', () => {
    it('should manage focus properly when opening/closing modals', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GroupDashboard groupId="test-group" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Group')).toBeInTheDocument();
      });

      // Navigate to Expenses tab
      const expensesTab = screen.getByRole('tab', { name: /expenses/i });
      await user.click(expensesTab);

      // Open expense drawer
      const addButton = screen.getByRole('button', { name: /add expense/i });
      await user.click(addButton);

      // Focus should move to first form field
      await waitFor(() => {
        const descriptionInput = screen.getByLabelText(/description/i);
        expect(document.activeElement).toBe(descriptionInput);
      });

      // Close drawer with Escape
      await user.keyboard('{Escape}');

      // Focus should return to trigger button
      await waitFor(() => {
        expect(document.activeElement).toBe(addButton);
      });
    });

    it('should provide visible focus indicators', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GroupDashboard groupId="test-group" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Group')).toBeInTheDocument();
      });

      // Test focus indicators on tabs
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      await user.tab();
      
      // Check that focused element has visible focus styles
      const focusedElement = document.activeElement;
      const computedStyle = window.getComputedStyle(focusedElement);
      
      // Should have focus ring or outline
      expect(
        computedStyle.outline !== 'none' || 
        computedStyle.boxShadow.includes('focus') ||
        focusedElement.classList.contains('focus-visible')
      ).toBe(true);
    });
  });

  describe('High Contrast and Reduced Motion Tests', () => {
    it('should respect prefers-reduced-motion setting', async () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const mockBalances = [
        { participantId: 'alice', netBalance: 50 },
        { participantId: 'bob', netBalance: -25 }
      ];

      const mockSettlements = [
        { fromId: 'bob', toId: 'alice', amount: 25 }
      ];

      render(
        <SettlementGraph
          participants={mockGroup.participants}
          balances={mockBalances}
          settlements={mockSettlements}
          onSettlementToggle={() => {}}
        />
      );

      // Check that animations are disabled or reduced
      const animatedElements = screen.container.querySelectorAll('[data-animate]');
      animatedElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        expect(
          computedStyle.animationDuration === '0s' ||
          computedStyle.transitionDuration === '0s' ||
          element.hasAttribute('data-reduced-motion')
        ).toBe(true);
      });
    });

    it('should provide sufficient color contrast', async () => {
      render(
        <TestWrapper>
          <GroupDashboard groupId="test-group" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Group')).toBeInTheDocument();
      });

      // This would typically be tested with automated tools like axe-core
      // which check color contrast ratios automatically
      const textElements = screen.container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
      
      textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        // Ensure text is not transparent or invisible
        expect(computedStyle.opacity).not.toBe('0');
        expect(computedStyle.visibility).not.toBe('hidden');
      });
    });
  });

  describe('Error State Accessibility', () => {
    it('should announce form validation errors to screen readers', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ExpenseDrawer
            isOpen={true}
            onClose={() => {}}
            group={mockGroup}
            onExpenseAdded={() => {}}
          />
        </TestWrapper>
      );

      // Try to submit form without required fields
      const submitButton = screen.getByRole('button', { name: /add expense/i });
      await user.click(submitButton);

      // Check for error messages with proper ARIA attributes
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);

        errorMessages.forEach(error => {
          expect(error).toHaveAttribute('aria-live', 'polite');
        });
      });

      // Check that form fields are properly associated with errors
      const descriptionInput = screen.getByLabelText(/description/i);
      if (descriptionInput.hasAttribute('aria-describedby')) {
        const errorId = descriptionInput.getAttribute('aria-describedby');
        const errorElement = document.getElementById(errorId);
        expect(errorElement).toBeInTheDocument();
      }
    });

    it('should handle loading states accessibly', async () => {
      // Mock loading state
      mockStorageManager.getGroup.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockGroup), 100))
      );

      render(
        <TestWrapper>
          <GroupDashboard groupId="test-group" />
        </TestWrapper>
      );

      // Check for loading indicator with proper ARIA attributes
      const loadingIndicator = screen.queryByRole('status');
      if (loadingIndicator) {
        expect(loadingIndicator).toHaveAttribute('aria-live');
        expect(loadingIndicator).toHaveTextContent(/loading/i);
      }

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Group')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Accessibility', () => {
    it('should provide adequate touch targets', async () => {
      render(
        <TestWrapper>
          <GroupDashboard groupId="test-group" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Group')).toBeInTheDocument();
      });

      // Check that interactive elements meet minimum touch target size (44px)
      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');
      const interactiveElements = [...buttons, ...links];

      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        const minSize = 44; // WCAG AA minimum
        const width = rect.width + parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        const height = rect.height + parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
        
        expect(width >= minSize || height >= minSize).toBe(true);
      });
    });

    it('should support zoom up to 200% without horizontal scrolling', async () => {
      // Mock viewport at 200% zoom
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640, // Simulating 1280px at 200% zoom
      });

      render(
        <TestWrapper>
          <GroupDashboard groupId="test-group" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Accessibility Test Group')).toBeInTheDocument();
      });

      // Check that content doesn't overflow horizontally
      const container = screen.container.firstChild;
      expect(container.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    });
  });
});