'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
  Container,
} from '@/components/ui/index.jsx';
import { AppShell, AppMain } from '@/components/shared/app-shell.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { getMotionVariants, getTransition } from '@/lib/utils/motion.js';

export default function DemoPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: 'Success!',
      description: 'All UI components are working correctly.',
      variant: 'default',
    });
  };

  return (
    <TooltipProvider>
      <AppShell pattern="dots">
        <AppMain>
          <Container>
          <motion.div
            className="space-y-8"
            initial="initial"
            animate="animate"
            variants={getMotionVariants('staggerContainer')}
          >
            <motion.div variants={getMotionVariants('staggerItem')}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 px-4">
                UI Components Demo
              </h1>
              <p className="text-center text-muted-foreground mb-4 text-sm sm:text-base px-4">
                Demonstrating accessible UI components with keyboard navigation, screen reader support, and motion preferences.
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div variants={getMotionVariants('staggerItem')}>
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 sm:gap-4">
                  <Button variant="default" aria-describedby="default-btn-desc">Default</Button>
                  <Button variant="secondary" aria-describedby="secondary-btn-desc">Secondary</Button>
                  <Button variant="outline" aria-describedby="outline-btn-desc">Outline</Button>
                  <Button variant="ghost" aria-describedby="ghost-btn-desc">Ghost</Button>
                  <Button variant="destructive" aria-describedby="destructive-btn-desc">Destructive</Button>
                  <Button size="sm" aria-describedby="small-btn-desc">Small</Button>
                  <Button size="lg" aria-describedby="large-btn-desc">Large</Button>
                  <Button onClick={showToast} aria-describedby="toast-btn-desc">Show Toast</Button>
                  
                  {/* Screen reader descriptions */}
                  <div className="sr-only">
                    <p id="default-btn-desc">Primary action button with default styling</p>
                    <p id="secondary-btn-desc">Secondary action button with muted styling</p>
                    <p id="outline-btn-desc">Button with outline border and transparent background</p>
                    <p id="ghost-btn-desc">Minimal button with hover effects only</p>
                    <p id="destructive-btn-desc">Warning button for destructive actions</p>
                    <p id="small-btn-desc">Compact button for tight spaces</p>
                    <p id="large-btn-desc">Prominent button for important actions</p>
                    <p id="toast-btn-desc">Demonstrates toast notification functionality</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Form Elements */}
            <motion.div variants={getMotionVariants('staggerItem')}>
              <Card>
                <CardHeader>
                  <CardTitle>Form Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="demo-input" className="block text-sm font-medium mb-2">
                      Text Input
                    </label>
                    <Input 
                      id="demo-input"
                      placeholder="Enter some text..." 
                      aria-describedby="input-help"
                    />
                    <p id="input-help" className="text-xs text-muted-foreground mt-1">
                      This input demonstrates proper labeling and description
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="demo-select" className="block text-sm font-medium mb-2">
                      Select Dropdown
                    </label>
                    <Select>
                      <SelectTrigger id="demo-select" aria-describedby="select-help">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <p id="select-help" className="text-xs text-muted-foreground mt-1">
                      Use arrow keys to navigate options when open
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={getMotionVariants('staggerItem')}>
              <Card>
                <CardHeader>
                  <CardTitle>Tabs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="tab1">
                    <TabsList>
                      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                      <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">
                      <p>Content for Tab 1</p>
                    </TabsContent>
                    <TabsContent value="tab2">
                      <p>Content for Tab 2</p>
                    </TabsContent>
                    <TabsContent value="tab3">
                      <p>Content for Tab 3</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dialogs and Drawers */}
            <motion.div variants={getMotionVariants('staggerItem')}>
              <Card>
                <CardHeader>
                  <CardTitle>Dialogs & Drawers</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 sm:gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" aria-describedby="dialog-desc">Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Accessible Dialog</DialogTitle>
                      </DialogHeader>
                      <p>This dialog demonstrates proper focus management and keyboard navigation. Press Escape to close.</p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm">Action 1</Button>
                        <Button size="sm" variant="outline">Action 2</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" aria-describedby="drawer-desc">Open Drawer</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Accessible Drawer</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4">
                        <p>This drawer includes focus trapping and proper ARIA attributes.</p>
                        <Button 
                          onClick={() => setDrawerOpen(false)}
                          className="mt-4"
                          aria-label="Close drawer"
                        >
                          Close
                        </Button>
                      </div>
                    </DrawerContent>
                  </Drawer>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" aria-describedby="tooltip-desc">Hover for Tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Accessible tooltip with proper ARIA support!</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {/* Screen reader descriptions */}
                  <div className="sr-only">
                    <p id="dialog-desc">Opens a modal dialog with focus management</p>
                    <p id="drawer-desc">Opens a slide-out drawer panel</p>
                    <p id="tooltip-desc">Shows additional information on hover or focus</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Accessibility Features Demo */}
            <motion.div variants={getMotionVariants('staggerItem')}>
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Keyboard Navigation</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Tab/Shift+Tab: Navigate between elements</li>
                        <li>• Arrow keys: Navigate within components</li>
                        <li>• Enter/Space: Activate buttons and links</li>
                        <li>• Escape: Close dialogs and modals</li>
                        <li>• Home/End: Jump to first/last items</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold">Screen Reader Support</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• ARIA labels and descriptions</li>
                        <li>• Proper heading hierarchy</li>
                        <li>• Landmark roles for navigation</li>
                        <li>• Live regions for status updates</li>
                        <li>• Alternative text for images</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold">Visual Accessibility</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• High contrast mode support</li>
                        <li>• Minimum 44px touch targets</li>
                        <li>• Clear focus indicators</li>
                        <li>• Scalable text and UI elements</li>
                        <li>• Color-independent information</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold">Motion Preferences</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Reduced motion mode</li>
                        <li>• System preference detection</li>
                        <li>• Manual motion controls</li>
                        <li>• Essential animations only</li>
                        <li>• Smooth performance</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Try it:</strong> Use Tab to navigate, press Escape in dialogs, 
                      or check the accessibility settings in the top navigation to customize your experience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          </Container>
        </AppMain>
      </AppShell>
    </TooltipProvider>
  );
}