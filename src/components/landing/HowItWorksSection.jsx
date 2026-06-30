import React from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, UserPlus, Receipt, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: <FolderPlus className="w-6 h-6" />,
    title: "Create Group",
    description: "Start a new group for your upcoming trip, apartment, or shared event."
  },
  {
    icon: <UserPlus className="w-6 h-6" />,
    title: "Add Friends",
    description: "Invite members to join your group so everyone can track expenses together."
  },
  {
    icon: <Receipt className="w-6 h-6" />,
    title: "Split Expenses",
    description: "Log your costs. We automatically calculate who owes what, down to the cent."
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Settle Instantly",
    description: "See the absolute minimum number of transactions needed to settle all debts."
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            Four simple steps to financial harmony.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center text-purple-400 mb-6 shadow-xl shadow-purple-900/20 relative z-10">
                  {step.icon}
                  <div className="absolute -inset-2 rounded-2xl border border-purple-500/20 opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: `${index * 0.5}s` }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 max-w-[200px]">
                  {step.description}
                </p>
                {/* Mobile Connection Line */}
                {index < steps.length - 1 && (
                  <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-purple-500/30 to-transparent my-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
