import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPanel } from '../export-panel';
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
  expenses: [
    {
      id: 'e1',
      description: 'Dinner',
      amount: 60,
      currency: 'USD',
      date: new Date('2024-01-01'),
      category: 'Food',
      payerId: 'p1',
      split: [
        { participantId: 'p1', weight: 1, included: true },
        { participantId: 'p2', weight: 1, included: true }
      ]
    }
  ]
};

describe('ExportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document methods
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  it('renders export panel with format options', () => {
    render(
      <MockStorageProvider>
        <ExportPanel group={mockGroup} />
      </MockStorageProvider>
    );

    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('shows sanitize names option', () => {
    render(
      <MockStorageProvider>
        <ExportPanel group={mockGroup} />
      </MockStorageProvider>
    );

    expect(screen.getByText('Replace names with generic identifiers')).toBeInTheDocument();
  });

  it('shows include settlements option for CSV format', () => {
    render(
      <MockStorageProvider>
        <ExportPanel group={mockGroup} />
      </MockStorageProvider>
    );

    // CSV should be the default format
    expect(screen.getByText('Include settlements')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();
    
    render(
      <MockStorageProvider>
        <ExportPanel group={mockGroup} onClose={mockOnClose} />
      </MockStorageProvider>
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles export button click', async () => {
    render(
      <MockStorageProvider>
        <ExportPanel group={mockGroup} />
      </MockStorageProvider>
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });
  });
});