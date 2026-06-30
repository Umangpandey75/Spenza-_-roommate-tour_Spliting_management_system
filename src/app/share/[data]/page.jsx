'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { GridBackground } from '../../../components/ui/grid-background';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ExportImport } from '../../../lib/storage/export-import';
import { computeNet, computeMinimalSettlements, formatCurrency } from '../../../lib/calc';
import { AlertTriangle, ArrowLeft, Users, Calculator, Share2, Eye, EyeOff } from 'lucide-react';

/**
 * Shareable page for viewing encoded group data
 */
export default function SharePage({ params }) {
  const router = useRouter();
  const [shareData, setShareData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // Unwrap the params Promise
  const resolvedParams = use(params);

  useEffect(() => {
    loadShareData();
  }, [resolvedParams.data]);

  const loadShareData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a temporary export import instance (no storage needed for decoding)
      const exportImport = new ExportImport(null);
      const decodedData = await exportImport.decodeShareableURL(resolvedParams.data);

      if (!decodedData || !decodedData.group) {
        throw new Error('Invalid share data');
      }

      setShareData(decodedData);

      // Calculate balances and settlements
      const group = decodedData.group;
      const calculatedBalances = computeNet(group.expenses, group.participants);
      const calculatedSettlements = computeMinimalSettlements(calculatedBalances);

      setBalances(calculatedBalances);
      setSettlements(calculatedSettlements);
    } catch (err) {
      console.error('Failed to load share data:', err);
      setError(err.message || 'Failed to load shared group data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const getTotalExpenses = () => {
    if (!shareData?.group?.expenses) return 0;
    return shareData.group.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    if (!shareData?.group?.expenses) return {};
    
    const categories = {};
    shareData.group.expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    
    return categories;
  };

  if (isLoading) {
    return (
      <GridBackground className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared group...</p>
        </div>
      </GridBackground>
    );
  }

  if (error) {
    return (
      <GridBackground className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Unable to Load Shared Group
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </GridBackground>
    );
  }

  const group = shareData.group;
  const totalExpenses = getTotalExpenses();
  const expensesByCategory = getExpensesByCategory();

  return (
    <GridBackground>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Share2 className="h-6 w-6" />
                <h1 className="text-xl font-semibold">{group.name}</h1>
                {shareData.readOnly && (
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    Read Only
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Shared on {new Date(shareData.sharedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(totalExpenses, group.currency)}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Participants</p>
                    <p className="text-2xl font-bold">{group.participants.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Settlements Needed</p>
                    <p className="text-2xl font-bold">{settlements.length}</p>
                  </div>
                  <Share2 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balances */}
          <Card>
            <CardHeader>
              <CardTitle>Participant Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {balances.map((balance) => {
                  const participant = group.participants.find(p => p.id === balance.participantId);
                  return (
                    <div key={balance.participantId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            {participant?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="font-medium">{participant?.name || 'Unknown'}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${balance.netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(balance.netBalance, group.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Paid: {formatCurrency(balance.totalPaid, group.currency)} | 
                          Owed: {formatCurrency(balance.totalOwed, group.currency)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Settlements */}
          {settlements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Settlements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settlements.map((transfer, index) => {
                    const fromParticipant = group.participants.find(p => p.id === transfer.fromId);
                    const toParticipant = group.participants.find(p => p.id === transfer.toId);
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                                {fromParticipant?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="font-medium">{fromParticipant?.name || 'Unknown'}</span>
                          </div>
                          <span className="text-muted-foreground">pays</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                {toParticipant?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="font-medium">{toParticipant?.name || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="font-bold text-lg">
                          {formatCurrency(transfer.amount, group.currency)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expense Details Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expense Details</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Details
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {showDetails && (
              <CardContent>
                <div className="space-y-4">
                  {/* Category Breakdown */}
                  <div>
                    <h4 className="font-medium mb-2">By Category</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(expensesByCategory).map(([category, amount]) => (
                        <div key={category} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
                          <div className="text-sm font-medium">{category}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(amount, group.currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expense List */}
                  <div>
                    <h4 className="font-medium mb-2">All Expenses ({group.expenses.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {group.expenses.map((expense) => {
                        const payer = group.participants.find(p => p.id === expense.payerId);
                        return (
                          <div key={expense.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div>
                              <div className="font-medium">{expense.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(expense.date).toLocaleDateString()} • {expense.category} • Paid by {payer?.name || 'Unknown'}
                              </div>
                            </div>
                            <div className="font-semibold">
                              {formatCurrency(expense.amount, group.currency)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Footer Info */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">This is a shared view</p>
                  <p>
                    This group was shared on {new Date(shareData.sharedAt).toLocaleDateString()}.
                    {shareData.readOnly && ' This is a read-only view - you cannot make changes.'}
                    {' '}To create your own groups, visit the{' '}
                    <button
                      onClick={handleBack}
                      className="underline hover:no-underline font-medium"
                    >
                      Group Expense Splitter
                    </button>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </GridBackground>
  );
}