'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CURRENCIES } from '../../lib/utils/constants';


export function CreateGroupDialog({ open, onOpenChange, onCreateGroup }) {
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (value) => {
    setGroupName(value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    // Create group with selected values
    onCreateGroup({
      name: groupName.trim(),
      currency: currency,
      participantNames: [] // Empty participants - can be added later
    });
    
    // Reset form
    setGroupName('');
    setCurrency('INR');
    setError('');
  };

  const handleClose = () => {
    setGroupName('');
    setCurrency('INR');
    setError('');
    onOpenChange(false);
  };

  // Helper function to get dialog styles based on theme
  const getDialogStyles = () => ({
    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)',
    color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
  });

  // Helper function to get input styles based on theme
  const getInputStyles = () => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    borderColor: error 
      ? (isDarkMode ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)')
      : (isDarkMode ? 'rgba(75, 85, 99, 0.6)' : 'rgba(209, 213, 219, 0.8)'),
    color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
  });

  // Helper function to get button styles based on theme
  const getPrimaryButtonStyles = () => ({
    backgroundColor: isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
    borderColor: isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
    color: 'white',
  });

  const getSecondaryButtonStyles = () => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.6)' : 'rgba(209, 213, 219, 0.8)',
    color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
  });

  // Helper function to get select styles based on theme
  const getSelectStyles = () => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.6)' : 'rgba(209, 213, 219, 0.8)',
    color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-full max-w-sm sm:max-w-md mx-4 sm:mx-auto border-2 shadow-xl"
        style={getDialogStyles()}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-lg font-semibold"
            style={{ color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)' }}
          >
            Create New Group
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label 
              htmlFor="group-name" 
              className="block text-sm font-medium mb-2"
              style={{ color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)' }}
            >
              Group Name *
            </label>
            <Input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Trip to Paris, Apartment 4B, etc."
              className="border-2 transition-colors duration-200 focus:ring-2 focus:ring-opacity-50"
              style={{
                ...getInputStyles(),
                '--tw-ring-color': isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
              }}
              autoFocus
            />
            {error && (
              <p 
                className="text-sm mt-1 font-medium"
                style={{ color: isDarkMode ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)' }}
              >
                {error}
              </p>
            )}
          </div>

          <div>
            <label 
              htmlFor="currency" 
              className="block text-sm font-medium mb-2"
              style={{ color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)' }}
            >
              Currency *
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border-2 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-opacity-50 focus:outline-none"
              style={{
                ...getSelectStyles(),
                '--tw-ring-color': isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
              }}
            >
              {CURRENCIES.map((curr) => (
                <option 
                  key={curr.code} 
                  value={curr.code}
                  style={{
                    backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'white',
                    color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
                  }}
                >
                  {curr.symbol} {curr.name} ({curr.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="w-full sm:w-auto border-2 transition-colors duration-200 hover:opacity-80 min-h-[44px]"
              style={getSecondaryButtonStyles()}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto border-2 transition-colors duration-200 hover:opacity-90 min-h-[44px]"
              style={getPrimaryButtonStyles()}
            >
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}