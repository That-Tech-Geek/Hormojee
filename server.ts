/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { ProductData, PitchRecord } from "./src/types";
import { encodeProduct, SYSTEM_CENTROIDS, bitCosine, BYTES, D } from "./src/math/hyperdimensional";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for generated pitches history, pre-populated with realistic records
let pitchHistory: PitchRecord[] = [
  {
    id: "hist-1",
    name: "Nakamoto Cybernetics",
    confidence: 0.98,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
    product: {
      name: "Nakamoto Cybernetics",
      industry: "SaaS",
      dealStage: "proposal",
      price: 4500,
      painPoints: ["compliance", "downtime"],
    },
    text: "Oracle Sales has synthesized a premium, zero-downtime compliance and defense pitch tailored specifically for Nakamoto Cybernetics. Our cloud security migration strategy delivers 99.999% container isolation with automated state-of-the-art policy management. This aligns perfectly with your projected compliance timeline, mitigating structural vulnerabilities while enabling high-efficiency parallel pipelines on R2/Workers architectures.",
    centroidId: 1
  },
  {
    id: "hist-2",
    name: "Atlas Logistics",
    confidence: 0.72,
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14 mins ago
    product: {
      name: "Atlas Logistics",
      industry: "Manufacturing",
      dealStage: "demo",
      price: 8200,
      painPoints: ["cost", "integration"],
    },
    text: "Our route optimization proposal establishes a lightweight, high-performance distributed orchestration model. By eliminating expensive intermediate layers and binding fleet operations directly to an inline mathematical projection system, Atlas Logistics can reduce fuel overheads by 18% in the first quarter of rollout. This completely clears your internal cost integration target with zero disruptions.",
    centroidId: 2
  },
  {
    id: "hist-3",
    name: "NeoTokio Energy",
    confidence: 0.94,
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 mins ago
    product: {
      name: "NeoTokio Energy",
      confidence: 94,
      industry: "Finance",
      dealStage: "negotiation",
      price: 9500,
      painPoints: ["low adoption", "compliance"],
    } as any,
    text: "This hyper-adaptive grid allocation model enables secure decentralized transaction scaling for NeoTokio Energy and financial partners. By storing encrypted trade telemetry as dense, compact representations, we reduce lookup latency to sub-10 milliseconds. Backed by solid compliance checks, this resolves regulatory overheads while driving 100% executive adoption.",
    centroidId: 3
  },
  {
    id: "hist-4",
    name: "SynthCore Systems",
    confidence: 0.61,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    product: {
      name: "SynthCore Systems",
      industry: "Healthcare",
      dealStage: "discovery",
      price: 1200,
      painPoints: ["cost", "low adoption"],
    },
    text: "Addressing healthcare infrastructure bottlenecks, our solution scales AI-driven medical imaging workflows without expensive GPU servers or complex cluster maintenance. By compressing patient image telemetry indexes into lightweight signatures, we deliver real-time diagnoses directly to local clinics. Excellent clinical feedback, resulting in rapid software adoption at minimal cost.",
    centroidId: 4
  }
];

// Lazy-initialize Gemini AI client helper to resist startup crashes
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// --------------------------------------------------------------------
// API ENDPOINTS
// --------------------------------------------------------------------

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
    hasOpenApiKey: !!process.env.OPEN_API,
    time: new Date().toISOString(),
  });
});

// Retrieve full pitch history
app.get("/api/history", (req, res) => {
  res.json({ status: "success", history: pitchHistory });
});

// Delete history item
app.delete("/api/history/:id", (req, res) => {
  const { id } = req.params;
  pitchHistory = pitchHistory.filter((item) => item.id !== id);
  res.json({ status: "success", message: "Pitch deleted successfully" });
});

