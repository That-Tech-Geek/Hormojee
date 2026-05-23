/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import GeneratorView from "./components/GeneratorView";
import { PitchRecord, ProductData } from "./types";
import { Sparkles, Terminal, Cpu } from "lucide-react";

export default function App() {
  const [historyList, setHistoryList] = useState<PitchRecord[]>([]);

  // Synchronize history from server API on mount
  const syncHistoryWithServer = async () => {
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch pitch history from backend", err);
    }
  };

  useEffect(() => {
    syncHistoryWithServer();
  }, []);

  // Callback when generator synthesizes a new vector and pitch
  const handlePitchGenerated = (newRecord: PitchRecord) => {
    setHistoryList((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans antialiased text-[#161616]">
      {/* Visual background atmospheric corporate grid lines */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-70 select-none bg-gradient-to-b from-white via-transparent to-[#F4F6F9]">
        {/* Subtle professional grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* Primary header header banner */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none">
        <div className="max-w-[1440px] px-6 py-4 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg shadow-sm flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-sans font-bold text-base tracking-tight text-slate-900 leading-none">
                  Hormojee Vector Outbound
                </h1>
                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 rounded-sm uppercase tracking-wider border border-slate-200">
                  v3.4-Local
                </span>
              </div>
              <p className="text-[11px] text-slate-450 font-medium">
                High-dimensional prospect mapping & outbound copy synthesis in under 100ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
              Sub-10ms Local Synthesis Active
            </span>
          </div>
        </div>
      </header>

      {/* Primary View Area Canvas Container */}
      <main className="max-w-[1440px] w-full mx-auto px-6 py-8 pb-16">
        <GeneratorView
          initialProduct={null}
          onPitchGenerated={handlePitchGenerated}
        />
      </main>
    </div>
  );
}
