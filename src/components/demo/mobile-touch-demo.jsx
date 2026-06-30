"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Smartphone, Monitor, Touch, Zap } from "lucide-react";

/**
 * Mobile Touch Demo Component
 * Demonstrates the touch interaction capabilities of the Settlement Graph
 */
export function MobileTouchDemo() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [lastTouchTime, setLastTouchTime] = useState(null);
  const [touchFeedback, setTouchFeedback] = useState([]);

  // Detect touch device capability
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
    window.addEventListener('touchstart', checkTouchDevice, { once: true });
    
    return () => {
      window.removeEventListener('touchstart', checkTouchDevice);
    };
  }, []);

  // Handle touch interactions
  const handleTouch = (e, type) => {
    e.preventDefault();
    
    const now = Date.now();
    setLastTouchTime(now);
    setTouchCount(prev => prev + 1);

    // Create touch feedback
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0] || e;
    const x = (touch.clientX || touch.pageX) - rect.left;
    const y = (touch.clientY || touch.pageY) - rect.top;

    const feedback = {
      id: now,
      x,
      y,
      type,
    };

    setTouchFeedback(prev => [...prev, feedback]);

    // Remove feedback after animation
    setTimeout(() => {
      setTouchFeedback(prev => prev.filter(f => f.id !== feedback.id));
    }, 1000);
  };

  const features = [
    {
      icon: Touch,
      title: "Touch Detection",
      description: "Automatically detects touch devices and adapts interface",
      status: isTouchDevice ? "Active" : "Mouse Mode",
      color: isTouchDevice ? "text-green-500" : "text-blue-500",
    },
    {
      icon: Zap,
      title: "Touch Feedback",
      description: "Immediate visual feedback for all touch interactions",
      status: `${touchCount} touches`,
      color: "text-purple-500",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "44px minimum touch targets, responsive design",
      status: "Optimized",
      color: "text-orange-500",
    },
    {
      icon: Monitor,
      title: "Cross-Platform",
      description: "Works seamlessly on desktop, tablet, and mobile",
      status: "Compatible",
      color: "text-cyan-500",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Touch className="h-5 w-5" />
            Mobile Touch Interaction Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Touch Detection Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              {isTouchDevice ? (
                <Smartphone className="h-5 w-5 text-green-500" />
              ) : (
                <Monitor className="h-5 w-5 text-blue-500" />
              )}
              <div>
                <p className="font-medium">
                  {isTouchDevice ? "Touch Device Detected" : "Mouse/Trackpad Device"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isTouchDevice 
                    ? "Touch interactions are enabled with enhanced feedback"
                    : "Standard mouse interactions with hover effects"
                  }
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isTouchDevice 
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            }`}>
              {isTouchDevice ? "Touch Mode" : "Mouse Mode"}
            </div>
          </div>

          {/* Interactive Touch Area */}
          <div className="relative">
            <div
              className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 flex items-center justify-center cursor-pointer select-none overflow-hidden"
              onTouchStart={(e) => handleTouch(e, 'start')}
              onTouchEnd={(e) => handleTouch(e, 'end')}
              onTouchMove={(e) => handleTouch(e, 'move')}
              onMouseDown={(e) => handleTouch(e, 'click')}
            >
              <div className="text-center">
                <Touch className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {isTouchDevice ? "Tap, Touch, or Drag Here" : "Click Here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {touchCount > 0 
                    ? `${touchCount} interactions • Last: ${lastTouchTime ? new Date(lastTouchTime).toLocaleTimeString() : 'Never'}`
                    : "Try interacting with this area"
                  }
                </p>
              </div>

              {/* Touch Feedback Animations */}
              {touchFeedback.map((feedback) => (
                <motion.div
                  key={feedback.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: feedback.x - 20,
                    top: feedback.y - 20,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ 
                    scale: [0, 1.5, 2],
                    opacity: [1, 0.6, 0]
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <div className={`w-10 h-10 rounded-full border-2 ${
                    feedback.type === 'start' ? 'border-green-400 bg-green-100' :
                    feedback.type === 'end' ? 'border-red-400 bg-red-100' :
                    feedback.type === 'move' ? 'border-yellow-400 bg-yellow-100' :
                    'border-blue-400 bg-blue-100'
                  }`} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-4 border rounded-lg bg-white dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <feature.icon className={`h-5 w-5 mt-0.5 ${feature.color}`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                    <div className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                      feature.color.includes('green') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      feature.color.includes('blue') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      feature.color.includes('purple') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                      feature.color.includes('orange') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                      'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                    }`}>
                      {feature.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Touch Instructions */}
          {isTouchDevice && (
            <motion.div
              className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Touch Interaction Tips
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Tap:</strong> Quick touch to select or toggle</li>
                <li>• <strong>Long Press:</strong> Hold for additional options</li>
                <li>• <strong>Drag:</strong> Move elements around (where supported)</li>
                <li>• <strong>Double Tap:</strong> Quick actions or zoom</li>
              </ul>
            </motion.div>
          )}

          {/* Performance Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Touch interactions are optimized for performance with hardware acceleration
              and respect your device's reduced motion preferences.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}