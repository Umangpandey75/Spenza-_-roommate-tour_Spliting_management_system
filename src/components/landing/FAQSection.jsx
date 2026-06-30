import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Is Spenza really free?",
    answer: "Yes, Spenza is completely free to use for all core features including unlimited groups, expenses, and participants. We believe managing shared expenses shouldn't cost you extra."
  },
  {
    question: "Do my friends need an account to be added?",
    answer: "No! You can add friends as 'ghost' participants to track their expenses. However, if they create an account, they can log in and view the shared group on their own devices."
  },
  {
    question: "How does the 'Smart Splitting' work?",
    answer: "Our algorithm calculates the absolute minimum number of transactions needed to settle all debts in a group. For example, if A owes B $10 and B owes C $10, we just tell A to pay C $10 directly."
  },
  {
    question: "Can I use multiple currencies in one group?",
    answer: "Absolutely. When you create a group, you select a base currency. You can log expenses in other currencies, and we'll automatically convert them to your base currency for accurate settlements."
  },
  {
    question: "Is my financial data secure?",
    answer: "We take security seriously. All your data is encrypted in transit and at rest. We never store bank credentials or credit card numbers—Spenza is strictly an expense tracking and calculation tool, not a payment processor."
  }
];

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors">
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'}`}>
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-24 relative z-10 overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            Everything you need to know about Spenza and billing.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto bg-[#1e293b]/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-10 shadow-xl shadow-black/10"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
