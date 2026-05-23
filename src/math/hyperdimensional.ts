/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductData, CentroidRecord } from "../types";

export const D = 10000; // Dimension
export const BYTES = D / 8; // 1250 bytes

// Precompute population count table for 8-bit integers (0 to 255) for extreme performance
export const POPCNT_TABLE = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  let count = 0;
  let temp = i;
  while (temp > 0) {
    if (temp & 1) count++;
    temp >>= 1;
  }
  POPCNT_TABLE[i] = count;
}

// Cyrb128 hash function to secure deterministic random seeds representing features
export function cyrb128(str: string): number {
  let h1 = 1779033703, h2 = 3024734911, h3 = 3362625948, h4 = 50249343;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h2 >>> 19), 2716044179);
  return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

// Mulberry32 deterministic generator for generating reproducible hypervectors in 10,000-D space
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Encode a single feature string deterministically into a 1250-byte packed bit vector
export function encodeFeature(featureStr: string): Uint8Array {
  const seed = cyrb128(featureStr);
  const rand = mulberry32(seed);
  const vec = new Uint8Array(BYTES);
  for (let i = 0; i < BYTES; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      if (rand() > 0.5) {
        byte |= 1 << b;
      }
    }
    vec[i] = byte;
  }
  return vec;
}

// Encode a full product dataset into a single cumulative hypervector (bundled via majority voting)
export function encodeProduct(product: ProductData): Uint8Array {
  const features: string[] = [];

  if (product.industry) features.push(`industry_${product.industry}`);
  if (product.dealStage) features.push(`deal_stage_${product.dealStage}`);

  // Bin the price for clean fractional / category-based high-dimensional rendering
  const maxPrice = 10000;
  const scaled = Math.min(9, Math.floor((product.price / maxPrice) * 10));
  features.push(`price_bin_${scaled}`);

  if (product.painPoints && Array.isArray(product.painPoints)) {
    product.painPoints.forEach((pain) => {
      features.push(`pain_${pain.trim().toLowerCase()}`);
    });
  }

  if (product.customAttributes) {
    for (const [k, v] of Object.entries(product.customAttributes)) {
      features.push(`custom_${k.toLowerCase()}_${String(v).toLowerCase()}`);
    }
  }

  // Generate vectors for all elements
  const featureVectors = features.map((f) => encodeFeature(f));

  if (featureVectors.length === 0) {
    // If no features, return random zero state
    return new Uint8Array(BYTES);
  }

  // Count bit occurrences across all feature vectors
  const bitCounts = new Int32Array(D);
  featureVectors.forEach((vec) => {
    for (let i = 0; i < BYTES; i++) {
      const byte = vec[i];
      for (let b = 0; b < 8; b++) {
        if ((byte >> b) & 1) {
          bitCounts[i * 8 + b]++;
        } else {
          bitCounts[i * 8 + b]--;
        }
      }
    }
  });

  // Perform majority vote bundle calculation
  const bundled = new Uint8Array(BYTES);
  for (let i = 0; i < BYTES; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      const tally = bitCounts[i * 8 + b];
      if (tally > 0) {
        byte |= 1 << b;
      } else if (tally === 0) {
        // Tie-breaker: deterministic rule based on offset
        if ((i + b) % 2 === 0) {
          byte |= 1 << b;
        }
      }
    }
    bundled[i] = byte;
  }

  return bundled;
}

// Calculate the Bitwise Cosine Similarity (via population counts over XOR)
export function bitCosine(a: Uint8Array, b: Uint8Array): number {
  let hamming = 0;
  for (let i = 0; i < BYTES; i++) {
    hamming += POPCNT_TABLE[a[i] ^ b[i]];
  }
  return (D - 2 * hamming) / D;
}

// Predefined centroids representing historic winning pitches from high-value closed deals
export const SYSTEM_CENTROIDS: CentroidRecord[] = [
  {
    id: 1,
    label: "Nakamoto Cybernetics Model",
    category: "SaaS",
    features: {
      industry: "SaaS",
      dealStage: "proposal",
      price: 4500,
      painPoints: ["compliance", "downtime"],
    },
    pitchText: "Oracle Sales has synthesized a premium, zero-downtime compliance and defense pitch tailored specifically for Nakamoto Cybernetics. Our cloud security migration strategy delivers 99.999% container isolation with automated state-of-the-art policy management. This aligns perfectly with your projected compliance timeline, mitigating structural vulnerabilities while enabling high-efficiency parallel pipelines on R2/Workers architectures.",
  },
  {
    id: 2,
    label: "Atlas Logistics Optimiser",
    category: "Manufacturing",
    features: {
      industry: "Manufacturing",
      dealStage: "demo",
      price: 8200,
      painPoints: ["cost", "integration"],
    },
    pitchText: "Our route optimization proposal establishes a lightweight, high-performance distributed orchestration model. By eliminating expensive intermediate layers and binding fleet operations directly to an inline mathematical projection system, Atlas Logistics can reduce fuel overheads by 18% in the first quarter of rollout. This completely clears your internal cost integration target with zero disruptions.",
  },
  {
    id: 3,
    label: "NeoTokio Grid Framework",
    category: "Finance",
    features: {
      industry: "Finance",
      dealStage: "negotiation",
      price: 9500,
      painPoints: ["low adoption", "compliance"],
    },
    pitchText: "This hyper-adaptive grid allocation model enables secure decentralized transaction scaling for NeoTokio Energy and financial partners. By storing encrypted trade telemetry as dense, compact representations, we reduce lookup latency to sub-10 milliseconds. Backed by solid compliance checks, this resolves regulatory overheads while driving 100% executive adoption.",
  },
  {
    id: 4,
    label: "SynthCore Systems Scale",
    category: "Healthcare",
    features: {
      industry: "Healthcare",
      dealStage: "discovery",
      price: 1200,
      painPoints: ["cost", "low adoption"],
    },
    pitchText: "Addressing healthcare infrastructure bottlenecks, our solution scales AI-driven medical imaging workflows without expensive GPU servers or complex cluster maintenance. By compressing patient image telemetry indexes into lightweight signatures, we deliver real-time diagnoses directly to local clinics. Excellent clinical feedback, resulting in rapid software adoption at minimal cost.",
  },
  {
    id: 5,
    label: "Apex BioMed Diagnostics",
    category: "Healthcare",
    features: {
      industry: "Healthcare",
      dealStage: "proposal",
      price: 7500,
      painPoints: ["compliance", "integration"],
    },
    pitchText: "Designed for regulatory-critical diagnostic workloads, Apex BioMed connects global sequencing equipment through a simplified, compliant API tunnel. It automatically validates bio-ingest records on the fly and integrates and stores records in decentralized off-grid nodes. This eliminates latency bottlenecks and avoids expensive data-leak risks, ensuring high diagnostic accuracy.",
  },
  {
    id: 6,
    label: "EduStream Interactive Core",
    category: "Education",
    features: {
      industry: "Education",
      dealStage: "negotiation",
      price: 3100,
      painPoints: ["low adoption", "cost"],
    },
    pitchText: "Leveraging decentralized digital classroom links, the EduStream interactive suite delivers low-bandwidth, hyper-responsive video learning channels for regional institutions. It bypasses expensive content delivery networks by fetching peer-cached student files locally. This solves high-performance delivery concerns at a fraction of standard hosting fees, driving high student user retention.",
  }
];
