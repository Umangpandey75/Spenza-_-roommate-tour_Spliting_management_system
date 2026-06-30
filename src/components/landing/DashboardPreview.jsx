import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calculator, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
      className="relative w-full max-w-2xl mx-auto xl:mx-0 perspective-[2000px]"
    >
      {/* Glow effect behind the dashboard */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse" />
      
      {/* Dashboard container */}
      <div className="relative bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-purple-900/20 overflow-hidden">
        
        {/* Mock Topbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">Weekend Trip</h3>
              <p className="text-xs text-slate-400">4 Members • USD</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0f172a] -mr-3 z-30 flex items-center justify-center text-xs font-bold text-emerald-400 bg-emerald-900/30">AL</div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0f172a] -mr-3 z-20 flex items-center justify-center text-xs font-bold text-blue-400 bg-blue-900/30">SK</div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0f172a] -mr-3 z-10 flex items-center justify-center text-xs font-bold text-purple-400 bg-purple-900/30">JM</div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0f172a] z-0 flex items-center justify-center text-xs font-bold text-orange-400 bg-orange-900/30">+1</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Calculator className="w-4 h-4" />
              <span className="text-xs font-medium">Total Expenses</span>
            </div>
            <div className="text-2xl font-bold text-white">$1,245.50</div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">Your Balance</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">+$320.00</div>
          </div>
        </div>

        {/* Recent Expenses List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-slate-300">Recent Activity</span>
            <span className="text-purple-400 text-xs font-medium cursor-pointer">View All</span>
          </div>

          {/* Expense Item 1 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl">
                🍽️
              </div>
              <div>
                <p className="font-medium text-white text-sm">Dinner at Mario's</p>
                <p className="text-xs text-slate-400">Alex paid • Today</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-white text-sm">$185.00</p>
              <p className="text-xs text-emerald-400 flex items-center justify-end gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> You owe $46.25
              </p>
            </div>
          </div>

          {/* Expense Item 2 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">
                🏠
              </div>
              <div>
                <p className="font-medium text-white text-sm">Airbnb Booking</p>
                <p className="text-xs text-slate-400">You paid • Yesterday</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-white text-sm">$850.00</p>
              <p className="text-xs text-blue-400 flex items-center justify-end gap-0.5">
                <ArrowDownRight className="w-3 h-3" /> You get $637.50
              </p>
            </div>
          </div>
        </div>

        {/* Floating element for depth */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-6 -bottom-6 bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-2xl shadow-xl shadow-emerald-900/20 border border-white/20 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">All Settled Up!</p>
              <p className="text-emerald-50 text-xs opacity-80">No debts remaining</p>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
