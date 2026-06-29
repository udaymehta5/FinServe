import React from 'react';
import { Mail, ExternalLink, Info, Calendar } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-finText">About FinServe</h1>
        <p className="text-xs text-finMuted mt-1">Information about the platform and the creator.</p>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-finBorder/60 space-y-6">
        
        <div className="flex items-center gap-2 border-b border-finBorder pb-2">
          <Info className="h-5 w-5 text-finGreen" />
          <span className="text-xs font-bold text-finText uppercase tracking-wider">Website Information</span>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-finText leading-relaxed">
            FinServe is an AI-powered personal CFO and budget tracker designed to give you complete control over your financial health. It provides real-time expense tracking, intelligent income analytics, and visual breakdowns of your spending patterns.
          </p>
          <div className="flex items-center gap-2 text-xs text-finMuted mt-2">
            <Calendar className="h-4 w-4 text-finGreen" />
            <span>Made on 28th June 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-finBorder pb-2 mt-8">
          <Mail className="h-5 w-5 text-finGreen" />
          <span className="text-xs font-bold text-finText uppercase tracking-wider">Contact Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a 
            href="mailto:udaymehta005@gmail.com" 
            className="flex items-center gap-3 p-4 rounded-lg bg-finBackground border border-finBorder hover:border-finGreen transition group"
          >
            <div className="h-10 w-10 rounded-full bg-finGreen/10 flex items-center justify-center group-hover:bg-finGreen/20">
              <Mail className="h-5 w-5 text-finGreen" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-finMuted uppercase tracking-wider">Email</p>
              <p className="text-sm font-semibold text-finText">udaymehta005@gmail.com</p>
            </div>
          </a>

          <a 
            href="https://www.linkedin.com/in/uday-mehta-9b3134339/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg bg-finBackground border border-finBorder hover:border-finGreen transition group"
          >
            <div className="h-10 w-10 rounded-full bg-finGreen/10 flex items-center justify-center group-hover:bg-finGreen/20">
              <ExternalLink className="h-5 w-5 text-finGreen" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-finMuted uppercase tracking-wider">LinkedIn</p>
              <p className="text-sm font-semibold text-finText truncate">uday-mehta-9b3134339</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
