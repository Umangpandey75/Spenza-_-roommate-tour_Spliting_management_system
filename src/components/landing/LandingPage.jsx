import React from 'react';
import { GridBackground } from '../ui/grid-background';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { StatisticsSection } from './StatisticsSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CategoriesSection } from './CategoriesSection';
import { AnalyticsPreviewSection } from './AnalyticsPreviewSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="bg-[#0f172a] min-h-screen selection:bg-purple-500/30 selection:text-white">
      {/* 
        We use GridBackground with an extremely low opacity grid to match the premium aesthetic. 
        Instead of the default GridBackground, we'll just apply a subtle CSS grid here if needed, 
        or let GridBackground handle it if it supports opacity tweaking. 
        Actually, we can just wrap the whole thing in GridBackground but add a custom overlay 
        to knock down the grid opacity to 5% as requested.
      */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <GridBackground />
      </div>

      <div className="relative z-10 font-sans text-slate-50">
        <Navbar />
        
        <main>
          <HeroSection />
          <StatisticsSection />
          <FeaturesSection />
          <HowItWorksSection />
          <CategoriesSection />
          <AnalyticsPreviewSection />
          <TestimonialsSection />
          <FAQSection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
