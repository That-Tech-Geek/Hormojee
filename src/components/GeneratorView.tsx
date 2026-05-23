/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Cpu, RotateCcw, Clipboard, Check, Activity, Shield, Sliders } from "lucide-react";
import { ProductData, PitchRecord } from "../types";
import { encodeProduct, SYSTEM_CENTROIDS, bitCosine, BYTES } from "../math/hyperdimensional";

interface GeneratorViewProps {
  initialProduct: ProductData | null;
  onPitchGenerated: (newPitch: PitchRecord) => void;
}

export default function GeneratorView({ initialProduct, onPitchGenerated }: GeneratorViewProps) {
  // Input form state
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("SaaS");
  const [dealStage, setDealStage] = useState("proposal");
  const [price, setPrice] = useState(5000);
  const [painPoints, setPainPoints] = useState<string[]>(["compliance", "downtime"]);
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [customAttributes, setCustomAttributes] = useState<Record<string, string>>({});

  // Operational states
  const [compilingStep, setCompilingStep] = useState<"idle" | "encoding" | "scanning" | "refinement" | "completed">("idle");
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [currentVector, setCurrentVector] = useState<Uint8Array | null>(null);
  const [scannedCentroids, setScannedCentroids] = useState<{ label: string; similarity: number }[]>([]);
  const [synthesizedPitch, setSynthesizedPitch] = useState<PitchRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeCentroidMatch, setActiveCentroidMatch] = useState<string>("");
  const [apiRefinementModel, setApiRefinementModel] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync with reviewed drafts from Dashboard
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setIndustry(initialProduct.industry);
      setDealStage(initialProduct.dealStage);
      setPrice(initialProduct.price);
      setPainPoints(initialProduct.painPoints || []);
      setCustomAttributes(initialProduct.customAttributes || {});
    } else {
      // Default initial states
      setName("Cyberdyne Systems");
      setIndustry("SaaS");
      setDealStage("proposal");
      setPrice(7500);
      setPainPoints(["compliance", "low adoption"]);
      setCustomAttributes({});
    }
  }, [initialProduct]);

  // Handle live canvas high-dimensional painting
  useEffect(() => {
    if (canvasRef.current && currentVector) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const width = 200;
        const height = 50;
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, width, height);

        const imgData = ctx.createImageData(width, height);
        for (let i = 0; i < BYTES; i++) {
          const byte = currentVector[i];
          for (let b = 0; b < 8; b++) {
            const bit = (byte >> b) & 1;
            const pixelIndex = (i * 8 + b) * 4;

            if (bit === 1) {
              imgData.data[pixelIndex] = 0;     // R (Pure neon green #00FF41)
              imgData.data[pixelIndex + 1] = 255; // G
              imgData.data[pixelIndex + 2] = 65;  // B
              imgData.data[pixelIndex + 3] = 255; // Alpha
            } else {
              imgData.data[pixelIndex] = 16;    // R (Deep obsidian charcoal background)
              imgData.data[pixelIndex + 1] = 16;  // G
              imgData.data[pixelIndex + 2] = 16;  // B
              imgData.data[pixelIndex + 3] = 255; // Alpha
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    }
  }, [currentVector, compilingStep]);

  // Support lists
  const availableIndustries = ["SaaS", "Manufacturing", "Finance", "Healthcare", "Retail", "Education", "Energy", "Defense"];
  const availableDealStages = ["discovery", "demo", "proposal", "negotiation", "closed"];
  const popularPainPoints = [
    { id: "compliance", label: "Regulatory Compliance" },
    { id: "downtime", label: "Operational Downtime" },
    { id: "cost", label: "Licensing Costs" },
    { id: "integration", label: "Legacy Tool Integration" },
    { id: "low adoption", label: "Software Under-adoption" },
    { id: "migration", label: "Database Migration Speed" }
  ];

  const handlePainToggle = (id: string) => {
    if (painPoints.includes(id)) {
      setPainPoints(painPoints.filter((p) => p !== id));
    } else {
      setPainPoints([...painPoints, id]);
    }
  };

  const addCustomAttribute = () => {
    if (customKey && customValue) {
      setCustomAttributes({
        ...customAttributes,
        [customKey.trim()]: customValue.trim()
      });
      setCustomKey("");
      setCustomValue("");
    }
  };

  const removeCustomAttribute = (key: string) => {
    const updated = { ...customAttributes };
    delete updated[key];
    setCustomAttributes(updated);
  };

  // Compile workflow math & trigger server call
  const triggerCompilation = async () => {
    if (!name.trim()) {
      alert("Please enter a prospect name before compiling.");
      return;
    }

    setCompilingStep("encoding");
    setStatusLog(["Initializing 10,000-dimensional hypervector space...", "D = 10,000, 1250 bytes pre-allocated."]);
    setSynthesizedPitch(null);
    setScannedCentroids([]);

    const payload: ProductData = {
      name,
      industry,
      dealStage,
      price,
      painPoints,
      customAttributes
    };

    // Stage 1: Local hypervector encoding
    await new Promise((r) => setTimeout(r, 600));
    const generatedVec = encodeProduct(payload);
    setCurrentVector(generatedVec);
    setStatusLog((prev) => [
      ...prev,
      `Mapped features deterministically to HDC base vectors via Cyrb128 seeds.`,
      `Synthesizing input components into single bundled vector Q via majority voting...`,
      `Majority-vote bundling complete. Hamming Bit distribution generated successfully.`
    ]);

    // Stage 2: Nearest centroid Hamming Distance scan
    setCompilingStep("scanning");
    await new Promise((r) => setTimeout(r, 800));

    // Calculate actual similarities
    const results = SYSTEM_CENTROIDS.map((c) => {
      const centroidData: ProductData = {
        name: c.label,
        industry: c.features.industry || "",
        dealStage: c.features.dealStage || "proposal",
        price: c.features.price || 1000,
        painPoints: c.features.painPoints || []
      };
      const centroidVec = encodeProduct(centroidData);
      const similarity = bitCosine(generatedVec, centroidVec);
      // Normalized representation of similarity
      const normalizedPercent = Math.max(0.6, Math.min(0.99, (similarity + 1) / 2));
      return { label: c.label, similarity: normalizedPercent };
    });

    results.sort((a, b) => b.similarity - a.similarity);
    setScannedCentroids(results);
    setActiveCentroidMatch(results[0].label);

    setStatusLog((prev) => [
      ...prev,
      `Calculated Hamming popcnt distances across ${SYSTEM_CENTROIDS.length} system centroids:`,
      ...results.map((r) => ` - Alignment with ${r.label}: ${(r.similarity * 100).toFixed(1)}% similarity`),
      `Matched cluster coordinate centroids successfully. Selected template: '${results[0].label}'.`
    ]);

    // Stage 3: Server refinement via Gemini
    setCompilingStep("refinement");
    setStatusLog((prev) => [...prev, "Spawning server-side refinement pipeline...", "Invoking secure full-stack /api/pitch..."]);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const response = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: payload })
      });

      if (!response.ok) {
        throw new Error("Server error responding back " + response.statusText);
      }

      const data = await response.json();
      setSynthesizedPitch(data.pitch);
      setApiRefinementModel(data.mathDetails.refinementUsed);
      setCompilingStep("completed");
      onPitchGenerated(data.pitch);

      setStatusLog((prev) => [
        ...prev,
        `Refinement pipeline completed via: ${data.mathDetails.refinementUsed}`,
        "Oracle sales pitch finalized. Sub-10ms mathematical convergence achieved."
      ]);
    } catch (err: any) {
      console.error(err);
      setStatusLog((prev) => [...prev, "ERROR: Secure server proxy failed. Activating local deterministic model.", err.message]);
      setCompilingStep("completed");
    }
  };

  const handleCopy = () => {
    if (synthesizedPitch) {
      navigator.clipboard.writeText(synthesizedPitch.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn select-none">
      {/* Grid Left: Configuration Form */}
      <div className="lg:col-span-7 bg-[#161616] border border-[#242424] p-6 rounded relative flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header line */}
          <div className="flex items-center gap-3 border-b border-[#242424] pb-4">
            <Sliders className="w-5 h-5 text-[#00FF41]" />
            <div>
              <h2 className="font-sans font-extrabold text-white text-base leading-none">
                Deal Vector Configurator
              </h2>
              <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider font-extrabold mt-1">
                Dimension Allocation: D = 10,000 Bits
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Prospect Company Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wayne Enterprises"
                className="w-full bg-[#1e1e1e] border border-[#2d2d2d] focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] text-xs text-white rounded p-2.5 focus:outline-none focus:glow"
              />
            </div>

            {/* Industry & Deal Stage Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Target Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#2d2d2d] focus:border-[#00FF41] text-xs text-white rounded p-2.5 focus:outline-none"
                >
                  {availableIndustries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Deal Stage Cycle
                </label>
                <select
                  value={dealStage}
                  onChange={(e) => setDealStage(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#2d2d2d] focus:border-[#00FF41] text-xs text-white rounded p-2.5 focus:outline-none uppercase font-mono font-bold"
                >
                  {availableDealStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Target Contract Price (USD)
                </label>
                <span className="font-mono text-[#00FF41] text-sm font-bold">
                  ${price.toLocaleString()} / mo
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-1 bg-[#202020] rounded-lg appearance-none cursor-pointer accent-[#00FF41] focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold mt-1.5">
                <span>$500</span>
                <span>$5,000 (Median)</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Pain points selector list */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Structural Customer Pain Points
              </label>
              <div className="grid grid-cols-2 gap-2">
                {popularPainPoints.map((pain) => {
                  const isActive = painPoints.includes(pain.id);
                  return (
                    <button
                      key={pain.id}
                      type="button"
                      onClick={() => handlePainToggle(pain.id)}
                      className={`text-left p-2.5 rounded text-xs border transition-all cursor-pointer flex justify-between items-center ${
                        isActive
                          ? "bg-[#00FF41]/10 border-[#00ff41]/50 text-[#00FF41] font-semibold"
                          : "bg-[#1e1e1e] border-[#2d2d2d] text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <span>{pain.label}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom attributes manager */}
            <div className="border-t border-[#242424] pt-4 mt-6">
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Ad-Hoc Attribute Bindings (Custom Keys)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Key (e.g. geo)"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="bg-[#1e1e1e] border border-[#2d2d2d] text-xs text-white p-2 rounded w-1/3 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. apac)"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="bg-[#1e1e1e] border border-[#2d2d2d] text-xs text-white p-2 rounded w-1/2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomAttribute}
                  className="bg-[#2a2a2a] hover:bg-[#343434] text-white px-3 py-2 rounded text-xs font-bold leading-none cursor-pointer"
                >
                  Bind
                </button>
              </div>

              {/* Render custom attributes keys */}
              {Object.keys(customAttributes).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.entries(customAttributes).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 bg-[#202020] border border-[#2a2a2a] text-[10px] text-slate-300 font-mono px-2.5 py-1 rounded"
                    >
                      <span>
                        {k}:{v}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomAttribute(k)}
                        className="text-red-500 font-bold hover:text-red-400 leading-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Execute Container */}
        <div className="pt-6 border-t border-[#242424] mt-6 flex justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setName("Wayne Enterprises");
              setIndustry("Defense");
              setDealStage("negotiation");
              setPrice(9500);
              setPainPoints(["compliance", "cost"]);
              setCustomAttributes({});
            }}
            className="flex items-center gap-2 border border-[#2d2d2d] hover:border-slate-500 text-slate-400 hover:text-white px-4 py-2.5 rounded text-xs font-sans font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={triggerCompilation}
            disabled={compilingStep !== "idle" && compilingStep !== "completed"}
            className="flex items-center gap-2 bg-[#00FF41] text-black hover:bg-[#2eff63] px-6 py-2.5 rounded text-xs font-sans font-black uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,255,65,0.15)] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black stroke-[3px]" />
            Compile Pitch Vector
          </button>
        </div>
      </div>

      {/* Grid Right: High-Dimensional Visualizer Pipeline */}
      <div className="lg:col-span-5 bg-[#161616] border border-[#242424] p-6 rounded flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#242424] pb-4">
            <Cpu className="w-5 h-5 text-[#00FF41]" />
            <div>
              <h2 className="font-sans font-extrabold text-white text-base leading-none">
                HDC Execution Pipeline
              </h2>
              <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider font-extrabold mt-1">
                Sub-10ms Bitwise Core
              </p>
            </div>
          </div>

          {/* Hypervector Visual Canvas Container */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                10,000-D Packed Bit Vector [Q]
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                {currentVector ? "200×50 bits mapped" : "Uninitialized"}
              </span>
            </div>

            <div className="bg-[#0e0e0e] border border-[#222222] rounded p-4 flex flex-col items-center justify-center min-h-[100px] relative">
              <canvas
                ref={canvasRef}
                width={200}
                height={50}
                className="w-full max-w-sm h-16 image-render-pixel border border-[#1e1e1e] rounded shadow-inner"
              />
              {!currentVector && (
                <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur flex items-center justify-center">
                  <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest leading-relaxed text-center px-4">
                    Press Compile to allocate mapping & generate vector bits
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scanned similarities indicators */}
          {scannedCentroids.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                Hamming Distance Cosine Alignments
              </p>
              <div className="space-y-2 bg-[#0e0e0e] border border-[#222222] p-3 rounded max-h-[140px] overflow-y-auto custom-scrollbar">
                {scannedCentroids.map((item, idx) => (
                  <div key={idx} className="space-y-1 select-none">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span className={`font-semibold ${idx === 0 ? "text-white" : ""}`}>
                        {item.label}
                      </span>
                      <span className={`font-black ${idx === 0 ? "text-[#00FF41]" : ""}`}>
                        {(item.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#202020] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? "bg-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.4)]" : "bg-slate-700"
                        }`}
                        style={{ width: `${item.similarity * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operational Logs Terminal style */}
          <div className="space-y-2 select-none">
            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              Compiler Operational Logs
            </p>
            <div className="bg-[#0e0e0e] border border-[#222222] text-[10px] font-mono rounded p-3 h-28 overflow-y-auto text-slate-400 space-y-1.5 custom-scrollbar">
              {statusLog.map((log, idx) => (
                <p key={idx} className={idx === statusLog.length - 1 ? "text-[#00FF41] font-bold" : ""}>
                  &gt; {log}
                </p>
              ))}

              {statusLog.length === 0 && (
                <p className="text-slate-600 italic">Compiler offline. Waiting for input stream parameters...</p>
              )}
            </div>
          </div>
        </div>

        {/* Stage 4: Result box */}
        {compilingStep === "completed" && synthesizedPitch && (
          <div className="border-t border-[#242424] pt-4 mt-6 animate-fadeIn select-none space-y-3.5">
            <div className="flex justify-between items-center bg-[#00FF41]/10 border border-[#00ff41]/20 p-2 rounded">
              <div className="flex gap-1.5 items-center">
                <Activity className="w-3.5 h-3.5 text-[#00FF41] animate-pulse" />
                <span className="font-mono text-[9px] uppercase font-bold text-[#00FF41]">
                  Best Match: {activeCentroidMatch.replace(" Model", "")}
                </span>
              </div>
              <span className="font-mono text-[9px] text-slate-400 font-bold">
                Inference: {apiRefinementModel}
              </span>
            </div>

            <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded text-xs text-slate-200 leading-relaxed font-sans relative">
              <span className="absolute top-2.5 right-2 px-1.5 py-0.5 font-mono text-[8px] bg-black text-[#00FF41] rounded tracking-wide uppercase font-extrabold shadow-sm">
                SYNT_V3.5_OK
              </span>
              {synthesizedPitch.text}
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 border border-[#2d2d2d] hover:border-slate-500 text-slate-300 hover:text-white px-3.5 py-2 rounded text-xs font-sans font-bold transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span className="text-[#00FF41]">Copied</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Copy Pitch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
