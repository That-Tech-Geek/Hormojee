/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trash2, Search, Clipboard, Check, Filter, Sparkles, Building, Briefcase, FileText } from "lucide-react";
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
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Page Title */}
      <div>
        <h1 className="font-sans font-extrabold text-[#e5e2e1] text-3xl tracking-tight">
          Pitches History Logs
        </h1>
        <p className="text-slate-400 font-sans text-sm mt-1">
          Review, analyze, and manage prior hyperdimensional semantic synthesis records.
        </p>
      </div>

      {/* Filter and Search actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161616] border border-[#242424] p-4 rounded bg-[#101010]/50">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search within pitches by name or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181818] border border-[#2d2d2d] rounded py-2 pl-4 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-mono text-slate-500 font-bold uppercase truncate">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter Industry:
          </span>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="bg-[#181818] border border-[#2d2d2d] rounded text-xs text-white p-2 focus:outline-none"
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
            className="bg-[#161616] border border-[#242424] rounded overflow-hidden hover:border-[#2d2d2d] transition-all group"
          >
            {/* Header section */}
            <div className="px-6 py-4 bg-[#101010] border-b border-[#242424] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#1e1e1e] border border-[#2d2d2d] flex items-center justify-center text-slate-400 group-hover:border-[#00ff41]/30 transition-all">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-white">{item.name}</h3>
                  <div className="flex gap-2 items-center flex-wrap mt-1">
                    <span className="text-[10px] bg-[#1a1a1a] border border-[#2a2a2a] text-slate-400 font-mono px-2 py-0.5 rounded uppercase leading-none font-bold">
                      {item.product.industry}
                    </span>
                    <span className="text-[10px] bg-[#1a1a1a] border border-[#2a2a2a] text-slate-400 font-mono px-2 py-0.5 rounded uppercase leading-none font-bold">
                      Stage: {item.product.dealStage}
                    </span>
                    <span className="text-[10px] bg-[#1a1a1a] border border-[#2a2a2a] text-slate-400 font-mono px-2 py-0.5 rounded leading-none font-bold">
                      Value: ${item.product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tag confidence */}
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] text-[#00FF41] bg-[#00FF41]/10 px-2.5 py-1 rounded border border-[#00ff41]/20 font-black tracking-wide uppercase">
                  {(item.confidence * 100).toFixed(1)}% Alignment
                </span>

                <button
                  onClick={() => onDeletePitch(item.id)}
                  className="p-2 text-slate-500 hover:text-red-500 bg-[#1e1e1e] hover:bg-neutral-900 rounded transition-colors cursor-pointer border border-[#2d2d2d] hover:border-red-900/30"
                  title="Remove Pitch Log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pitch Text script body context */}
            <div className="p-6 space-y-4">
              <div className="bg-[#0e0e0e] border border-[#222222] rounded p-4 text-xs font-sans text-slate-300 leading-relaxed font-normal">
                {item.text}
              </div>

              {/* Target pain points */}
              {item.product.painPoints && item.product.painPoints.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider select-none">
                    Targeted Pains:
                  </span>
                  {item.product.painPoints.map((pain) => (
                    <span
                      key={pain}
                      className="bg-[#2a2a2a]/45 text-slate-300 border border-[#303030] text-[9px] font-mono px-2 py-0.5 rounded"
                    >
                      {pain}
                    </span>
                  ))}
                </div>
              )}

              {/* Action row */}
              <div className="pt-2 border-t border-[#1d1d1d] flex justify-between items-center bg-[#1c1c1c]/10 -mx-6 -mb-6 px-6 py-3 bg-[#131313]/50">
                <span className="text-[10px] font-mono text-slate-500 font-bold leading-none">
                  Timestamp: {new Date(item.timestamp).toLocaleString()}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(item.id, item.text)}
                    className="flex items-center gap-1.5 bg-[#181818] hover:bg-[#202020] border border-[#2d2d2d] hover:border-slate-500 text-slate-300 px-3 py-1.5 rounded text-xs font-sans font-bold transition-all cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                        <span className="text-[#00FF41]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onReviewDraft(item)}
                    className="flex items-center gap-1.5 bg-[#181818] hover:bg-[#202020] border border-[#2d2d2d] hover:border-slate-500 text-[#00FF41] px-3.5 py-1.5 rounded text-xs font-sans font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span>Tweak Pitch Vector</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="bg-[#161616] border border-[#242424] text-center py-20 rounded">
            <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-sans text-slate-400 font-semibold mb-1">
              No matching records found.
            </p>
            <p className="text-xs font-sans text-slate-500">
              Try adjusting your query or click "Compile Pitch Vector" to synthesize new coordinates.
            </p>
            <button
              onClick={() => setTab("generator")}
              className="mt-6 bg-[#00FF41] text-black px-4 py-2 rounded text-xs font-sans font-bold transition-all uppercase tracking-wide cursor-pointer"
            >
              Go to Pitch Generator
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
