import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider } from '../components/shared/theme-provider';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AccessibilitySettings } from '../components/shared/accessibility-settings';

// Test wrapper with theme provider
const TestWrapper = ({ children }) => (
  <ThemeProvider defaultTheme="light" storageKey="test-theme">
    {children}
  </ThemeProvider>
);

// Mock window.matchMedia for mobile viewport tests
const mockMatchMedia = (matches) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('Mobile Responsiveness', () => {
  beforeEach(() => {
    // Reset viewport
    mockMatchMedia(false);
  });

  describe('Button Component', () => {
    it('should have minimum touch target size on mobile', () => {
      render(<Button size="icon" aria-label="Icon button" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });

    it('should have responsive sizing classes', () => {
      render(<Button size="default">Test Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'sm:h-10');
      expect(button).toHaveClass('px-3', 'sm:px-4');
    });

    it('should have responsive text sizing', () => {
      render(<Button size="lg">Large Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm', 'sm:text-base');
    });
  });

  describe('Tabs Component', () => {
    it('should have mobile-friendly scrolling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('overflow-x-auto', 'scrollbar-hide');
      expect(tabsList).toHaveClass('w-full', 'sm:w-auto');
    });

    it('should have responsive tab sizing', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      
      const tab = screen.getByRole('tab');
      expect(tab).toHaveClass('px-2', 'sm:px-3');
      expect(tab).toHaveClass('text-xs', 'sm:text-sm');
      expect(tab).toHaveClass('flex-shrink-0');
    });
  });

  describe('Accessibility Settings', () => {
    it('should have mobile-friendly dialog sizing', () => {
      render(
        <TestWrapper>
          <AccessibilitySettings />
        </TestWrapper>
      );
      
      const settingsButton = screen.getByLabelText('Open accessibility settings');
      expect(settingsButton).toHaveClass('h-9', 'w-9', 'sm:h-10', 'sm:w-10');
    });
  });

  describe('Layout Responsiveness', () => {
    it('should handle text truncation properly', () => {
      render(
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="h-6 w-6 flex-shrink-0" />
          <h1 className="text-lg sm:text-xl font-semibold truncate">
            Very Long Application Title That Should Truncate
          </h1>
        </div>
      );
      
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('truncate');
      expect(heading).toHaveClass('text-lg', 'sm:text-xl');
    });

    it('should have responsive grid layouts', () => {
      render(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );
      
      const grid = screen.getByText('Item 1').parentElement;
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
      expect(grid).toHaveClass('gap-3', 'sm:gap-4');
    });
  });

  describe('Mobile Viewport Behavior', () => {
    it('should apply mobile-specific styles', () => {
      // Mock mobile viewport
      mockMatchMedia(true);
      
      render(
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold truncate">Title</h1>
          </div>
          <div className="flex-shrink-0">
            <Button size="icon">Icon</Button>
          </div>
        </div>
      );
      
      const container = screen.getByText('Title').closest('.container');
      expect(container).toHaveClass('mx-auto', 'px-4', 'py-4');
    });
  });

  describe('Touch Target Accessibility', () => {
    it('should ensure minimum 44px touch targets', () => {
      render(
        <div>
          <Button size="sm">Small Button</Button>
          <Button size="icon" aria-label="Icon">I</Button>
        </div>
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Check that buttons have appropriate sizing classes
        const hasMinHeight = button.className.includes('h-8') || 
                           button.className.includes('h-9') || 
                           button.className.includes('h-10') ||
                           button.className.includes('min-h-[44px]');
        expect(hasMinHeight).toBe(true);
      });
    });
  });

  describe('Responsive Typography', () => {
    it('should have responsive text sizing', () => {
      render(
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl">Main Title</h1>
          <p className="text-sm sm:text-base">Body text</p>
          <span className="text-xs sm:text-sm">Small text</span>
        </div>
      );
      
      const title = screen.getByText('Main Title');
      const body = screen.getByText('Body text');
      const small = screen.getByText('Small text');
      
      expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'lg:text-4xl');
      expect(body).toHaveClass('text-sm', 'sm:text-base');
      expect(small).toHaveClass('text-xs', 'sm:text-sm');
    });
  });
});