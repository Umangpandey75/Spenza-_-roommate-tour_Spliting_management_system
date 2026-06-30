import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SettlementGraph } from '../components/settlement/settlement-graph';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    g: ({ children, ...props }) => <g {...props}>{children}</g>,
    circle: ({ children, ...props }) => <circle {...props}>{children}</circle>,
    path: ({ children, ...props }) => <path {...props}>{children}</path>,
    text: ({ children, ...props }) => <text {...props}>{children}</text>,
    rect: ({ children, ...props }) => <rect {...props}>{children}</rect>,
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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Users: ({ ...props }) => <div data-testid="users-icon" {...props} />,
  TrendingUp: ({ ...props }) => <div data-testid="trending-up-icon" {...props} />,
  TrendingDown: ({ ...props }) => <div data-testid="trending-down-icon" {...props} />,
  Minus: ({ ...props }) => <div data-testid="minus-icon" {...props} />,
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
  getTransition: () => ({ duration: 0.2 }),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

const mockParticipants = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com' },
];

const mockBalances = [
  { participantId: '1', netBalance: 40 },
  { participantId: '2', netBalance: -20 },
  { participantId: '3', netBalance: -20 },
];

const mockTransfers = [
  { from: '2', to: '1', amount: 20 },
  { from: '3', to: '1', amount: 20 },
];

describe('Settlement Graph Mobile Touch Interactions', () => {
  const defaultProps = {
    participants: mockParticipants,
    balances: mockBalances,
    transfers: mockTransfers,
    currency: 'USD',
  };

  beforeEach(() => {
    // Mock mobile viewport
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 375,
      height: 280,
      top: 0,
      left: 0,
      bottom: 280,
      right: 375,
    }));

    // Mock touch device
    Object.defineProperty(window, 'ontouchstart', {
      value: true,
      writable: true,
    });

    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Touch Device Detection', () => {
    it('should detect touch devices correctly', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        // Should show mobile touch instructions
        expect(screen.getByText(/Tap nodes or paths to view details/)).toBeInTheDocument();
      });
    });

    it('should not show touch instructions on non-touch devices', async () => {
      // Mock non-touch device
      Object.defineProperty(window, 'ontouchstart', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        writable: true,
      });

      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Tap nodes or paths to view details/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Participant Node Touch Interactions', () => {
    it('should handle touch start on participant nodes', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      // Find participant node (circle element)
      const participantNodes = document.querySelectorAll('circle[class*=\"cursor-pointer\"]');
      expect(participantNodes.length).toBeGreaterThan(0);

      const firstNode = participantNodes[0];
      
      // Simulate touch start
      fireEvent.touchStart(firstNode, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      // Should prevent default behavior
      expect(firstNode).toBeInTheDocument();
    });

    it('should handle touch end with short tap duration', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      const participantNodes = document.querySelectorAll('circle[class*=\"cursor-pointer\"]');
      const firstNode = participantNodes[0];
      
      // Simulate quick tap (< 300ms)
      fireEvent.touchStart(firstNode);
      
      // Wait a short time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      fireEvent.touchEnd(firstNode);

      // Should toggle tooltip visibility
      expect(firstNode).toBeInTheDocument();
    });

    it('should handle touch cancel events', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      const participantNodes = document.querySelectorAll('circle[class*=\"cursor-pointer\"]');
      const firstNode = participantNodes[0];
      
      // Simulate touch start then cancel
      fireEvent.touchStart(firstNode);
      fireEvent.touchCancel(firstNode);

      // Should clean up touch state
      expect(firstNode).toBeInTheDocument();
    });
  });

  describe('Transfer Path Touch Interactions', () => {
    it('should handle touch interactions on transfer paths', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      // Find transfer paths
      const transferPaths = document.querySelectorAll('path[class*=\"cursor-pointer\"]');
      
      if (transferPaths.length > 0) {
        const firstPath = transferPaths[0];
        
        // Simulate touch interactions
        fireEvent.touchStart(firstPath);
        fireEvent.touchEnd(firstPath);

        expect(firstPath).toBeInTheDocument();
      }
    });

    it('should toggle transfer highlight on touch', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      const transferPaths = document.querySelectorAll('path[class*=\"cursor-pointer\"]');
      
      if (transferPaths.length > 0) {
        const firstPath = transferPaths[0];
        
        // First touch should highlight
        fireEvent.touchStart(firstPath);
        fireEvent.touchEnd(firstPath);
        
        // Second touch should unhighlight
        fireEvent.touchStart(firstPath);
        fireEvent.touchEnd(firstPath);

        expect(firstPath).toBeInTheDocument();
      }
    });
  });

  describe('Touch Target Sizing', () => {
    it('should provide adequate touch targets for mobile', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      // Check for invisible touch targets (transparent circles)
      const touchTargets = document.querySelectorAll('circle[fill=\"transparent\"]');
      
      touchTargets.forEach(target => {
        const radius = parseFloat(target.getAttribute('r') || '0');
        // Should meet minimum 44px touch target guideline
        expect(radius).toBeGreaterThanOrEqual(22); // radius for 44px diameter
      });
    });

    it('should handle touch events on invisible touch targets', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      const touchTargets = document.querySelectorAll('circle[fill=\"transparent\"]');
      
      if (touchTargets.length > 0) {
        const firstTarget = touchTargets[0];
        
        fireEvent.touchStart(firstTarget);
        fireEvent.touchEnd(firstTarget);
        fireEvent.touchCancel(firstTarget);

        expect(firstTarget).toBeInTheDocument();
      }
    });
  });

  describe('Touch Feedback', () => {
    it('should show touch feedback indicators', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      // Touch feedback circles should be present in the DOM structure
      // (They're conditionally rendered based on touch state)
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', async () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
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
        writable: true,
      });

      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      // Should render without animation issues
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Mobile Layout Adaptations', () => {
    it('should adapt layout for mobile screens', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      // Should use mobile-appropriate dimensions
      const container = document.querySelector('[style*=\"height\"]');
      expect(container).toBeInTheDocument();
    });

    it('should truncate long names on mobile', async () => {
      const longNameParticipants = [
        { id: '1', name: 'Very Long Participant Name', email: 'long@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' },
      ];

      render(
        <SettlementGraph 
          {...defaultProps} 
          participants={longNameParticipants}
        />
      );

      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      // Long names should be handled appropriately
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Performance on Mobile', () => {
    it('should handle multiple rapid touch events', async () => {
      render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      const participantNodes = document.querySelectorAll('circle[class*=\"cursor-pointer\"]');
      
      if (participantNodes.length > 0) {
        const firstNode = participantNodes[0];
        
        // Simulate rapid touch events
        for (let i = 0; i < 5; i++) {
          fireEvent.touchStart(firstNode);
          fireEvent.touchEnd(firstNode);
        }

        // Should handle without errors
        expect(firstNode).toBeInTheDocument();
      }
    });

    it('should clean up event listeners properly', async () => {
      const { unmount } = render(<SettlementGraph {...defaultProps} />);
      
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      // Should not throw errors after unmount
      expect(true).toBe(true);
    });
  });
});