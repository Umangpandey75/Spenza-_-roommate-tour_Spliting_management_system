import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Travel Enthusiast",
    image: "https://i.pravatar.cc/150?img=47",
    content: "Spenza completely changed how my friends and I travel. We used to spend hours arguing over who paid for what. Now, everything is tracked instantly, and settling up takes one tap. It's a lifesaver."
  },
  {
    name: "Michael Chang",
    role: "Roommate",
    image: "https://i.pravatar.cc/150?img=11",
    content: "Living with three other guys used to mean a messy spreadsheet for bills and groceries. With Spenza, everyone logs their expenses as they happen. The UI is gorgeous, and it just works seamlessly."
  },
  {
    name: "Elena Rodriguez",
    role: "Event Organizer",
    image: "https://i.pravatar.cc/150?img=32",
    content: "I organize a lot of group events and dinners. Spenza's ability to handle complex splits (like when someone only ate a salad) is unmatched. It looks and feels like a premium app, but it's completely free to start."
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-24 relative z-10 overflow-hidden bg-gradient-to-b from-transparent to-white/[0.02]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            Loved by groups everywhere
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            Don't just take our word for it. Here's what our community has to say.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-[#1e293b]/60 backdrop-blur-sm border border-white/10 p-8 rounded-3xl relative group hover:border-purple-500/30 hover:bg-[#1e293b]/80 transition-all duration-300 shadow-xl shadow-black/20"
            >
              {/* Quote marks */}
              <div className="absolute top-6 right-8 text-6xl text-white/5 font-serif font-bold leading-none select-none group-hover:text-purple-500/10 transition-colors duration-300">
                "
              </div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#0f172a] shadow-lg">
                  <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <p className="text-slate-300 leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