// Primary Pitch synthesis endpoint executing mapping, bundling & optional LLM refining
app.post("/api/pitch", async (req, res) => {
  try {
    const { product, improve } = req.body;
    if (!product || !product.industry) {
      return res.status(400).json({ error: "Missing product data or parameters" });
    }

    const prodData: ProductData = {
      name: product.name || "Target Prospect",
      industry: product.industry,
      dealStage: product.dealStage || "discovery",
      price: Number(product.price) || 1000,
      painPoints: product.painPoints || [],
      customAttributes: product.customAttributes || {},
    };

    // 1. Calculate high dimensional vector representing current query product
    const queryVec = encodeProduct(prodData);

    // 2. Compute similarity against SYSTEM_CENTROIDS using Hamming Distance Cosine projection
    const matches = SYSTEM_CENTROIDS.map((centroid) => {
      // Encode centroid features into hypervector
      const centroidData: ProductData = {
        name: centroid.label,
        industry: centroid.features.industry || "",
        dealStage: centroid.features.dealStage || "discovery",
        price: centroid.features.price || 1000,
        painPoints: centroid.features.painPoints || [],
      };
      const centroidVec = encodeProduct(centroidData);
      const sim = bitCosine(queryVec, centroidVec);

      return {
        centroidId: centroid.id,
        label: centroid.label,
        confidence: sim,
        baseText: centroid.pitchText,
      };
    });

    // Sort by cosine similarity descending
    matches.sort((a, b) => b.confidence - a.confidence);
    const primaryMatch = matches[0];

    // Rescale similarity range to logical positive percentage representation 60% - 100%
    const finalConfidence = Math.max(0.6, Math.min(0.99, (primaryMatch.confidence + 1) / 2));

    // 3. Optional refinement with OpenRouter or Gemini Client
    let finalizedPitchText = primaryMatch.baseText;
    let fallbackUsed = true;
    let refinementUsed = "HDC Local Centroid Mapping";

    const improvementDirective = improve
      ? `\nREGENERATION & IMPROVEMENT DIRECTIVE:\nThis is a subsequent refinement request. The user wants you to further improve, polish, and enrich this pitch. Place extra emphasis on highlighting substantial ROI metrics, amplifying business urgency, and perfecting the executive wording to make it highly persuasive. Maintain exactly 3 to 4 sentences without any generic fluff.`
      : "";

    const prompt = `
You are the High-Performance Sales Oracle Agent.
You are given a target company profile and the nearest matching historic, high-conversion sales centroid pitch.

TARGET PROFILE:
- Name: ${prodData.name}
- Industry: ${prodData.industry}
- Deal Stage: ${prodData.dealStage}
- Contract Value/Price: $${prodData.price}
- Core Pain Points: ${prodData.painPoints.join(", ") || "None specified"}

NEAREST CLUSTER MATCH (Similarity Score: ${(finalConfidence * 100).toFixed(1)}%):
"${primaryMatch.baseText}"

TASK:
Refine the cluster match pitch into a hyper-personalized, punchy, persuasive, professional pitch that is structured specifically for ${prodData.name}.${improvementDirective}
Keep the strong high-dimensional mathematical core intact, but replace boilerplate fields with realistic metrics tailored specifically to their domain.
Make it sound executive, elegant, and definitive (around 3 to 4 impactful sentences). Do not include any greeting or signature line, just output the pure refined pitch text itself.
`;

    // Try OpenRouter if OPEN_API key (or OpenRouter variable) is specified
    if (process.env.OPEN_API) {
      try {
        console.log("Using OpenRouter with OPEN_API key for pitch refinement...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPEN_API}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai.studio/build",
            "X-Title": "Oracle Sales Applet"
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            finalizedPitchText = data.choices[0].message.content.trim();
            fallbackUsed = false;
            refinementUsed = "OpenRouter (Gemini 2.5 Flash)";
          }
        } else {
          console.error(`OpenRouter model call returned status ${response.status}: ${response.statusText}`);
        }
      } catch (orError: any) {
        console.error("OpenRouter call failed, falling back:", orError.message);
      }
    }

    // Try native Gemini API client as secondary LLM fallback
    if (fallbackUsed) {
      const ai = getGeminiClient();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          });

          if (response && response.text) {
            finalizedPitchText = response.text.trim();
            fallbackUsed = false;
            refinementUsed = "Gemini-3.5-Flash";
          }
        } catch (gemError) {
          console.error("Gemini call failed, defaulting to mathematical template", gemError);
        }
      }
    }

    // Dynamic templated interpolation if LLM fallback is triggered
    if (fallbackUsed) {
      const painsText = prodData.painPoints.length > 0
        ? `by surgically targeting your team's friction around ${prodData.painPoints.join(" and ")}`
        : "by modernizing your workflow telemetry";

      finalizedPitchText = `Oracle Sales high-velocity pipeline has mapped a custom vector matching ${prodData.name}'s profile. Engineered specifically for the ${prodData.industry} sector at a contract rate of $${prodData.price.toLocaleString()}, our hyperdimensional architecture streamlines deal progression toward a successful '${prodData.dealStage}' cycle. We eliminate operational bottlenecks ${painsText}, securing a massive competitive advantage with sub-10ms delivery speeds.`;
    }

    // 4. Record new pitch inside history
    const newRecord: PitchRecord = {
      id: `pitch-${Date.now()}`,
      name: prodData.name,
      confidence: Number(finalConfidence.toFixed(4)),
      timestamp: new Date().toISOString(),
      product: prodData,
      text: finalizedPitchText,
      centroidId: primaryMatch.centroidId
    };

    pitchHistory.unshift(newRecord);

    res.json({
      status: "success",
      pitch: newRecord,
      mathDetails: {
        nearestMatch: primaryMatch.label,
        matchedCentroidId: primaryMatch.centroidId,
        similarityHistory: matches.map(m => ({ label: m.label, similarity: m.confidence })),
        dimensions: D,
        bundleSize: BYTES,
        refinementUsed: refinementUsed
      }
    });

  } catch (err: any) {
    console.error("Pitch generation error:", err);
    res.status(500).json({ error: "Internal server error during pitch synthesis: " + err.message });
  }
});

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing at http://0.0.0.0:${PORT}`);
  });
}

startServer();
