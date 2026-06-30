import React from 'react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Food', icon: '🍕', color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/20' },
  { name: 'Rent', icon: '🏠', color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20' },
  { name: 'Travel', icon: '🚕', color: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/20' },
  { name: 'Grocery', icon: '🛒', color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20' },
  { name: 'Entertainment', icon: '🎬', color: 'from-pink-500/20 to-pink-600/5', border: 'border-pink-500/20' },
  { name: 'Utilities', icon: '💡', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20' },
];

export function CategoriesSection() {
  return (
    <section id="categories" className="py-24 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
            >
              Categorize every expense
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-slate-400"
            >
              Keep your spending organized and beautifully categorized so you always know exactly where your money goes.
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1, type: "spring" }}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:scale-105 transition-transform duration-300 cursor-pointer group`}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-xl">{cat.icon}</span>
              <span className="font-semibold text-white/90 text-sm tracking-wide">{cat.name}</span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
