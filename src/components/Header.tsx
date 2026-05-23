/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Search, Bell, User, Sparkles } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onSynthesizeClick: () => void;
}

export default function Header({ currentTab, setTab, onSynthesizeClick }: HeaderProps) {
  return (
    <header className="w-full h-16 bg-[#0e0e0e] border-b border-[#2d2d2d] sticky top-0 z-40 select-none">
      <div className="flex justify-between items-center px-6 w-full max-w-[1440px] mx-auto h-full">
        {/* Logo and core links */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab("dashboard")}>
            <span className="font-sans font-black text-lg tracking-tight text-white">Oracle AI</span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono leading-none font-bold bg-[#1d1d1d] text-[#00FF41] rounded border border-emerald-950">
              V3.5
            </span>
          </div>

          <nav className="hidden md:flex gap-6">
            <button
              onClick={() => setTab("dashboard")}
              className={`font-sans text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                currentTab === "dashboard"
                  ? "text-[#00FF41] border-b-2 border-[#00FF41] pb-1.5 pt-0.5"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab("generator")}
              className={`font-sans text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                currentTab === "generator"
                  ? "text-[#00FF41] border-b-2 border-[#00FF41] pb-1.5 pt-0.5"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Compiler
            </button>
            <button
              onClick={() => setTab("history")}
              className={`font-sans text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                currentTab === "history"
                  ? "text-[#00FF41] border-b-2 border-[#00FF41] pb-1.5 pt-0.5"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              History
            </button>
          </nav>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-4">
          {/* Quick search input */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search high-dimensional vectors..."
              className="bg-[#161616] border border-[#2d2d2d] rounded-full py-1.5 pl-4 pr-10 text-xs text-white placeholder-slate-500 w-56 focus:ring-1 focus:ring-[#00FF41] focus:border-[#00FF41] focus:outline-none transition-all duration-200"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* Synthesize quick action button */}
          <button
            id="btn-header-synthesize-pitch"
            onClick={onSynthesizeClick}
            className="flex items-center gap-1.5 bg-[#1d1d1d] hover:bg-[#282828] text-[#00FF41] border border-[#00ff41]/20 px-3 py-1.5 rounded text-xs font-sans font-bold transition-all transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00FF41]" />
            Synthesize Pitch
          </button>

          {/* Social indicators */}
          <div className="flex items-center gap-1 border-l border-[#242424] pl-4">
            <button
              onClick={() => alert("Recent warnings: None. Dimension parameters operational.")}
              className="p-2 text-slate-400 hover:text-[#00FF41] transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
            </button>

            <button
              onClick={() => alert("Logged in as: Elite Sales Oracle. Domain credentials valid.")}
              className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
