import React from 'react';
import { Globe, Github, Linkedin, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Footer() {
  const router = useRouter();

  return (
    <footer className="relative bg-[#0f172a] border-t border-white/5 pt-20 pb-10 z-10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-1/2 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src="/spenza-logo.png" alt="Spenza" className="h-8 w-8 object-contain rounded-lg" />
              <span className="text-xl font-bold text-white tracking-tight">Spenza</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              The smartest way to split expenses with friends, roommates, and travel companions. Stop doing math and start enjoying the moment.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://umangpandey.vercel.app/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://github.com/Umangpandey75" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/umang-pandey-01b486273/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-purple-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-purple-400 transition-colors">How it Works</a></li>
              <li><a href="#categories" className="hover:text-purple-400 transition-colors">Categories</a></li>
              <li><a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a></li>
              <li><span className="cursor-pointer hover:text-purple-400 transition-colors" onClick={() => router.push('/signup')}>Sign Up</span></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Acceptable Use</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500" />
                <a href="mailto:umangpandey.co@gmail.com" className="hover:text-purple-400 transition-colors">umangpandey.co@gmail.com</a>
              </li>
              <li>
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-sm">
                  <p className="text-white text-sm font-medium mb-2">Ready to get started?</p>
                  <button 
                    onClick={() => router.push('/signup')}
                    className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    Create an account &rarr;
                  </button>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Spenza. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            Created by Umang Pandey
          </div>
        </div>
      </div>
    </footer>
  );
}
