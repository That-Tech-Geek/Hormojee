/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trash2, Search, Clipboard, Check, Filter, Sparkles, Building, Briefcase } from "lucide-react";
import { PitchRecord } from "../types";

interface HistoryViewProps {
  history: PitchRecord[];
  onReviewDraft: (pitch: PitchRecord) => void;
  onDeletePitch: (id: string) => void;
  setTab: (tab: string) => void;
}

export default function HistoryView({ history, onReviewDraft, onDeletePitch, setTab }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const industriesList = ["ALL", ...Array.from(new Set(history.map((h) => h.product.industry)))];

  // Filter records based on user queries
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.industry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIndustry = selectedIndustry === "ALL" || item.product.industry === selectedIndustry;

    return matchesSearch && matchesIndustry;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none text-slate-800">
      {/* Page Title */}
      <div>
        <h1 className="font-sans font-extrabold text-slate-900 text-3xl tracking-tight animate-slideDown">
          Pitch Log History
        </h1>
        <p className="text-slate-500 font-sans text-sm mt-1 mb-2">
          Review, analyze, and tweak previously generated sales pitches and client alignments.
        </p>
      </div>

      {/* Filter and Search actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search within pitches by account, industry, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-xs text-slate-805 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all text-slate-800"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-sans text-slate-500 font-bold uppercase truncate">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter Industry:
          </span>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-xs text-slate-700 p-2 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            {industriesList.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Historic Card feed list */}
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            id={`history-row-${item.id}`}
            className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:border-slate-300 transition-all group"
          >
            {/* Header section */}
            <div className="px-6 py-4 bg-slate-50/55 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-450 group-hover:border-slate-350 transition-all">
                  <Building className="w-4 h-4 text-slate-800" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-slate-900">{item.name}</h3>
                  <div className="flex gap-2 items-center flex-wrap mt-1">
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-750 font-sans px-2.5 py-0.5 rounded-full uppercase font-bold leading-none">
                      {item.product.industry}
                    </span>
                    <span className="text-[10px] bg-slate-100 border border-slate-250 text-slate-600 font-sans px-2.5 py-0.5 rounded-full uppercase font-bold leading-none">
                      Stage: {item.product.dealStage}
                    </span>
                    <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-sans px-2.5 py-0.5 rounded-full font-bold leading-none">
                      Value: ${item.product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tag confidence */}
              <div className="flex items-center gap-2.5">
                <span className="font-sans text-[10px] text-slate-700 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 font-bold tracking-wide uppercase">
                  {(item.confidence * 100).toFixed(1)}% Matching Fit
                </span>

                <button
                  onClick={() => onDeletePitch(item.id)}
                  className="p-2 text-slate-405 hover:text-red-500 bg-white hover:bg-slate-50 rounded border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                  title="Remove Pitch Log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pitch Text script body context */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-sans text-slate-705 leading-relaxed font-normal">
                {item.text}
              </div>

              {/* Target pain points */}
              {item.product.painPoints && item.product.painPoints.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-widest select-none">
                    Targeted Pains:
                  </span>
                  {item.product.painPoints.map((pain) => (
                    <span
                      key={pain}
                      className="bg-slate-50 border border-slate-200 text-slate-650 text-[9px] font-sans px-2.5 py-0.5 rounded-full font-bold"
                    >
                      {pain}
                    </span>
                  ))}
                </div>
              )}

              {/* Action row */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center -mx-6 -mb-6 px-6 py-3 bg-slate-50/30">
                <span className="text-[10px] font-sans text-slate-400 font-bold leading-none">
                  Logged: {new Date(item.timestamp).toLocaleString()}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(item.id, item.text)}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-55 border border-slate-200 hover:border-slate-400 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-extrabold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onReviewDraft(item)}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-450 text-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                    <span>Tweak Parameters</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="bg-white border border-slate-200 text-center py-20 rounded-lg shadow-sm">
            <Briefcase className="w-8 h-8 text-slate-350 mx-auto mb-3" />
            <p className="text-sm font-sans text-slate-500 font-semibold mb-1">
              No matching records found.
            </p>
            <p className="text-xs font-sans text-slate-400">
              Try adjusting your query or create a new pitch to record alignments.
            </p>
            <button
              onClick={() => setTab("generator")}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-sans font-bold transition-all uppercase tracking-wide cursor-pointer"
            >
              Go to Pitch Builder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
