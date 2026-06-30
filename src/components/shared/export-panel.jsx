'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
// Card components no longer needed since we're using DialogTitle
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select } from '../ui/select';
import { useStorage } from '../../contexts/storage-context';
import { ExportImport } from '../../lib/storage/export-import';
import { computeNet, computeMinimalSettlements, formatCurrency } from '../../lib/calc';
import { Download, FileText, Share2, Printer } from 'lucide-react';

/**
 * Export panel component for exporting group data in various formats
 */
export function ExportPanel({ group, onClose }) {
  const storageManager = useStorage();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeSettlements, setIncludeSettlements] = useState(true);
  const [sanitizeNames, setSanitizeNames] = useState(false);

  const exportImport = new ExportImport(storageManager);

  const handleExport = async () => {
    if (!group) return;

    try {
      setIsExporting(true);

      switch (exportFormat) {
        case 'csv':
          await exportToCSV();
          break;
        case 'json':
          await exportToJSON();
          break;
        case 'pdf':
          await exportToPDF();
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      toast({
        title: 'Export Successful! 📄',
        description: `Your ${exportFormat.toUpperCase()} export has been downloaded.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: `Failed to export data: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    const csvData = await exportImport.exportToCSV(group.id, {
      includeSettlements
    });

    // Download expenses CSV
    downloadFile(csvData.expenses, `${group.name}-expenses.csv`, 'text/csv');

    // Download settlements CSV if included
    if (includeSettlements && csvData.settlements) {
      downloadFile(csvData.settlements, `${group.name}-settlements.csv`, 'text/csv');
    }
  };

  const exportToJSON = async () => {
    const jsonData = await exportImport.exportToJSON({
      groupIds: [group.id],
      sanitizeNames,
      includeSettings: false
    });

    const jsonString = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonString, `${group.name}-export.json`, 'application/json');
  };

  const exportToPDF = async () => {
    // Generate printable HTML content
    const printContent = generatePrintableContent();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Trigger print dialog
    printWindow.focus();
    printWindow.print();
    
    // Close the window after printing
    printWindow.addEventListener('afterprint', () => {
      printWindow.close();
    });
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePrintableContent = () => {
    
    // Calculate balances and settlements
    const balances = computeNet(group.expenses, group.participants);
    const settlements = computeMinimalSettlements(balances);
    
    // Generate HTML content
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${group.name} - Settlement Summary</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #eee; 
              padding-bottom: 20px;
            }
            .section { 
              margin-bottom: 30px; 
            }
            .section h2 { 
              color: #2563eb; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
            }
            th, td { 
              padding: 8px 12px; 
              text-align: left; 
              border-bottom: 1px solid #ddd;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
            }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            .transfer { 
              background-color: #f0f9ff; 
              padding: 10px; 
              margin: 5px 0; 
              border-left: 4px solid #2563eb;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${sanitizeNames ? 'Shared Group' : group.name}</h1>
            <p>Settlement Summary - Generated on ${new Date().toLocaleDateString()}</p>
            <p>Currency: ${group.currency}</p>
          </div>

          <div class="section">
            <h2>Participant Balances</h2>
            <table>
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Total Paid</th>
                  <th>Total Owed</th>
                  <th>Net Balance</th>
                </tr>
              </thead>
              <tbody>
                ${balances.map(balance => {
                  const participant = group.participants.find(p => p.id === balance.participantId);
                  const name = sanitizeNames ? `Person ${group.participants.indexOf(participant) + 1}` : participant?.name || 'Unknown';
                  return `
                    <tr>
                      <td>${name}</td>
                      <td>${formatCurrency(balance.totalPaid, group.currency)}</td>
                      <td>${formatCurrency(balance.totalOwed, group.currency)}</td>
                      <td class="${balance.netBalance >= 0 ? 'positive' : 'negative'}">
                        ${formatCurrency(balance.netBalance, group.currency)}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Recommended Settlements</h2>
            ${settlements.length === 0 ? 
              '<p>All balances are settled!</p>' :
              settlements.map(transfer => {
                const fromParticipant = group.participants.find(p => p.id === transfer.fromId);
                const toParticipant = group.participants.find(p => p.id === transfer.toId);
                const fromName = sanitizeNames ? `Person ${group.participants.indexOf(fromParticipant) + 1}` : fromParticipant?.name || 'Unknown';
                const toName = sanitizeNames ? `Person ${group.participants.indexOf(toParticipant) + 1}` : toParticipant?.name || 'Unknown';
                return `
                  <div class="transfer">
                    <strong>${fromName}</strong> pays <strong>${toName}</strong>: 
                    <strong>${formatCurrency(transfer.amount, group.currency)}</strong>
                  </div>
                `;
              }).join('')
            }
          </div>

          <div class="section">
            <h2>Expense Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Paid By</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                ${group.expenses.map(expense => {
                  const payer = group.participants.find(p => p.id === expense.payerId);
                  const payerName = sanitizeNames ? `Person ${group.participants.indexOf(payer) + 1}` : payer?.name || 'Unknown';
                  return `
                    <tr>
                      <td>${new Date(expense.date).toLocaleDateString()}</td>
                      <td>${expense.description}</td>
                      <td>${formatCurrency(expense.amount, group.currency)}</td>
                      <td>${payerName}</td>
                      <td>${expense.category}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Export Format</label>
          <Select
            value={exportFormat}
            onValueChange={setExportFormat}
            options={[
              { value: 'csv', label: 'CSV (Spreadsheet)' },
              { value: 'json', label: 'JSON (Data)' },
              { value: 'pdf', label: 'PDF (Printable)' }
            ]}
          />
        </div>

        {exportFormat === 'csv' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeSettlements"
              checked={includeSettlements}
              onChange={(e) => setIncludeSettlements(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="includeSettlements" className="text-sm">
              Include settlements
            </label>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sanitizeNames"
            checked={sanitizeNames}
            onChange={(e) => setSanitizeNames(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="sanitizeNames" className="text-sm">
            Replace names with generic identifiers
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
    </div>
  );
}