import React from 'react';
import { motion } from 'framer-motion';

export function AnalyticsPreviewSection() {
  return (
    <section className="py-24 relative z-10 overflow-hidden bg-white/[0.02] border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            Powerful Analytics
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            Gain complete visibility into your spending habits with real-time, interactive insights.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Bar Chart Mock */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="col-span-1 lg:col-span-2 bg-[#0f172a]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Monthly Spending</h3>
            <div className="flex items-end gap-2 sm:gap-4 h-64 mt-4">
              {[40, 70, 45, 90, 65, 100, 55].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative flex-1 flex items-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                      className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pie Chart Mock */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0f172a]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col"
          >
            <h3 className="text-lg font-semibold text-white mb-6">By Category</h3>
            <div className="flex-1 flex items-center justify-center relative">
              {/* CSS Conic Gradient Pie Chart */}
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, type: "spring" }}
                className="w-48 h-48 rounded-full"
                style={{
                  background: `conic-gradient(
                    #8b5cf6 0% 35%, 
                    #3b82f6 35% 65%, 
                    #10b981 65% 85%, 
                    #f59e0b 85% 100%
                  )`
                }}
              >
                {/* Inner cutout for donut chart look */}
                <div className="absolute inset-4 bg-[#0f172a] rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-2xl font-bold text-white">$2.4k</span>
                  <span className="text-xs text-slate-400">Total</span>
                </div>
              </motion.div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="flex items-center gap-2 text-sm text-slate-300"><div className="w-3 h-3 rounded-full bg-purple-500" /> Food</div>
              <div className="flex items-center gap-2 text-sm text-slate-300"><div className="w-3 h-3 rounded-full bg-blue-500" /> Rent</div>
              <div className="flex items-center gap-2 text-sm text-slate-300"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Travel</div>
              <div className="flex items-center gap-2 text-sm text-slate-300"><div className="w-3 h-3 rounded-full bg-amber-500" /> Other</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
