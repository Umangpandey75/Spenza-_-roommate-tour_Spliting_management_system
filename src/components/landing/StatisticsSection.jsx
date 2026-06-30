import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const StatCard = ({ value, label, prefix = '', suffix = '', delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center justify-center p-6 text-center border-r border-white/5 last:border-0"
    >
      <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-2">
        {prefix}{value}{suffix}
      </div>
      <div className="text-sm md:text-base font-medium text-slate-400">
        {label}
      </div>
    </motion.div>
  );
};

export function StatisticsSection() {
  return (
    <section className="py-20 relative z-10 border-y border-white/5 bg-white/[0.02]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-x-0 md:divide-x divide-white/5">
          <StatCard value="10,000" suffix="+" label="Active Users" delay={0.1} />
          <StatCard value="2" prefix="₹" suffix="M+" label="Expenses Managed" delay={0.2} />
          <StatCard value="500" suffix="+" label="Groups Created" delay={0.3} />
          <StatCard value="99.9" suffix="%" label="Calculation Accuracy" delay={0.4} />
        </div>
      </div>
    </section>
  );
}
