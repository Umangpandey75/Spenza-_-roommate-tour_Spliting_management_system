"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatCurrency } from "../../lib/calc";
import { cn } from "../../lib/utils/cn";
import {
  ArrowRight,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

/**
 * SettlementGraph component with clean, minimal design
 * Shows participants as nodes and transfers as animated paths between them
 */
export const SettlementGraph = React.memo(function SettlementGraph({
  transfers = [],
  participants = [],
  balances = [],
  currency = "USD",
  className,
}) {
  const [hoveredTransfer, setHoveredTransfer] = useState(null);
  const [hoveredParticipant, setHoveredParticipant] = useState(null);
  const [activeParticipant, setActiveParticipant] = useState(null); // For touch interactions
  const [touchStartTime, setTouchStartTime] = useState(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 320, height: 240 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device capability and reduced motion preference
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

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Update dimensions on resize with mobile-first approach
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        const rect = container.getBoundingClientRect();
        const containerWidth = rect.width;
        
        // Mobile-first responsive dimensions
        let width, height;
        
        if (containerWidth < 640) {
          // Mobile: smaller, more square aspect ratio
          width = Math.max(320, containerWidth - 32); // Account for padding
          height = Math.max(240, width * 0.75);
        } else if (containerWidth < 1024) {
          // Tablet: medium size
          width = Math.max(480, containerWidth - 48);
          height = Math.max(320, width * 0.67);
        } else {
          // Desktop: larger size
          width = Math.max(600, Math.min(800, containerWidth - 64));
          height = Math.max(400, Math.min(500, width * 0.6));
        }
        
        setDimensions({ width, height });
      }
    };

    // Initial update with a small delay to ensure container is rendered
    const timer = setTimeout(updateDimensions, 100);
    
    window.addEventListener("resize", updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Calculate optimal node positions with mobile-responsive layout
  const nodePositions = useMemo(() => {
    if (!participants.length) return {};

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const positions = {};
    
    // Mobile-responsive margins
    const isMobile = dimensions.width < 640;
    const margin = isMobile ? 60 : 80; // Space for labels and tooltips

    if (participants.length === 1) {
      positions[participants[0].id] = {
        x: centerX,
        y: centerY,
        participant: participants[0],
      };
    } else if (participants.length === 2) {
      // Responsive layout for 2 participants
      if (isMobile && dimensions.width < dimensions.height) {
        // Vertical layout on narrow mobile screens
        const spacing = Math.min(dimensions.height * 0.3, 120);
        positions[participants[0].id] = {
          x: centerX,
          y: centerY - spacing / 2,
          participant: participants[0],
        };
        positions[participants[1].id] = {
          x: centerX,
          y: centerY + spacing / 2,
          participant: participants[1],
        };
      } else {
        // Horizontal layout
        const spacing = Math.min(dimensions.width * 0.4, isMobile ? 140 : 200);
        positions[participants[0].id] = {
          x: centerX - spacing / 2,
          y: centerY,
          participant: participants[0],
        };
        positions[participants[1].id] = {
          x: centerX + spacing / 2,
          y: centerY,
          participant: participants[1],
        };
      }
    } else if (participants.length === 3) {
      // Triangle layout with responsive sizing
      const radius = Math.min(
        (dimensions.width - margin) / 2, 
        (dimensions.height - margin) / 2,
        isMobile ? 80 : 120
      );
      participants.forEach((participant, index) => {
        const angle = (index / 3) * 2 * Math.PI - Math.PI / 2;
        positions[participant.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          participant,
        };
      });
    } else {
      // Circular layout with responsive sizing
      const radius = Math.min(
        (dimensions.width - margin) / 2,
        (dimensions.height - margin) / 2,
        isMobile ? 70 : 100
      );
      participants.forEach((participant, index) => {
        const angle = (index / participants.length) * 2 * Math.PI - Math.PI / 2;
        positions[participant.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          participant,
        };
      });
    }

    return positions;
  }, [participants, dimensions]);

  // Get balance for a participant - memoized for performance
  const getBalance = useCallback((participantId) => {
    const balance = balances.find((b) => b.participantId === participantId);
    return balance ? balance.netBalance : 0;
  }, [balances]);

  if (!participants.length) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No participants to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full bg-card border", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Settlement Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div 
          className="relative w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-100/80 to-gray-100/60" 
          style={{ height: dimensions.height, minHeight: '240px' }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="block"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Clean minimal theme definitions */}
            <defs>
              {/* Subtle grid pattern */}
              <pattern
                id="grid"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="0.5"
                  opacity="0.4"
                />
              </pattern>

              {/* Clean shadow filter */}
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="4"
                  floodColor="#000000"
                  floodOpacity="0.1"
                />
              </filter>

              {/* Transfer gradient */}
              <linearGradient
                id="transferGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              {/* Success gradient */}
              <linearGradient
                id="successGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>

              {/* Danger gradient */}
              <linearGradient
                id="dangerGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>

              {/* Neutral gradient */}
              <linearGradient
                id="neutralGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#9ca3af" />
                <stop offset="100%" stopColor="#6b7280" />
              </linearGradient>

              {/* Animated arrow marker */}
              <marker
                id="arrowhead"
                markerWidth="12"
                markerHeight="8"
                refX="11"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <motion.polygon
                  points="0 0, 12 4, 0 8, 3 4"
                  fill="#60a5fa"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                />
              </marker>

              {/* Animated arrow particles */}
              <circle id="particle" r="2" fill="#60a5fa" opacity="0.8" />
            </defs>

            {/* Light pastel background */}
            <rect width="100%" height="100%" fill="url(#lightGradient)" />
            
            {/* Light gradient definition */}
            <defs>
              <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
            </defs>

            {/* Subtle grid overlay */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Wavy transfer paths with animations */}
            <AnimatePresence>
              {transfers.map((transfer, index) => {
                const fromPos = nodePositions[transfer.from];
                const toPos = nodePositions[transfer.to];

                if (!fromPos || !toPos) return null;

                const isHovered = hoveredTransfer === index;
                const isMobile = dimensions.width < 640;

                // Calculate wavy path with responsive sizing
                const dx = toPos.x - fromPos.x;
                const dy = toPos.y - fromPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const nodeRadius = isMobile ? 28 : 35;

                // Start and end points adjusted for node radius
                const startX = fromPos.x + (dx / distance) * nodeRadius;
                const startY = fromPos.y + (dy / distance) * nodeRadius;
                const endX = toPos.x - (dx / distance) * (nodeRadius + 15);
                const endY = toPos.y - (dy / distance) * (nodeRadius + 15);

                // Create wavy path with curve
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                // Perpendicular offset for curve (responsive)
                const perpX = -dy / distance;
                const perpY = dx / distance;
                const curveOffset = Math.min(isMobile ? 25 : 40, distance * 0.15);

                // Control points for smooth curve
                const controlX1 =
                  startX + (midX - startX) * 0.5 + perpX * curveOffset;
                const controlY1 =
                  startY + (midY - startY) * 0.5 + perpY * curveOffset;
                const controlX2 =
                  midX + (endX - midX) * 0.5 + perpX * curveOffset;
                const controlY2 =
                  midY + (endY - midY) * 0.5 + perpY * curveOffset;

                const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

                // Calculate label position away from path
                const labelOffset = 25;
                const labelX = midX + perpX * (curveOffset + labelOffset);
                const labelY = midY + perpY * (curveOffset + labelOffset);

                return (
                  <motion.g key={index}>
                    {/* Wavy transfer path */}
                    <motion.path
                      d={pathData}
                      fill="none"
                      stroke="url(#transferGradient)"
                      strokeWidth={isHovered ? 4 : 3}
                      strokeLinecap="round"
                      markerEnd="url(#arrowhead)"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredTransfer(index)}
                      onMouseLeave={() => setHoveredTransfer(null)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        setHoveredTransfer(index);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        // Toggle transfer highlight on touch
                        if (hoveredTransfer === index) {
                          setHoveredTransfer(null);
                        } else {
                          setHoveredTransfer(index);
                        }
                      }}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: 1,
                        opacity: 1,
                        strokeWidth: isHovered ? 4 : 3,
                      }}
                      transition={{
                        pathLength: {
                          duration: prefersReducedMotion ? 0.3 : 1.2,
                          delay: prefersReducedMotion ? 0 : index * 0.2,
                          ease: "easeInOut",
                        },
                        opacity: { duration: prefersReducedMotion ? 0.1 : 0.3 },
                        strokeWidth: { duration: 0.2 },
                      }}
                    />

                    {/* Animated particles along path */}
                    <motion.circle
                      r="3"
                      fill="#60a5fa"
                      opacity="0.8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 1 + index * 0.2,
                        ease: "easeInOut",
                      }}
                    >
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        begin={`${1 + index * 0.2}s`}
                      >
                        <mpath href={`#path-${index}`} />
                      </animateMotion>
                    </motion.circle>

                    {/* Hidden path for particle animation */}
                    <path
                      id={`path-${index}`}
                      d={pathData}
                      fill="none"
                      stroke="none"
                    />

                    {/* Amount label positioned away from path */}
                    <motion.g
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: isHovered ? 1.1 : 1,
                      }}
                      transition={{
                        delay: 0.8 + index * 0.1,
                        scale: { duration: 0.2 },
                      }}
                    >
                      {/* Label background */}
                      <motion.rect
                        x={labelX - 35}
                        y={labelY - 12}
                        width={70}
                        height={24}
                        rx={12}
                        fill="#ffffff"
                        stroke="#60a5fa"
                        strokeWidth="1"
                        filter="url(#shadow)"
                      />
                      {/* Amount text */}
                      <motion.text
                        x={labelX}
                        y={labelY + 4}
                        textAnchor="middle"
                        className="text-sm font-semibold"
                        fill="#1f2937"
                      >
                        {formatCurrency(transfer.amount, currency)}
                      </motion.text>
                    </motion.g>

                    {/* Pulsing glow effect on hover */}
                    {isHovered && (
                      <motion.path
                        d={pathData}
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="8"
                        strokeLinecap="round"
                        opacity="0.3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.g>
                );
              })}
            </AnimatePresence>

            {/* Participant nodes */}
            {Object.entries(nodePositions).map(([participantId, pos]) => {
              const balance = getBalance(participantId);
              const isCreditor = balance > 0;
              const isDebtor = balance < 0;
              const isSettled = balance === 0;
              const isHovered = hoveredParticipant === participantId;
              const isMobile = dimensions.width < 640;
              const nodeRadius = isMobile ? 28 : 35;

              return (
                <motion.g key={participantId}>
                  {/* Node circle */}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    fill={
                      isCreditor
                        ? "url(#successGradient)"
                        : isDebtor
                        ? "url(#dangerGradient)"
                        : "url(#neutralGradient)"
                    }
                    stroke="white"
                    strokeWidth="3"
                    className="cursor-pointer"
                    filter="url(#shadow)"
                    onMouseEnter={() => setHoveredParticipant(participantId)}
                    onMouseLeave={() => setHoveredParticipant(null)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setTouchStartTime(Date.now());
                      setActiveParticipant(participantId);
                      setHoveredParticipant(participantId);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      const touchDuration = Date.now() - (touchStartTime || 0);
                      
                      // Short tap (< 300ms) - toggle tooltip
                      if (touchDuration < 300) {
                        if (hoveredParticipant === participantId) {
                          setHoveredParticipant(null);
                        } else {
                          setHoveredParticipant(participantId);
                        }
                      }
                      
                      setActiveParticipant(null);
                      setTouchStartTime(null);
                    }}
                    onTouchCancel={() => {
                      setActiveParticipant(null);
                      setHoveredParticipant(null);
                      setTouchStartTime(null);
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: isHovered ? 1.1 : (activeParticipant === participantId ? 1.05 : 1),
                      opacity: 1,
                    }}
                    transition={{
                      scale: { duration: prefersReducedMotion ? 0.1 : 0.2 },
                      opacity: { duration: prefersReducedMotion ? 0.1 : 0.3 },
                    }}
                  />

                  {/* Larger invisible touch target for mobile */}
                  {isTouchDevice && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={Math.max(nodeRadius + 15, 44)} // Minimum 44px touch target
                      fill="transparent"
                      className="cursor-pointer"
                      onTouchStart={(e) => {
                        e.preventDefault();
                        setTouchStartTime(Date.now());
                        setActiveParticipant(participantId);
                        setHoveredParticipant(participantId);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        const touchDuration = Date.now() - (touchStartTime || 0);
                        
                        if (touchDuration < 300) {
                          if (hoveredParticipant === participantId) {
                            setHoveredParticipant(null);
                          } else {
                            setHoveredParticipant(participantId);
                          }
                        }
                        
                        setActiveParticipant(null);
                        setTouchStartTime(null);
                      }}
                      onTouchCancel={() => {
                        setActiveParticipant(null);
                        setHoveredParticipant(null);
                        setTouchStartTime(null);
                      }}
                    />
                  )}

                  {/* Touch feedback indicator for mobile */}
                  {isTouchDevice && activeParticipant === participantId && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius + 8}
                      fill="none"
                      stroke="rgba(96, 165, 250, 0.6)"
                      strokeWidth="2"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: [0.8, 1.2, 1],
                        opacity: [0, 0.8, 0.4]
                      }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    />
                  )}

                  {/* Status icon */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {isCreditor && (
                      <TrendingUp
                        x={pos.x - 8}
                        y={pos.y - 20}
                        width={16}
                        height={16}
                        className="fill-white"
                      />
                    )}
                    {isDebtor && (
                      <TrendingDown
                        x={pos.x - 8}
                        y={pos.y - 20}
                        width={16}
                        height={16}
                        className="fill-white"
                      />
                    )}
                    {isSettled && (
                      <Minus
                        x={pos.x - 8}
                        y={pos.y - 20}
                        width={16}
                        height={16}
                        className="fill-white"
                      />
                    )}
                  </motion.g>

                  {/* Participant name */}
                  <motion.text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    className="pointer-events-none"
                    fill="white"
                    fontSize={isMobile ? "12" : "14"}
                    fontWeight="500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {isMobile && pos.participant.name.length > 8 
                      ? pos.participant.name.substring(0, 8) + '...'
                      : pos.participant.name}
                  </motion.text>

                  {/* Balance amount */}
                  <motion.text
                    x={pos.x}
                    y={pos.y + (isMobile ? 42 : 50)}
                    textAnchor="middle"
                    className="pointer-events-none"
                    fill="#64748b"
                    fontSize={isMobile ? "10" : "12"}
                    fontWeight="500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {balance === 0
                      ? "✓ Settled"
                      : formatCurrency(Math.abs(balance), currency)}
                  </motion.text>

                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.g
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Tooltip background */}
                        <motion.rect
                          x={pos.x - 60}
                          y={pos.y - 80}
                          width={120}
                          height={40}
                          rx={8}
                          fill="#ffffff"
                          stroke="#60a5fa"
                          strokeWidth="1"
                          filter="url(#shadow)"
                        />
                        {/* Tooltip text */}
                        <motion.text
                          x={pos.x}
                          y={pos.y - 68}
                          textAnchor="middle"
                          className="text-xs font-medium"
                          fill="#1f2937"
                        >
                          {pos.participant.name}
                        </motion.text>
                        <motion.text
                          x={pos.x}
                          y={pos.y - 54}
                          textAnchor="middle"
                          className="text-xs"
                          fill={
                            isCreditor
                              ? "#059669"
                              : isDebtor
                              ? "#dc2626"
                              : "#6b7280"
                          }
                        >
                          {isCreditor
                            ? "Will receive"
                            : isDebtor
                            ? "Needs to pay"
                            : "All settled"}
                        </motion.text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* Mobile touch instructions */}
        {isTouchDevice && (
          <div className="mt-4 p-3 bg-blue-50/80 dark:bg-blue-950/30 rounded-lg border border-blue-200/60 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-300 text-center">
              💡 Tap nodes or paths to view details • Tap again to hide
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span className="text-muted-foreground">Will receive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">Needs to pay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span className="text-muted-foreground">All settled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
