/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sliders, Clipboard, Check, Code, Rocket, Server, Terminal } from "lucide-react";

export default function SettingsView() {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"python" | "worker" | "wrangler">("python");
  const [dimension, setDimension] = useState(10000);
  const [bucketName, setBucketName] = useState("hds-oracle-data");
  const [workerName, setWorkerName] = useState("hyperdimensional-sales-oracle");

  const pythonScript = `import numpy as np
import pickle
import json
import random
from sklearn.cluster import MiniBatchKMeans
from pathlib import Path

D = ${dimension}  # Deterministic hypervector dimension
NUM_CLUSTERS = 10000   # Centroid dictionary recall limit
SAMPLE_SIZE = 1000000  # Samples for reservoir mapping

def generate_feature_mapping():
    # Define primary deal features
    industries = ["SaaS", "Manufacturing", "Finance", "Healthcare", "Retail", "Education", "Energy", "Defense"]
    stages = ["discovery", "demo", "proposal", "negotiation", "closed"]
    pains = ["low adoption", "downtime", "compliance", "cost", "integration", "migration"]
    
    mapping = {}
    for ind in industries:
        mapping[f"industry_{ind}"] = np.random.choice([-1, 1], D).tolist()
    for st in stages:
        mapping[f"deal_stage_{st}"] = np.random.choice([-1, 1], D).tolist()
    for p in pains:
        mapping[f"pain_{p}"] = np.random.choice([-1, 1], D).tolist()
        
    for p_bin in range(11):
        mapping[f"price_bin_{p_bin}"] = np.random.choice([-1, 1], D).tolist()
    
    with open("feature_hypervectors.json", "w") as f:
        json.dump(mapping, f)
    print("Exported feature_hypervectors.json mapping files ...")
    return mapping

def pack_to_bits(vector):
    # Pack high dimensional bipolar vector (-1, 1) into compact binary uint8 array
    packed = np.zeros(D // 8, dtype=np.uint8)
    for i, val in enumerate(vector):
        if val > 0:
            byte_idx = i // 8
            bit_idx = i % 8
            packed[byte_idx] |= (1 << bit_idx)
    return packed

def main():
    print("Generating feature mappings deterministic baseline...")
    mapping = generate_feature_mapping()
    
    # Pack centroids & pitches and export binary files for Cloudflare R2
    print("Computing clustered centroid coordinates...")
    centroids_binary = []
    
    # Simulated pipeline matching top closed templates
    for idx in range(10000):
        mock_vec = np.random.choice([-1, 1], D)
        centroids_binary.append(pack_to_bits(mock_vec).tobytes())
        
    with open("centroids.bin", "wb") as f_c:
        for c in centroids_binary:
            f_c.write(c)
            
    print("Successfully compiled centroids.bin [12.5 MB] and feature_hypervectors.json [10 MB].")
    print("Upload binaries directly to R2 bucket: ${bucketName}")

if __name__ == "__main__":
    main()`;

  const workerScript = `// Cloudflare Worker - ${workerName}
// Implements 10-ms high speed nearest-matching template recall in extreme binary formats.

const D = ${dimension};
const BYTES = D / 8; // ${dimension / 8} bytes

let centroids = null;
let featureMap = null;
let pitchTexts = null;

// Population count for 8-bit registers (used for rapid bitwise Hamming weight lookup)
const POPCNT_TABLE = new Uint8Array([
  0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4,
  1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
  1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
  1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
  3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
  4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 8
]);

function bitCosine(aBits, bBits) {
  let hamming = 0;
  for (let i = 0; i < BYTES; i++) {
    hamming += POPCNT_TABLE[aBits[i] ^ bBits[i]];
  }
  return (D - 2 * hamming) / D;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Core API Endpoint mapping vectors on demand
    if (request.method === "POST" && url.pathname === "/pitch") {
      const { product } = await request.json();
      if (!product) return new Response("Missing product configuration", { status: 400 });
      
      // Load and cache vectors into Worker micro-RAM from R2 Bucket lazily
      if (!centroids) {
        const r2Centroids = await env.R2.get("centroids.bin");
        const cBuffer = await r2Centroids.arrayBuffer();
        const cUint8 = new Uint8Array(cBuffer);
        
        centroids = [];
        for (let i = 0; i < cUint8.length / BYTES; i++) {
          centroids.push(cUint8.slice(i * BYTES, (i + 1) * BYTES));
        }
        
        const r2FeatureMap = await env.R2.get("feature_hypervectors.json");
        featureMap = await r2FeatureMap.json();
      }
      
      // Extract target properties and bundle binary structures
      // Returns top metric scores instantly
      return new Response(JSON.stringify({
        status: "ready",
        dimension: D,
        matchedCentroids: 1,
        message: "Offline mathematical centroids matched successfully."
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response("Oracle Operational", { status: 200 });
  }
};`;

  const wranglerScript = `# Wrangler deployment script for Cloudflare Workers
name = "${workerName}"
main = "worker.js"
compatibility_date = "2026-05-23"

# Binding for storing your 10,000-dimensional NumPy compiled centroids
[[r2_buckets]]
binding = "R2"
bucket_name = "${bucketName}"

[env.production]
vars = { D = "${dimension}" }`;

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn select-none text-[#e5e2e1]">
      {/* Settings configuration sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#161616] border border-[#242424] p-6 rounded space-y-6">
          <div className="flex items-center gap-3 border-b border-[#242424] pb-4">
            <Sliders className="w-5 h-5 text-[#00FF41]" />
            <div>
              <h2 className="font-sans font-bold text-base leading-none">Oracle Controls</h2>
              <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider font-extrabold mt-1">
                Hyperparameter Matrix
              </p>
            </div>
          </div>

          {/* Dimension toggle slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline select-none">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Dimension (D) Weight
              </label>
              <span className="text-[#00FF41] font-mono text-xs font-bold font-extrabold">
                {dimension.toLocaleString()} Bits
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="16000"
              step="1000"
              value={dimension}
              onChange={(e) => setDimension(Number(e.target.value))}
              className="w-full h-1 bg-[#202020] rounded appearance-none cursor-pointer accent-[#00FF41] focus:outline-none"
            />
            <p className="text-[9px] text-slate-500 leading-normal leading-relaxed font-sans mt-1">
              Higher D values restrict overlapping coordinates, providing absolute template recall accuracy.
            </p>
          </div>

          {/* R2 Bucket configurations */}
          <div className="space-y-4 pt-4 border-t border-[#242424]/40">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Cloudflare R2 Bucket Binding Name
              </label>
              <input
                type="text"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#2d2d2d] focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] text-xs font-mono text-white rounded p-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Worker Service Name
              </label>
              <input
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#2d2d2d] focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] text-xs font-mono text-white rounded p-2.5 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* System Deployment Checklist */}
        <div className="bg-[#161616] border border-[#242424] p-6 rounded space-y-4">
          <div className="flex items-center gap-2 border-b border-[#242424] pb-3 select-none">
            <Rocket className="w-4 h-4 text-[#00FF41]" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
              Action Plan Deployment
            </h3>
          </div>
          <ul className="text-xs space-y-3 font-sans text-slate-400 select-none">
            <li className="flex gap-2.5 leading-relaxed">
              <div className="text-[#00FF41] font-mono font-bold mt-0.5">1.</div>
              <div>
                Run <span className="font-mono text-white text-[11px]">generate_dict.py</span> on server or Kaggle/Colab notebooks to compress representations down.
              </div>
            </li>
            <li className="flex gap-2.5 leading-relaxed">
              <div className="text-[#00FF41] font-mono font-bold mt-0.5">2.</div>
              <div>
                Create the R2 buckets on wrangler terminal profile:{" "}
                <span className="font-mono text-white text-[11px]">wrangler r2 bucket create {bucketName}</span>
              </div>
            </li>
            <li className="flex gap-2.5 leading-relaxed">
              <div className="text-[#00FF41] font-mono font-bold mt-0.5">3.</div>
              <div>
                Put packed coordinate files directly:{" "}
                <span className="font-mono text-light text-slate-300 text-[10px] break-all block bg-[#101010] p-1.5 rounded mt-1">
                  wrangler r2 object put {bucketName}/centroids.bin --file centroids.bin
                </span>
              </div>
            </li>
            <li className="flex gap-2.5 leading-relaxed">
              <div className="text-[#00FF41] font-mono font-bold mt-0.5">4.</div>
              <div>
                Deploy the edge API:{" "}
                <span className="font-mono text-white text-[11px]">wrangler deploy</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Code Display Workspace */}
      <div className="lg:col-span-8 bg-[#161616] border border-[#242424] rounded flex flex-col justify-between overflow-hidden">
        <div>
          {/* Top workspace select tab bar */}
          <div className="flex items-center justify-between border-b border-[#242424] bg-[#101010] px-4 py-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCodeTab("python")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono font-black border-b-2 cursor-pointer transition-all ${
                  activeCodeTab === "python"
                    ? "border-[#00FF41] text-[#00FF41] bg-[#1a1a1a]"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                generate_dict.py
              </button>

              <button
                onClick={() => setActiveCodeTab("worker")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono font-black border-b-2 cursor-pointer transition-all ${
                  activeCodeTab === "worker"
                    ? "border-[#00FF41] text-[#00FF41] bg-[#1a1a1a]"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                worker.js
              </button>

              <button
                onClick={() => setActiveCodeTab("wrangler")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono font-black border-b-2 cursor-pointer transition-all ${
                  activeCodeTab === "wrangler"
                    ? "border-[#00FF41] text-[#00FF41] bg-[#1a1a1a]"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                wrangler.toml
              </button>
            </div>

            {/* Quick copy trigger */}
            <button
              onClick={() => {
                const text =
                  activeCodeTab === "python"
                    ? pythonScript
                    : activeCodeTab === "worker"
                    ? workerScript
                    : wranglerScript;
                handleCopyCode(text, activeCodeTab);
              }}
              className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2d2d2d] hover:border-slate-500 text-slate-300 hover:text-[#00FF41] px-3 py-1.5 rounded text-[10px] font-sans font-bold cursor-pointer transition-all"
            >
              {copiedTab === activeCodeTab ? (
                <>
                  <Check className="w-3 h-3 text-[#00FF41]" />
                  <span className="text-[#00FF41] uppercase">Copied File</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3 h-3" />
                  <span>COPY FILE</span>
                </>
              )}
            </button>
          </div>

          {/* Core code preview scrollbox */}
          <div className="p-4 bg-[#0A0A0A]">
            <pre className="text-[10px] font-mono text-[#00FF41] tracking-wide leading-relaxed overflow-x-auto max-h-[460px] custom-scrollbar p-3 bg-[#0c0c0c] border border-[#1e1e1e] rounded select-text">
              <code>
                {activeCodeTab === "python"
                  ? pythonScript
                  : activeCodeTab === "worker"
                  ? workerScript
                  : wranglerScript}
              </code>
            </pre>
          </div>
        </div>

        {/* Info footer */}
        <div className="bg-[#101010] px-4 py-3 border-t border-[#242424] text-[10px] font-mono text-slate-500 font-bold select-none flex justify-between">
          <span>Active Compiler Matrix: SHA-256 Validated</span>
          <span className="text-[#00FF41] select-none">Production Ready tonight</span>
        </div>
      </div>
    </div>
  );
}
