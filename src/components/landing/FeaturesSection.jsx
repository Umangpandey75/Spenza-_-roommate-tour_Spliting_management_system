import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calculator, Activity, Globe, ShieldCheck, Zap } from 'lucide-react';

const features = [
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: "Group Management",
    description: "Create unlimited groups for trips, apartments, or events. Add participants with custom weightings for uneven splits.",
    gradient: "from-purple-500/20 to-purple-500/0",
    borderGlow: "group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]"
  },
  {
    icon: <Calculator className="w-6 h-6 text-blue-400" />,
    title: "Smart Splitting",
    description: "Easily split by exact amounts, percentages, or shares. Our algorithm calculates the absolute minimum number of transactions.",
    gradient: "from-blue-500/20 to-blue-500/0",
    borderGlow: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]"
  },
  {
    icon: <Activity className="w-6 h-6 text-emerald-400" />,
    title: "Real-Time Insights",
    description: "Visualize spending with interactive charts. Track who paid for what and instantly see your current balance.",
    gradient: "from-emerald-500/20 to-emerald-500/0",
    borderGlow: "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]"
  },
  {
    icon: <Globe className="w-6 h-6 text-orange-400" />,
    title: "Multi-Currency",
    description: "Traveling abroad? Add expenses in any currency and we'll automatically convert them for accurate settlements.",
    gradient: "from-orange-500/20 to-orange-500/0",
    borderGlow: "group-hover:border-orange-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)]"
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
    title: "Secure Cloud Sync",
    description: "Your data is securely backed up and instantly synced across all your devices. Never lose an expense again.",
    gradient: "from-teal-500/20 to-teal-500/0",
    borderGlow: "group-hover:border-teal-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.4)]"
  },
  {
    icon: <Zap className="w-6 h-6 text-rose-400" />,
    title: "Instant Settlements",
    description: "Mark debts as paid with a single click. Keep a complete history of all settlements and transactions.",
    gradient: "from-rose-500/20 to-rose-500/0",
    borderGlow: "group-hover:border-rose-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.4)]"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            Everything you need for shared expenses
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            Spenza provides powerful tools disguised in a beautifully simple interface.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative p-8 rounded-3xl bg-[#1e293b]/50 backdrop-blur-sm border border-white/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${feature.borderGlow}`}
            >
              {/* Radial background gradient on hover */}
              <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
