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
    <div className="space-y-8 animate-fadeIn select-none text-slate-800">
      {/* Title & Status Badge */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-slate-900 text-3xl tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-slate-500 font-sans text-sm mt-1">
            Track engagement levels, saved pitch profiles, and audience interest.
          </p>
        </div>
        <div className="flex">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
            <span className="font-sans text-[10px] uppercase tracking-wider font-extrabold text-slate-700">
              Hormojee Operational
            </span>
          </div>
        </div>
      </section>

      {/* Primary 3-Metric Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Pitches */}
        <div className="bg-white border border-slate-200/85 hover:border-blue-500/50 p-6 rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.02] blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          <p className="font-sans text-[10px] uppercase text-slate-500 tracking-wider font-bold">
            Total Sales Pitches
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-sans font-black text-4xl text-slate-900 tracking-tight">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-emerald-700 font-sans text-xs bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" />
              +12.4%
            </span>
          </div>

          {/* Realistic Sparkline bar graph */}
          <div className="mt-6 h-10 w-full flex items-end gap-1.5 opacity-85">
            <div className="bg-slate-100 group-hover:bg-slate-200 w-full h-[40%] rounded-sm transition-all"></div>
            <div className="bg-slate-100 group-hover:bg-slate-200 w-full h-[60%] rounded-sm transition-all"></div>
            <div className="bg-slate-100 group-hover:bg-slate-300 w-full h-[55%] rounded-sm transition-all"></div>
            <div className="bg-slate-100 group-hover:bg-slate-300 w-full h-[80%] rounded-sm transition-all"></div>
            <div className="bg-slate-100 group-hover:bg-slate-300 w-full h-[70%] rounded-sm transition-all"></div>
            <div className="bg-slate-900 w-full h-[100%] rounded-sm transition-all shadow-sm"></div>
          </div>
        </div>

        {/* Card 2: Average Conversion Rate */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden group">
          <p className="font-sans text-[10px] uppercase text-slate-500 tracking-wider font-bold">
            Average Click-through
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-sans font-black text-4xl text-slate-900 tracking-tight">
              38.2%
            </span>
            <span className="text-emerald-700 font-sans text-xs bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" />
              +2.1%
            </span>
          </div>

          {/* Interactive slider meter indicator */}
          <div className="mt-6 h-10 flex items-center w-full">
            <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-slate-900 rounded-full progress-animation transition-all duration-1000"
                style={{ width: "38.2%" }}
              ></div>
            </div>
          </div>
          <p className="mt-1 font-sans text-[10px] text-slate-400 font-bold">
            Target Benchmark: 35.0%
          </p>
        </div>

        {/* Card 3: Top Industry */}
        <div className="bg-white border border-slate-200/85 hover:border-blue-500/50 p-6 rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden group">
          <p className="font-sans text-[10px] uppercase text-slate-500 tracking-wider font-bold">
            Dominant Market Segment
          </p>
          <div className="mt-3">
            <span className="font-sans font-bold text-2xl text-slate-900 tracking-tight block">
              Cloud Infrastructure
            </span>
            <p className="text-slate-400 font-sans text-xs mt-1">
              Driving 42% of absolute pipeline outcomes this fiscal cycle.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-[10px] font-sans uppercase font-extrabold tracking-wider">
              FinTech
            </span>
            <span className="bg-slate-50 text-slate-600 border border-slate-150 px-2.5 py-1 rounded text-[10px] font-sans uppercase font-bold tracking-wider">
              BioMed
            </span>
          </div>
        </div>
      </section>

      {/* Bento Section: Chart & Activity Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Chart Component */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col group hover:border-slate-350 transition-all">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-sans font-bold text-sm text-slate-800">
              Pitch Creation Forecast
            </h3>
            <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-lg">
              <button
                onClick={() => setChartRange("week")}
                className={`px-3 py-1.5 text-[10px] font-sans font-bold rounded cursor-pointer transition-all ${
                  chartRange === "week"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-850"
                }`}
              >
                WEEK
              </button>
              <button
                onClick={() => setChartRange("month")}
                className={`px-3 py-1.5 text-[10px] font-sans font-bold rounded cursor-pointer transition-all ${
                  chartRange === "month"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-800"
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
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid backdrop lines */}
                <line x1="0" y1="40" x2="900" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="900" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="160" x2="900" y2="160" stroke="#f1f5f9" strokeDasharray="4 4" />

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
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-in-out"
                />

                {/* Pulse dot at peak end */}
                <circle cx="900" cy={chartRange === "week" ? 25 : 10} r="5" fill="#0f172a" className="animate-pulse" />
              </svg>

              {/* Float Projected overlay card */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-lg shadow-sm transition-all select-none">
                <p className="text-[9px] text-slate-400 font-sans uppercase font-extrabold tracking-wider">
                  Audience Targets
                </p>
                <p className="text-2xl font-bold font-sans text-slate-900">4.2K</p>
                <span className="text-[9px] text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full inline-block mt-1.5 font-bold">
                  On Target
                </span>
              </div>
            </div>

            {/* Horizontal week labels */}
            <div className="grid grid-cols-7 text-center pt-6 border-t border-slate-100 mt-4 font-sans text-[10px] text-slate-400 font-extrabold">
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
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full hover:border-slate-350 transition-all">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-sans font-bold text-sm text-slate-800">
              Recent Pitches
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] p-4 space-y-3.5 custom-scrollbar">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3.5 border-l-4 border-slate-900 bg-slate-50/40 rounded-r hover:bg-slate-50 transition-all cursor-pointer border border-y-slate-200/50 border-r-slate-200/50 group animate-fadeIn"
                onClick={() => onReviewDraft(item)}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="font-sans text-xs text-slate-950 font-bold leading-tight group-hover:text-slate-900 transition-colors truncate">
                    {item.name}
                  </span>
                  <span className="font-sans text-[9px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-black whitespace-nowrap">
                    {(item.confidence * 100).toFixed(0)}% MATCH
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.text}
                </p>
                <div className="mt-2.5 flex items-center justify-between font-sans text-[9px]">
                  <span className="text-slate-400 font-bold">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button className="text-slate-900 underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    Review Pitch
                  </button>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-12">
                No active generated pitches.
              </p>
            )}
          </div>

          <button
            onClick={() => setTab("history")}
            className="m-4 py-2 border border-slate-200 hover:border-slate-350 rounded-lg text-[10px] font-sans font-bold text-slate-500 hover:text-slate-900 transition-all cursor-pointer bg-slate-50"
          >
            Review Saved History
          </button>
        </div>
      </section>

      {/* Bottom Action Status Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-200/80">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-sans font-bold tracking-wider">
              Engagement Tracker
            </p>
            <p className="font-sans font-extrabold text-slate-800 text-base">Active</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-200/80">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-sans font-bold tracking-wider">
              Match Profile Accuracy
            </p>
            <p className="font-sans font-extrabold text-slate-800 text-base">Optimized</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-200/80">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-sans font-bold tracking-wider">
              Efficiency Level
            </p>
            <p className="font-sans font-extrabold text-slate-800 text-base">Real-time</p>
          </div>
        </div>

        <div
          onClick={() => setTab("generator")}
          className="bg-slate-900 text-white p-5 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-all transform active:scale-95 shadow-sm group"
        >
          <div>
            <p className="text-[9px] uppercase font-sans font-bold tracking-widest opacity-80">
              Pitch Builder
            </p>
            <p className="font-sans font-extrabold text-sm">Create Fresh Pitch</p>
          </div>
          <ArrowRight className="w-4 h-4 text-white stroke-[2.5px] group-hover:translate-x-1 transition-transform" />
        </div>
      </section>
    </div>
  );
}
