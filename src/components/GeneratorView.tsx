/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Cpu, RotateCcw, Clipboard, Check, Activity, Shield, Sliders, ExternalLink } from "lucide-react";
import { ProductData, PitchRecord } from "../types";
import { encodeProduct, SYSTEM_CENTROIDS, bitCosine, BYTES } from "../math/hyperdimensional";

interface GeneratorViewProps {
  initialProduct: ProductData | PitchRecord | null;
  onPitchGenerated: (newPitch: PitchRecord) => void;
}

export default function GeneratorView({ initialProduct, onPitchGenerated }: GeneratorViewProps) {
  // Input form state
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("SaaS");
  const [dealStage, setDealStage] = useState("proposal");
  const [tone, setTone] = useState("Consultative");
  const [price, setPrice] = useState(5000);
  const [painPoints, setPainPoints] = useState<string[]>(["compliance", "downtime"]);
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [customAttributes, setCustomAttributes] = useState<Record<string, string>>({});
  
  // Rich B2B metadata variables to capture maximal outbound intelligence
  const [prospectRole, setProspectRole] = useState("VP of Operations");
  const [competitors, setCompetitors] = useState("");
  const [cta, setCta] = useState("15-minute introductory call");
  const [channel, setChannel] = useState("Cold Email");

  // Operational states
  const [compilingStep, setCompilingStep] = useState<"idle" | "encoding" | "scanning" | "refinement" | "completed">("idle");
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [currentVector, setCurrentVector] = useState<Uint8Array | null>(null);
  const [scannedCentroids, setScannedCentroids] = useState<{ label: string; similarity: number }[]>([]);
  const [synthesizedPitch, setSynthesizedPitch] = useState<PitchRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [chatGptModel, setChatGptModel] = useState("o1"); // Default to highest reasoning model on top
  const [activeCentroidMatch, setActiveCentroidMatch] = useState<string>("");
  const [apiRefinementModel, setApiRefinementModel] = useState<string>("");
  
  // Interactive Refinement Questionnaire states
  const [showRefinePanel, setShowRefinePanel] = useState(false);
  const [refineGrievances, setRefineGrievances] = useState<string[]>([]);
  const [refineAngle, setRefineAngle] = useState<string>("cost-savings");
  const [refineCustomText, setRefineCustomText] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync with reviewed drafts from Dashboard
  useEffect(() => {
    if (initialProduct) {
      // Check if it is a full PitchRecord or just ProductData
      const isPitchRecord = "product" in initialProduct;
      const product = isPitchRecord ? (initialProduct as any).product : initialProduct;

      setName(product.name || "");
      setIndustry(product.industry || "SaaS");
      setDealStage(product.dealStage || "proposal");
      setPrice(product.price || 5000);
      setPainPoints(product.painPoints || []);
      setCustomAttributes(product.customAttributes || {});
      setTone(product.tone || "Consultative");
      setProspectRole(product.prospectRole || "VP of Operations");
      setCompetitors(product.competitors || "");
      setCta(product.cta || "15-minute introductory call");
      setChannel(product.channel || "Cold Email");

      if (isPitchRecord) {
        const record = initialProduct as PitchRecord;
        setSynthesizedPitch(record);
        setCompilingStep("completed");

        // Recreate vectors for visualization
        const generatedVec = encodeProduct(product);
        setCurrentVector(generatedVec);

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
          const normalizedPercent = Math.max(0.6, Math.min(0.99, (similarity + 1) / 2));
          return { label: c.label, similarity: normalizedPercent };
        });
        results.sort((a, b) => b.similarity - a.similarity);
        setScannedCentroids(results);
        setActiveCentroidMatch(results[0].label);

        setStatusLog([
          "Detected historic sales pitch record loaded from log database.",
          "Profile attributes and mathematical vectors pre-synchronized successfully.",
          "Ready for parameter fine-tuning, iterative regeneration, or direct outreach."
        ]);
      } else {
        setSynthesizedPitch(null);
        setCompilingStep("idle");
        setCurrentVector(null);
        setScannedCentroids([]);
        setStatusLog([]);
      }
    } else {
      // Default initial states
      setName("Cyberdyne Systems");
      setIndustry("SaaS");
      setDealStage("proposal");
      setPrice(7500);
      setPainPoints(["compliance", "low adoption"]);
      setCustomAttributes({});
      setTone("Consultative");
      setProspectRole("VP of Operations");
      setCompetitors("SkyNet Logistics");
      setCta("15-minute introductory call");
      setChannel("Cold Email");

      setSynthesizedPitch(null);
      setCompilingStep("idle");
      setCurrentVector(null);
      setScannedCentroids([]);
      setStatusLog([]);
    }
  }, [initialProduct]);

  // Handle live canvas high-dimensional painting and laser-scan animation
  useEffect(() => {
    let animationId: number;
    let scanX = 0;
    const width = 200;
    const height = 50;
    let pulseTime = 0;
    
    const render = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const isCompiling = compilingStep !== "idle" && compilingStep !== "completed";
      
      const imgData = ctx.createImageData(width, height);
      const vector = currentVector;
      
      pulseTime += 0.05;
      const pulseIntensity = 0.85 + Math.sin(pulseTime) * 0.15; // slow soothing organic breath effect

      if (isCompiling) {
        scanX = (scanX + 4.5) % (width + 30); // smooth scan laser sweep speed
      } else {
        scanX = width;
      }

      for (let i = 0; i < BYTES; i++) {
        const byte = vector ? vector[i] : 0;
        for (let b = 0; b < 8; b++) {
          const bitIndex = i * 8 + b;
          const px = bitIndex % width;
          const py = Math.floor(bitIndex / width);
          const pixelIndex = bitIndex * 4;

          let isActive = false;

          if (vector) {
            const bit = (byte >> b) & 1;
            isActive = bit === 1;

            if (isCompiling) {
              if (px > scanX) {
                // Flickering noise ahead of the scanning laser beam
                isActive = Math.random() > 0.82;
              } else if (Math.abs(px - scanX) < 4) {
                // Laser line glow
                imgData.data[pixelIndex] = 15;     // Slate-900 background glow
                imgData.data[pixelIndex + 1] = 118; // Salesforce teal high-intensity flare
                imgData.data[pixelIndex + 2] = 211; 
                imgData.data[pixelIndex + 3] = 255;
                continue;
              }
            }
          } else {
            // Uninitialized ambient state: organic rare twinkling stars
            isActive = Math.random() > 0.995;
          }

          if (isActive) {
            // Main active profile bit color with pulse multiplier when completed
            const multiplier = isCompiling ? 1 : pulseIntensity;
            imgData.data[pixelIndex] = Math.max(0, Math.min(255, Math.round(15 * multiplier)));
            imgData.data[pixelIndex + 1] = Math.max(0, Math.min(255, Math.round(23 * multiplier)));
            imgData.data[pixelIndex + 2] = Math.max(0, Math.min(255, Math.round(42 * multiplier)));
            imgData.data[pixelIndex + 3] = 255;
          } else {
            // Standby/neutral bit background
            imgData.data[pixelIndex] = 248;
            imgData.data[pixelIndex + 1] = 250;
            imgData.data[pixelIndex + 2] = 252;
            imgData.data[pixelIndex + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Animation loop frame pointer
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [currentVector, compilingStep]);

  // Support lists
  const availableIndustries = ["SaaS", "Manufacturing", "Finance", "Healthcare", "Retail", "Education", "Energy", "Defense"];
  const availableDealStages = ["discovery", "demo", "proposal", "negotiation", "closed"];
  const availableTones = ["Consultative", "Aggressive", "Empathetic", "Direct", "Visionary", "Analytical"];
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
    setStatusLog(["Analyzing prospect parameters...", "Mapping profile elements..."]);
    setSynthesizedPitch(null);
    setScannedCentroids([]);

    const payload: ProductData = {
      name,
      industry,
      dealStage,
      price,
      painPoints,
      customAttributes,
      tone,
      prospectRole,
      competitors,
      cta,
      channel
    };

    // Stage 1: Local profile encoding
    await new Promise((r) => setTimeout(r, 600));
    const generatedVec = encodeProduct(payload);
    setCurrentVector(generatedVec);
    setStatusLog((prev) => [
      ...prev,
      `Successfully mapped profile fields into the dynamic profile matrix.`,
      `Synthesizing attributes into single visual profile vector...`,
      `Profile compilation complete.`
    ]);

    // Stage 2: Nearest centroid scan
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
      `Calculated matching affinity against historical profiles:`,
      ...results.map((r) => ` - Fit similarity with ${r.label}: ${(r.similarity * 100).toFixed(1)}%`),
      `Matched cluster coordinate centroids. Recommended template: '${results[0].label}'.`
    ]);

    // Stage 3: Server refinement via Gemini
    setCompilingStep("refinement");
    setStatusLog((prev) => [...prev, "Spawning script generator pipeline...", "Requesting script refinement..."]);
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
        `Refinement completed successfully.`,
        "Sales pitch finalized. Ready for review."
      ]);
    } catch (err: any) {
      console.error(err);
      setStatusLog((prev) => [...prev, "ERROR: Secure server proxy failed. Activating local model.", err.message]);
      setCompilingStep("completed");
    }
  };

  // Trigger iterative refinement improvements request
  const triggerRegeneration = async (feedbackData?: {
    grievances: string[];
    amplifyAngle: string;
    customRefinement: string;
  }) => {
    setCompilingStep("refinement");
    setStatusLog((prev) => [
      ...prev,
      "Executing dynamic pitch improvement cycle...",
      "Injected user clarification adjustments into model gateway...",
      feedbackData ? `Tuning vector parameters: [Grievances: ${feedbackData.grievances.length > 0 ? feedbackData.grievances.join(", ") : "none"}, Focus: ${feedbackData.amplifyAngle}]` : "Standard model optimization active."
    ]);

    const payload: ProductData = {
      name,
      industry,
      dealStage,
      price,
      painPoints,
      customAttributes,
      tone,
      prospectRole,
      competitors,
      cta,
      channel
    };

    try {
      const response = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          product: payload, 
          improve: true,
          previousScript: synthesizedPitch?.text || "",
          feedback: feedbackData || {}
        })
      });

      if (!response.ok) {
        throw new Error("Server error refining script: " + response.statusText);
      }

      const data = await response.json();
      setSynthesizedPitch(data.pitch);
      setApiRefinementModel(data.mathDetails.refinementUsed);
      setCompilingStep("completed");
      onPitchGenerated(data.pitch);

      setStatusLog((prev) => [
        ...prev,
        `Iterative refinement successfully completed via ${data.mathDetails.refinementUsed || "Sales Oracle"}.`,
        "Polished sales pitch draft loaded successfully."
      ]);
      setShowRefinePanel(false);
    } catch (err: any) {
      console.error(err);
      setStatusLog((prev) => [...prev, "ERROR: Script improvement sequence failed.", err.message]);
      setCompilingStep("completed");
    }
  };

  const handleCopyUrl = () => {
    const url = `https://chatgpt.com/?model=${chatGptModel}&q=${encodeURIComponent(getGptPrompt())}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopy = () => {
    if (synthesizedPitch) {
      navigator.clipboard.writeText(synthesizedPitch.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getGptPrompt = () => {
    const formattedPainPoints = painPoints.length > 0 
      ? painPoints.map(p => popularPainPoints.find(ppp => ppp.id === p)?.label || p).join(", ")
      : "None specified";

    const formattedCustom = Object.entries(customAttributes).length > 0
      ? Object.entries(customAttributes).map(([k, v]) => `${k}: ${v}`).join(", ")
      : "None specified";

    let vectorHex = "Uninitialized";
    if (currentVector) {
      const hexArr: string[] = [];
      const slice = currentVector.slice(0, 32);
      for (let i = 0; i < slice.length; i++) {
        const h = slice[i].toString(16);
        hexArr.push(h.length < 2 ? "0" + h : h);
      }
      vectorHex = hexArr.join("") + "... (total 1250 bytes)";
    }

    const matchesText = scannedCentroids.length > 0
      ? scannedCentroids.map(c => `- ${c.label}: ${(c.similarity * 100).toFixed(1)}% alignment`).join("\n")
      : "None scanned";

    const profileJson = JSON.stringify({
      prospect: name || "Wayne Enterprises",
      industry,
      dealStage,
      targetTone: tone,
      contractPriceMonthly: `$${price.toLocaleString()}`,
      prospectRole: prospectRole || "VP of Operations",
      competitors: competitors || "None specified",
      callToAction: cta || "15-minute introductory call",
      outboundChannel: channel || "Cold Email",
      painPointsList: painPoints.map(p => popularPainPoints.find(ppp => ppp.id === p)?.label || p),
      customMetadata: customAttributes
    }, null, 2);

    let promptText = `B2B Prospect Profile Information (JSON formatted):
\`\`\`json
${profileJson}
\`\`\`

Profile Mapping & Embedded Vector Bits [Q]:
- Vector Alignment Matches to Centroids:
${matchesText}
- Embedding Bits (Hex digest): ${vectorHex}
`;

    if (synthesizedPitch) {
      promptText += `\nLocal Mapped Sales Pitch Base Script:\n"${synthesizedPitch.text}"\n`;
    }

    promptText += `\nTASK:\nDraft a hyper-personalized B2B outreach sequence and sales copywriting tailored specifically for ${name || "Wayne Enterprises"} utilizing a distinct ${tone.toLowerCase()} tone.
Customize the writing specifically for the "${prospectRole || "Target Lead"}" role over the "${channel || "Cold Email"}" channel.
Integrate solutions to their main pain points (${formattedPainPoints}) and customize for their "${dealStage}" cycle stage.
Take into account their competitive situation (Competitors: ${competitors || "None specified"}).
Provide 2 high-conversion variations with engaging/high-open subject lines, and make sure to naturally embed this Call To Action: "${cta}".`;

    return promptText;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn select-none text-slate-800">
      {/* Grid Left: Configuration Form */}
      <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-lg shadow-sm relative flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header line */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Sliders className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="font-sans font-extrabold text-slate-900 text-base leading-none">
                Profile Builder
              </h2>
              <p className="text-[10px] uppercase font-sans text-slate-400 tracking-wider font-extrabold mt-1">
                Configure Pitch Attributes
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            {/* Row 1: Target Entity Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Prospect Company
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wayne Enterprises"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Prospect Role / Title
                </label>
                <input
                  type="text"
                  value={prospectRole}
                  onChange={(e) => setProspectRole(e.target.value)}
                  placeholder="e.g. VP of Sales"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Target Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none cursor-pointer"
                >
                  {availableIndustries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Campaign Outreach Mechanics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Outbound Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none cursor-pointer font-semibold animate-fadeIn"
                >
                  <option value="Cold Email">Cold Email</option>
                  <option value="LinkedIn InMail">LinkedIn InMail</option>
                  <option value="Cold Call Script">Cold Call Script</option>
                  <option value="SMS Pitch Copy">SMS Pitch Copy</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Key Competitors
                </label>
                <input
                  type="text"
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  placeholder="e.g. Salesforce, HubSpot"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Call to Action (CTA)
                </label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g. 15-min discovery call"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3: Deal Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Deal Cycle Stage
                </label>
                <select
                  value={dealStage}
                  onChange={(e) => setDealStage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 text-xs text-slate-850 rounded-lg p-2.5 focus:outline-none uppercase font-sans font-bold cursor-pointer"
                >
                  {availableDealStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Pitch Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 text-xs text-slate-850 rounded-lg p-2.5 focus:outline-none font-sans font-bold cursor-pointer"
                >
                  {availableTones.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
                  Target Contract Price (USD)
                </label>
                <span className="font-sans text-slate-900 text-xs font-black">
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
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-sans font-bold mt-1.5">
                <span>$500</span>
                <span>$5,000 (Median Goal)</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Pain points selector list */}
            <div>
              <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-2">
                Structural Customer Pain Points (Select Multiple)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {popularPainPoints.map((pain) => {
                  const isActive = painPoints.includes(pain.id);
                  return (
                    <button
                      key={pain.id}
                      type="button"
                      onClick={() => handlePainToggle(pain.id)}
                      className={`text-left px-2.5 py-2.5 rounded-lg border transition-all cursor-pointer flex justify-between items-center text-xs ${
                        isActive
                          ? "bg-slate-50 border-slate-900 text-slate-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                      }`}
                    >
                      <span className="truncate text-[11px]">{pain.label}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom attributes manager */}
            <div className="border-t border-slate-100 pt-4 mt-6">
              <label className="block text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-2">
                Ad-Hoc Attribute Bindings (Custom Keys)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Key (e.g. geo)"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-800 p-2 rounded w-1/3 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. apac)"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-800 p-2 rounded w-1/2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomAttribute}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-3.5 py-2 rounded text-xs font-bold leading-none cursor-pointer"
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
                      className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-[10px] text-slate-650 font-sans px-2.5 py-1 rounded-full font-bold"
                    >
                      <span>
                        {k}:{v}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomAttribute(k)}
                        className="text-red-500 font-bold hover:text-red-600 leading-none cursor-pointer text-sm"
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
        <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between gap-4">
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
            className="flex items-center gap-2 border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded text-xs font-sans font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={triggerCompilation}
            disabled={compilingStep !== "idle" && compilingStep !== "completed"}
            className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-6 py-2.5 rounded-lg text-xs font-sans font-extrabold uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white hover:scale-110 transition-transform" />
            Create Pitch
          </button>
        </div>
      </div>

      {/* Grid Right: Static Vector Mapping */}
      <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Cpu className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="font-sans font-extrabold text-slate-900 text-base leading-none">
                Attributes Visualizer
              </h2>
              <p className="text-[10px] uppercase font-sans text-slate-400 tracking-wider font-extrabold mt-1">
                Real-time alignment scanning
              </p>
            </div>
          </div>

          {/* Hypervector Visual Canvas Container */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider">
                Profile Mapping Bits [Q]
              </span>
              <span className="text-[10px] font-sans font-bold text-slate-500 uppercase">
                {currentVector ? "Mapped features bits" : "Uninitialized"}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded p-4 flex flex-col items-center justify-center min-h-[100px] relative">
              <canvas
                ref={canvasRef}
                width={200}
                height={50}
                className="w-full max-w-sm h-16 image-render-pixel border border-slate-200 rounded shadow-inner"
              />
              {!currentVector && (
                <div className="absolute inset-0 bg-slate-50/95 backdrop-blur flex items-center justify-center">
                  <p className="text-[10px] font-sans text-slate-400 font-bold uppercase tracking-wider leading-relaxed text-center px-4">
                    Press Create to view map and profile alignment
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scanned similarities indicators */}
          {scannedCentroids.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider">
                Template Alignment Scan Match
              </p>
              <div className="space-y-2 bg-slate-50 border border-slate-200/80 p-3 rounded-lg max-h-[140px] overflow-y-auto custom-scrollbar">
                {scannedCentroids.map((item, idx) => (
                  <div key={idx} className="space-y-1 select-none">
                    <div className="flex justify-between text-[10px] font-sans text-slate-500">
                      <span className={`font-semibold ${idx === 0 ? "text-slate-900" : ""}`}>
                        {item.label}
                      </span>
                      <span className={`font-black ${idx === 0 ? "text-slate-950" : ""}`}>
                        {(item.similarity * 100).toFixed(1)}% align
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? "bg-slate-900" : "bg-slate-400"
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
            <p className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider">
              Profile Refinement Trace Logs
            </p>
            <div className="bg-slate-900 border border-slate-950 text-[10px] font-mono rounded-lg p-3.5 h-28 overflow-y-auto text-slate-350 space-y-1.5 custom-scrollbar">
              {statusLog.map((log, idx) => (
                <p key={idx} className={idx === statusLog.length - 1 ? "text-slate-200 font-semibold" : ""}>
                  &gt; {log}
                </p>
              ))}

              {statusLog.length === 0 && (
                <p className="text-slate-500 italic">Builder logs offline. Waiting for parameters...</p>
              )}
            </div>
          </div>
        </div>

        {/* Stage 4: Result box & ChatGPT Integration (Visible at all times) */}
        <div className="border-t border-slate-100 pt-4 mt-6 space-y-4">
          {/* Sub-section A: Local Pitch Output */}
          {compilingStep === "completed" && synthesizedPitch ? (
            <div className="animate-fadeIn space-y-3">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2 rounded-lg">
                <div className="flex gap-1.5 items-center">
                  <Activity className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
                  <span className="font-sans text-[9px] uppercase font-bold text-slate-700">
                    Refined Template: {activeCentroidMatch.replace(" Model", "")}
                  </span>
                </div>
                <span className="font-sans text-[9px] text-slate-400 font-bold">
                  Refinement completed
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs text-slate-705 leading-relaxed font-sans relative">
                <span className="absolute top-2.5 right-2 px-1.5 py-0.5 font-sans text-[8px] bg-slate-900 text-white rounded tracking-wide uppercase font-extrabold shadow-sm">
                  PITCH_COMPLETED
                </span>
                {synthesizedPitch.text}
              </div>

              {showRefinePanel && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-4 animate-fadeIn select-none">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-slate-800" />
                      <span className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wide">
                        Clarification Setup & Copy Precision Tuning
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRefinePanel(false)}
                      className="text-[10px] bg-white border border-slate-200 hover:border-slate-350 px-2 py-1 rounded text-slate-700 font-bold font-sans cursor-pointer transition-all"
                    >
                      Hide
                    </button>
                  </div>

                  {/* Question 1: What needs correction? */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-sans font-extrabold text-slate-600 uppercase tracking-widest">
                      1. What didn't hit the mark? (Select any specific grievances)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
                      {[
                        { id: "too-long", label: "Too long / Too wordy (Make elegant & short) 📝" },
                        { id: "too-pushy", label: "Too aggressive / pushy (Soften the approach) 🍦" },
                        { id: "too-generic", label: "Too generic (Inject core metrics & ROI tables) 📊" },
                        { id: "needs-metrics", label: "Needs more structural trust indicators 🛡️" }
                      ].map((item) => {
                        const isChecked = refineGrievances.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer font-bold ${
                              isChecked
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setRefineGrievances((prev) =>
                                  isChecked ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                                );
                              }}
                              className="sr-only"
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 2: Custom target angle direction */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-sans font-extrabold text-slate-600 uppercase tracking-widest">
                      2. Which core Outbound Value Angle should we amplify?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {[
                        {
                          id: "cost-savings",
                          title: "Cost & Margin Savings",
                          desc: "Deep focus on cost reductions and software overhead margin optimization."
                        },
                        {
                          id: "time-to-adoption",
                          title: "Instant Integration Velocity",
                          desc: "Highlight sub-100ms vector execution and extremely smooth 1-week adoption streams."
                        },
                        {
                          id: "governance",
                          title: "Compliance & Safety Guardrails",
                          desc: "Zero infrastructure downtime, secure pipelines, and absolute data compliance."
                        }
                      ].map((angle) => {
                        const isSelected = refineAngle === angle.id;
                        return (
                          <button
                            key={angle.id}
                            type="button"
                            onClick={() => setRefineAngle(angle.id)}
                            className={`p-3 text-left rounded-lg border transition-all cursor-pointer block h-full ${
                              isSelected
                                ? "bg-slate-900/5 border-slate-900 shadow-sm ring-1 ring-slate-900"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="block text-xs font-sans font-extrabold text-slate-900">{angle.title}</span>
                            <span className="block text-[10px] font-sans text-slate-500 font-medium leading-tight mt-1">{angle.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 3: Custom Feedback textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-sans font-extrabold text-slate-600 uppercase tracking-widest">
                      3. Custom specific context, competitor defenses or directions:
                    </label>
                    <textarea
                      value={refineCustomText}
                      onChange={(e) => setRefineCustomText(e.target.value)}
                      placeholder='e.g., "Mention our ISO 27001 certificate" or "Tailor specifically for SkyNet Logistics in 2 sentences max"'
                      className="w-full bg-white border border-slate-200 focus:border-slate-400 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none min-h-[60px] max-h-[140px] font-bold shadow-sm placeholder-slate-400"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex justify-end gap-2 border-t border-slate-150 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowRefinePanel(false)}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 text-xs font-sans font-bold cursor-pointer transition-all"
                    >
                      Cancel Refinement
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerRegeneration({
                          grievances: refineGrievances,
                          amplifyAngle: refineAngle,
                          customRefinement: refineCustomText
                        });
                      }}
                      className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-950 px-5 py-2 rounded-lg text-xs font-sans font-extrabold shadow transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      <span>Execute Advanced Copy Refinement</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-650 hover:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer"
                >
                  {copied ? (
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
                  type="button"
                  onClick={() => setShowRefinePanel(!showRefinePanel)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer border ${
                    showRefinePanel 
                      ? "bg-slate-905 border-slate-950 text-white" 
                      : "bg-white border-slate-200 hover:border-slate-400 text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${showRefinePanel ? "text-white" : "text-slate-500"}`} />
                  <span>Regenerate & Improve</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-lg p-5 text-center text-xs text-slate-400 bg-slate-50/50 flex flex-col items-center justify-center min-h-[110px] select-none">
              <Sparkles className="w-5 h-5 text-slate-350 mb-1.5 animate-pulse" />
              <p className="font-bold uppercase tracking-wider text-[9px] text-slate-550 mb-1 font-bold">Vector Pipeline Standby</p>
              <p className="text-[11px] leading-relaxed max-w-xs text-slate-400">
                Click "Create Pitch" on the left to map high-dimensional vectors and synthesize the local base script instantly.
              </p>
            </div>
          )}

          {/* Sub-section B: ChatGPT Deep Link Area (Always visible, ranked by reasoning power) */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3.5 select-none animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-850 animate-pulse" />
                <span className="text-[10px] font-sans font-extrabold text-slate-900 uppercase tracking-wider">
                  ChatGPT Copilot Dispatch
                </span>
              </div>
              <span className="text-[9px] font-sans text-slate-400 font-extrabold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                Dynamic Dispatcher
              </span>
            </div>

            <p className="text-[10px] font-sans text-slate-500 leading-relaxed font-semibold">
              Select a model below to launch directly into ChatGPT pre-loaded with our complete JSON-optimized B2B outbound campaign prompt context.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
              <div className="flex-1">
                <label className="block text-[9px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Reasoning Model (Ranked High to Low)
                </label>
                <select
                  value={chatGptModel}
                  onChange={(e) => setChatGptModel(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-400 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none cursor-pointer font-bold transition-all shadow-sm"
                >
                  <option value="o1">ChatGPT o1 (Reasoning: Max)</option>
                  <option value="o1-mini">ChatGPT o1-mini (Reasoning: High)</option>
                  <option value="gpt-4o">GPT-4o (Reasoning: Balanced)</option>
                  <option value="gpt-4-turbo">GPT-4-Turbo (Reasoning: Legacy High)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5-Turbo (Reasoning: Low)</option>
                </select>
              </div>

              <div className="shrink-0">
                <a
                  href={`https://chatgpt.com/?model=${chatGptModel}&q=${encodeURIComponent(getGptPrompt())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-950 px-5 py-2.5 rounded-lg text-xs font-sans font-extrabold transition-all cursor-pointer shadow-sm group h-[38px] w-full sm:w-auto"
                >
                  <span>Build with ChatGPT</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
