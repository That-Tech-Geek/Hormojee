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
    <header className="w-full h-16 bg-white border-b border-slate-200/80 sticky top-0 z-40 select-none class-header">
      <div className="flex justify-between items-center px-6 w-full max-w-[1440px] mx-auto h-full">
        {/* Lead brand logo & sub-services */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab("dashboard")}>
            <span className="font-sans font-black text-lg tracking-tight text-slate-900">Hormojee</span>
            <span className="px-1.5 py-0.5 text-[9px] font-sans font-extrabold bg-slate-100 text-slate-700 rounded border border-slate-200">
              MINIMAL
            </span>
          </div>

          <nav className="hidden md:flex gap-6 h-full items-center">
            <button
              onClick={() => setTab("dashboard")}
              className={`font-sans text-xs uppercase tracking-wider font-bold transition-all h-full cursor-pointer relative top-[1px] ${
                currentTab === "dashboard"
                  ? "text-slate-900 border-b-[2px] border-slate-900"
                  : "text-slate-400 hover:text-slate-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab("generator")}
              className={`font-sans text-xs uppercase tracking-wider font-bold transition-all h-full cursor-pointer relative top-[1px] ${
                currentTab === "generator"
                  ? "text-slate-900 border-b-[2px] border-slate-900"
                  : "text-slate-400 hover:text-slate-800"
              }`}
            >
              Pitch Builder
            </button>
            <button
              onClick={() => setTab("history")}
              className={`font-sans text-xs uppercase tracking-wider font-bold transition-all h-full cursor-pointer relative top-[1px] ${
                currentTab === "history"
                  ? "text-slate-900 border-b-[2px] border-slate-900"
                  : "text-slate-400 hover:text-slate-800"
              }`}
            >
              Saved Pitches
            </button>
          </nav>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-4">
          {/* Quick search input */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search prospects..."
              className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-4 pr-10 text-xs text-slate-800 placeholder-slate-400 w-64 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition-all duration-200"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Quick Pitch Creator button */}
          <button
            id="btn-header-synthesize-pitch"
            onClick={onSynthesizeClick}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold transition-all transform active:scale-95 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-300" />
            Create Pitch
          </button>

          {/* User profile section */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
            <button
              onClick={() => alert("All systems operational.")}
              className="p-2 text-slate-400 hover:text-slate-950 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-900"></span>
            </button>

            <button
              onClick={() => alert("Logged in as Hormojee user.")}
              className="p-2 text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
