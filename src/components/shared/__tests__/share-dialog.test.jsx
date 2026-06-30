import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareDialog } from '../share-dialog';
import { StorageProvider } from '../../../contexts/storage-context';

// Mock the storage context
const mockStorageManager = {
  getGroup: vi.fn(),
  getGroups: vi.fn(),
  getSettings: vi.fn(),
};

const MockStorageProvider = ({ children }) => (
  <StorageProvider value={mockStorageManager}>
    {children}
  </StorageProvider>
);

const mockGroup = {
  id: 'test-group',
  name: 'Test Group',
  currency: 'USD',
  participants: [
    { id: 'p1', name: 'Alice', defaultWeight: 1 },
    { id: 'p2', name: 'Bob', defaultWeight: 1 }
  ],
  expenses: []
};

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

describe('ShareDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open
    global.window.open = vi.fn();
  });

  it('renders share dialog when open', () => {
    render(
      <MockStorageProvider>
        <ShareDialog group={mockGroup} open={true} onOpenChange={vi.fn()} />
      </MockStorageProvider>
    );

    expect(screen.getByText('Share Group')).toBeInTheDocument();
    expect(screen.getByText('Privacy Notice')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MockStorageProvider>
        <ShareDialog group={mockGroup} open={false} onOpenChange={vi.fn()} />
      </MockStorageProvider>
    );

    expect(screen.queryByText('Share Group')).not.toBeInTheDocument();
  });

  it('shows privacy options', () => {
    render(
      <MockStorageProvider>
        <ShareDialog group={mockGroup} open={true} onOpenChange={vi.fn()} />
      </MockStorageProvider>
    );

    expect(screen.getByText('Replace names with generic identifiers (Person 1, Person 2, etc.)')).toBeInTheDocument();
    expect(screen.getByText('Make shared data read-only')).toBeInTheDocument();
  });

  it('shows shareable link input', () => {
    render(
      <MockStorageProvider>
        <ShareDialog group={mockGroup} open={true} onOpenChange={vi.fn()} />
      </MockStorageProvider>
    );

    expect(screen.getByText('Shareable Link')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Share URL will appear here')).toBeInTheDocument();
  });

  it('has preview and share buttons', () => {
    render(
      <MockStorageProvider>
        <ShareDialog group={mockGroup} open={true} onOpenChange={vi.fn()} />
      </MockStorageProvider>
    );

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('shows privacy information', () => {
    render(
      <MockStorageProvider>
        <ShareDialog group={mockGroup} open={true} onOpenChange={vi.fn()} />
      </MockStorageProvider>
    );

    expect(screen.getByText('• Shared data includes all expenses and participant information')).toBeInTheDocument();
    expect(screen.getByText('• Links are valid as long as the data structure doesn\'t change')).toBeInTheDocument();
    expect(screen.getByText('• No data is stored on external servers')).toBeInTheDocument();
  });
});