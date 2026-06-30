import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { DashboardPreview } from './DashboardPreview';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-96 bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>The smartest way to split expenses</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
            >
              Split expenses <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
                without the math.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed"
            >
              Spenza tracks shared costs, calculates optimal settlements, and eliminates the awkwardness of asking for money back. Perfect for trips, roommates, and groups.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={() => router.push('/signup')}
                className="h-14 px-8 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-semibold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all hover:scale-105 group"
              >
                Start for free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/5 font-semibold text-lg transition-all hover:border-white/40"
              >
                Sign In
              </Button>
            </motion.div>


          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="lg:pl-10">
            <DashboardPreview />
          </div>

        </div>
      </div>
    </section>
  );
}
