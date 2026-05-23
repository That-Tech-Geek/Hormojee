/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TrendingUp, Activity, Shield, Zap, ArrowRight, Clipboard } from "lucide-react";
import { PitchRecord } from "../types";

interface DashboardViewProps {
  history: PitchRecord[];
  onReviewDraft: (pitch: PitchRecord) => void;
  setTab: (tab: string) => void;
}

export default function DashboardView({ history, onReviewDraft, setTab }: DashboardViewProps) {
  const [chartRange, setChartRange] = useState<"week" | "month">("week");

  // Format local numbers cleanly
  const totalCount = 1284 + (history.length - 4); // starting count + extra additions

  // Coordinate math for weekly vs monthly animated SVG paths inside the container
  const weekPath = "M0,210 Q90,165 180,185 T360,110 T540,85 T720,60 T900,25";
  const monthPath = "M0,225 Q90,195 180,210 T360,135 T540,115 T720,50 T900,10";

  return (
    <div className="space-y-8 animate-fadeIn select-none">
      {/* Title & Status Badge */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-[#e5e2e1] text-4xl tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-slate-400 font-sans text-sm mt-1.5">
            Real-time performance intelligence for Oracle Sales elite.
          </p>
        </div>
        <div className="flex">
          <div className="bg-[#1b1b1b] border border-[#2d2d2d] px-4 py-2 rounded flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping"></span>
            <span className="font-mono text-[10px] uppercase tracking-wider font-extrabold text-[#00FF41]">
              System Live
            </span>
          </div>
        </div>
      </section>

      {/* Primary 3-Metric Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Pitches */}
        <div className="bg-[#161616] border border-[#242424] hover:border-[#00FF41]/40 p-6 rounded transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF41]/[0.02] blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          <p className="font-mono text-[10px] uppercase text-slate-500 tracking-wider font-bold">
            Total Pitches Generated
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-sans font-black text-4xl text-[#00FF41] tracking-tight">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-[#00FF41] font-mono text-[10px] bg-[#00FF41]/10 px-2 py-0.5 rounded flex items-center gap-0.5 font-bold">
              <TrendingUp className="w-3 h-3 text-[#00FF41]" />
              +12.4%
            </span>
          </div>

          {/* Realistic Sparkline bar graph */}
          <div className="mt-6 h-10 w-full flex items-end gap-1.5">
            <div className="bg-[#2a2a2a] group-hover:bg-[#00ff41]/20 w-full h-[40%] rounded-sm transition-all"></div>
            <div className="bg-[#2a2a2a] group-hover:bg-[#00ff41]/20 w-full h-[60%] rounded-sm transition-all"></div>
            <div className="bg-[#2a2a2a] group-hover:bg-[#00ff41]/30 w-full h-[55%] rounded-sm transition-all"></div>
            <div className="bg-[#2a2a2a] group-hover:bg-[#00ff41]/40 w-full h-[80%] rounded-sm transition-all"></div>
            <div className="bg-[#2a2a2a] group-hover:bg-[#00ff41]/30 w-full h-[70%] rounded-sm transition-all"></div>
            <div className="bg-[#00FF41] w-full h-[100%] rounded-sm transition-all shadow-[0_0_8px_rgba(0,255,65,0.4)]"></div>
          </div>
        </div>

        {/* Card 2: Average Conversion Rate */}
        <div className="bg-[#161616] border border-[#242424] hover:border-[#00FF41]/40 p-6 rounded transition-all duration-300 relative overflow-hidden group">
          <p className="font-mono text-[10px] uppercase text-slate-500 tracking-wider font-bold">
            Average Conversion Rate
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-sans font-black text-4xl text-white tracking-tight">
              38.2%
            </span>
            <span className="text-[#00FF41] font-mono text-[10px] bg-[#00FF41]/10 px-2 py-0.5 rounded flex items-center gap-0.5 font-bold">
              <TrendingUp className="w-3 h-3 text-[#00FF41]" />
              +2.1%
            </span>
          </div>

          {/* Interactive slider meter indicator */}
          <div className="mt-6 h-10 flex items-center w-full">
            <div className="relative w-full h-1.5 bg-[#202020] rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-[#00FF41] rounded-full shadow-[0_0_8px_rgba(0,255,65,0.6)] progress-animation transition-all duration-1000"
                style={{ width: "38.2%" }}
              ></div>
            </div>
          </div>
          <p className="mt-1 font-sans text-[10px] text-slate-500 font-bold">
            Benchmark: 35.0% (Target Tier 1 Enterprise)
          </p>
        </div>

        {/* Card 3: Top Industry */}
        <div className="bg-[#161616] border border-[#242424] hover:border-[#00FF41]/40 p-6 rounded transition-all duration-300 relative overflow-hidden group">
          <p className="font-mono text-[10px] uppercase text-slate-500 tracking-wider font-bold">
            Top Industry Anchor
          </p>
          <div className="mt-3">
            <span className="font-sans font-bold text-2xl text-white tracking-tight block">
              Cloud Infrastructure
            </span>
            <p className="text-slate-400 font-sans text-xs mt-1">
              Generating 42% of total high-dimensional revenue this quarter.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <span className="bg-[#00FF41]/15 text-[#00FF41] border border-[#00ff41]/25 px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold tracking-wider">
              FinTech
            </span>
            <span className="bg-[#00FF41]/15 text-[#00FF41] border border-[#00ff41]/25 px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold tracking-wider">
              BioMed
            </span>
          </div>
        </div>
      </section>

      {/* Bento Section: Chart & Activity Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Chart Component */}
        <div className="lg:col-span-8 bg-[#161616] border border-[#242424] rounded overflow-hidden flex flex-col group hover:border-[#2d2d2d] transition-all">
          <div className="px-6 py-4 border-b border-[#242424] flex justify-between items-center bg-[#101010]">
            <h3 className="font-sans font-bold text-sm text-white">
              Revenue Pipeline Velocity
            </h3>
            <div className="flex gap-1.5 p-1 bg-[#101010] border border-[#2a2a2a] rounded">
              <button
                onClick={() => setChartRange("week")}
                className={`px-3 py-1 text-[10px] font-sans font-bold rounded cursor-pointer ${
                  chartRange === "week"
                    ? "bg-[#00FF41] text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                WEEK
              </button>
              <button
                onClick={() => setChartRange("month")}
                className={`px-3 py-1 text-[10px] font-sans font-bold rounded cursor-pointer ${
                  chartRange === "month"
                    ? "bg-[#00FF41] text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                MONTH
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            {/* SVG Interactive Line Chart */}
            <div className="relative w-full aspect-[22/9] min-h-[220px]">
              <svg className="w-full h-full" viewBox="0 0 900 240" fill="none">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF41" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00FF41" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid backdrop lines */}
                <line x1="0" y1="40" x2="900" y2="40" stroke="#1d1d1d" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="900" y2="100" stroke="#1d1d1d" strokeDasharray="4 4" />
                <line x1="0" y1="160" x2="900" y2="160" stroke="#1d1d1d" strokeDasharray="4 4" />

                {/* Shaded gradient under curve */}
                <path
                  d={
                    (chartRange === "week" ? weekPath : monthPath) + " L900,240 L0,240 Z"
                  }
                  fill="url(#chartGlow)"
                  className="transition-all duration-700 ease-in-out"
                />

                {/* Glowing neon path line */}
                <path
                  d={chartRange === "week" ? weekPath : monthPath}
                  stroke="#00FF41"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-in-out"
                />

                {/* Pulse dot at peak end */}
                <circle cx="900" cy={chartRange === "week" ? 25 : 10} r="6" fill="#00FF41" className="animate-pulse" />
              </svg>

              {/* Float Projected overlay card */}
              <div className="absolute top-4 right-4 bg-[#1a1a1a]/80 backdrop-blur border border-[#2d2d2d] hover:border-[#00FF41]/40 p-4 rounded shadow-lg transition-all select-none">
                <p className="text-[9px] text-slate-500 font-mono uppercase font-black tracking-widest">
                  Projected End-of-Month
                </p>
                <p className="text-2xl font-bold font-sans text-[#00FF41]">$4.2M</p>
                <span className="text-[9px] text-[#00FF41] bg-[#00FF41]/10 px-1.5 py-0.5 rounded leading-none inline-block mt-1 font-bold">
                  On Track
                </span>
              </div>
            </div>

            {/* Horizontal week labels */}
            <div className="grid grid-cols-7 text-center pt-6 border-t border-[#1d1d1d] mt-4 font-mono text-[10px] text-slate-500 font-black">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>
          </div>
        </div>

        {/* Recent Activity feed */}
        <div className="lg:col-span-4 bg-[#161616] border border-[#242424] rounded flex flex-col h-full hover:border-[#2d2d2d] transition-all">
          <div className="px-6 py-4 border-b border-[#242424] bg-[#101010]">
            <h3 className="font-sans font-bold text-sm text-white">
              Recent Sales Pitches
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] p-4 space-y-3.5 custom-scrollbar">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3.5 border-l-2 border-[#00FF41] bg-[#1a1a1a] rounded hover:bg-[#202020] transition-colors group cursor-pointer"
                onClick={() => onReviewDraft(item)}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="font-sans text-xs text-white font-bold leading-tight group-hover:text-[#00FF41] transition-colors truncate">
                    {item.name}
                  </span>
                  <span className="font-mono text-[9px] text-[#00FF41] bg-[#00FF41]/10 px-1.5 py-0.5 rounded font-black whitespace-nowrap">
                    {(item.confidence * 100).toFixed(0)}% CONF
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.text}
                </p>
                <div className="mt-2.5 flex items-center justify-between font-mono text-[9px]">
                  <span className="text-slate-500 font-bold">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button className="text-[#00FF41] underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    Review Draft
                  </button>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-12">
                No active generated pitches.
              </p>
            )}
          </div>

          <button
            onClick={() => setTab("history")}
            className="m-4 py-2 border border-[#2d2d2d] hover:border-[#00FF41]/40 rounded text-[10px] font-sans font-bold text-slate-400 hover:text-[#00FF41] transition-all cursor-pointer bg-[#101010]"
          >
            View Full History Log
          </button>
        </div>
      </section>

      {/* Bottom Action Status Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#161616] border border-[#242424] p-5 rounded flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-[#00FF41]/10 flex items-center justify-center text-[#00FF41] border border-[#00ff41]/20">
            <TrendingUp className="w-5 h-5 text-[#00FF41]" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-wider">
              Market Pulse State
            </p>
            <p className="font-sans font-extrabold text-white text-base">Bullish Mode</p>
          </div>
        </div>

        <div className="bg-[#161616] border border-[#242424] p-5 rounded flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-[#00FF41]/10 flex items-center justify-center text-[#00FF41] border border-[#00ff41]/20">
            <Shield className="w-5 h-5 text-[#00FF41]" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-wider">
              Algebraic Health
            </p>
            <p className="font-sans font-extrabold text-white text-base">Optimal (D=10,000)</p>
          </div>
        </div>

        <div className="bg-[#161616] border border-[#242424] p-5 rounded flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-[#00FF41]/10 flex items-center justify-center text-[#00FF41] border border-[#00ff41]/20">
            <Zap className="w-5 h-5 text-[#00FF41]" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-wider">
              Inference Velocity
            </p>
            <p className="font-sans font-extrabold text-white text-base">+18% Efficiency</p>
          </div>
        </div>

        <div
          onClick={() => setTab("generator")}
          className="bg-[#00FF41] text-black p-5 rounded flex items-center justify-between cursor-pointer hover:bg-[#2eff63] transition-all transform active:scale-95 shadow-[0_0_15px_rgba(0,255,65,0.1)] group"
        >
          <div>
            <p className="text-[9px] uppercase font-mono font-black tracking-widest opacity-80">
              Active Strategy
            </p>
            <p className="font-sans font-extrabold text-sm">Synthesize Q4 Lead Target</p>
          </div>
          <ArrowRight className="w-5 h-5 text-black stroke-[3px] group-hover:translate-x-1.5 transition-transform" />
        </div>
      </section>
    </div>
  );
}
