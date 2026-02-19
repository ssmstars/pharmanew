import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-700 to-sky-700 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">PharmaGuard</h1>
              <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">RIFT 2026 • Clinical Pharmacogenomics</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden md:inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Secure session
            </span>
            <div className="hidden sm:block px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold chip-clinical">
              Clinical Mode
            </div>
            <Link 
              href="/signin" 
              className="px-3 sm:px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-3 sm:px-4 py-2 rounded-lg text-white font-semibold text-sm shadow-sm bg-gradient-to-r from-cyan-700 to-sky-700 hover:from-cyan-800 hover:to-sky-800 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;