'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { LightDialog, LightDialogContent, LightDialogHeader, LightDialogTitle } from '../ui/light-dialog';
import { Input } from '../ui/input';
import { useStorage } from '../../contexts/storage-context';
import { ExportImport } from '../../lib/storage/export-import';
import { Share2, Copy, Check, AlertTriangle, Eye, Lock } from 'lucide-react';

/**
 * Share dialog component for creating shareable group links
 */
export function ShareDialog({ group, open, onOpenChange }) {
  const storageManager = useStorage();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sanitizeNames, setSanitizeNames] = useState(true);
  const [readOnly, setReadOnly] = useState(true);
  const [showWarning, setShowWarning] = useState(true);

  const exportImport = new ExportImport(storageManager);

  useEffect(() => {
    if (open && group) {
      generateShareUrl();
    }
  }, [open, group, sanitizeNames, readOnly]);

  const generateShareUrl = async () => {
    if (!group) return;

    try {
      setIsGenerating(true);
      const url = await exportImport.generateShareableURL(group.id, {
        sanitizeNames,
        readOnly
      });
      setShareUrl(url);
    } catch (error) {
      console.error('Failed to generate share URL:', error);
      toast({
        title: 'Share Link Failed',
        description: `Failed to generate share URL: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: 'Link Copied! 📋',
        description: 'Share link has been copied to your clipboard.',
        variant: 'default',
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: 'Link Copied! 📋',
        description: 'Share link has been copied to your clipboard.',
        variant: 'default',
      });
    }
  };

  const openPreview = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  if (!group) return null;

  return (
    <LightDialog open={open} onOpenChange={onOpenChange}>
      <LightDialogContent className="max-w-md">
        <LightDialogHeader>
          <LightDialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Group
          </LightDialogTitle>
        </LightDialogHeader>

        <div className="space-y-4">
          {/* Privacy Warning */}
          {showWarning && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Privacy Notice
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Group data will be encoded in the URL. Anyone with the link can view the data.
                      Consider using privacy options below.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWarning(false)}
                      className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
                    >
                      I understand
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Options */}
          <div className="space-y-3">
            <h4 className="font-medium">Privacy Options</h4>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sanitizeNames"
                checked={sanitizeNames}
                onChange={(e) => setSanitizeNames(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="sanitizeNames" className="text-sm">
                Replace names with generic identifiers (Person 1, Person 2, etc.)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="readOnly"
                checked={readOnly}
                onChange={(e) => setReadOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="readOnly" className="text-sm">
                Make shared data read-only
              </label>
            </div>
          </div>

          {/* Share URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Shareable Link</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                placeholder={isGenerating ? "Generating link..." : "Share URL will appear here"}
                className="flex-1"
              />
              <Button
                onClick={copyToClipboard}
                disabled={!shareUrl || isGenerating}
                variant="outline"
                size="sm"
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={openPreview}
              disabled={!shareUrl || isGenerating}
              variant="outline"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={copyToClipboard}
              disabled={!shareUrl || isGenerating}
              className="flex-1"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>

          {/* Share Information */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Shared data includes all expenses and participant information</p>
            <p>• Links are valid as long as the data structure doesn't change</p>
            <p>• No data is stored on external servers</p>
            {sanitizeNames && <p>• Names will be replaced with generic identifiers</p>}
            {readOnly && <p>• Recipients can only view data, not modify it</p>}
          </div>
        </div>
      </LightDialogContent>
    </LightDialog>
  );
}