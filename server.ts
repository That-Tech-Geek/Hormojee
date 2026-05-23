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

// Global logger to trace incoming api requests
app.use((req, res, next) => {
  console.log(`[SERVER] Incoming Request: ${req.method} ${req.url} - Content-Type: ${req.headers["content-type"]}`);
  next();
});

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
      tone: product.tone || "Consultative",
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

    // 3. Local high-dimensional template interpolation engine - 100% reliable, zero-latency
    let fallbackUsed = true;
    let refinementUsed = "Hormojee Local HDC Synthesis";

    const painsText = prodData.painPoints.length > 0
      ? `by targeting your primary concern around ${prodData.painPoints.join(" and ")}`
      : "by modernizing your workflow telemetry";

    const baseTemplate = primaryMatch.baseText;

    // Build adaptive, hyper-personalized pitch text locally 
    let finalizedPitchText = "";
    if (prodData.tone === "Aggressive") {
      finalizedPitchText = `${prodData.name} cannot afford to stall. Mapped directly onto our leading high-affinity coordinate network, our enterprise framework eliminates the bleeding costs of ${painsText}. At $${prodData.price.toLocaleString()}/mo, this is the definitive vector to convert your '${prodData.dealStage}' pipeline into a high-yield machine in under 100ms.`;
    } else if (prodData.tone === "Empathetic") {
      finalizedPitchText = `We understand the complex operational pressures holding ${prodData.name} back. By aligning our custom high-dimensional vectors to address ${painsText}, we aim to stand with you as a dedicated partner. For $${prodData.price.toLocaleString()}/mo, we can craft a low-friction adoption stream together, easing compliance hurdles at every node of your '${prodData.dealStage}' cycle.`;
    } else if (prodData.tone === "Direct") {
      finalizedPitchText = `Our high-performance B2B engine has mapped ${prodData.name}'s profile with ${(finalConfidence * 100).toFixed(0)}% affinity. At a contract value of $${prodData.price.toLocaleString()}/mo, we eliminate ${painsText} directly. This stabilizes your '${prodData.dealStage}' pipeline with guaranteed sub-10ms operational speeds starting today.`;
    } else if (prodData.tone === "Visionary") {
      finalizedPitchText = `Enter a new era of sales intelligence designed for ${prodData.name}. Unlocking our hyperdimensional neural matrix, we transform standard '${prodData.dealStage}' data with a customized $${prodData.price.toLocaleString()}/mo configuration. This is the blueprint to resolve ${painsText} and pioneer autonomous B2B outbound sequences.`;
    } else if (prodData.tone === "Analytical") {
      finalizedPitchText = `Our data model indicates that ${prodData.name} fits a highly structured centroid pattern. With a monthly subscription index of $${prodData.price.toLocaleString()}, the calculated math secures optimization ${painsText}. Accelerating your '${prodData.dealStage}' metrics to peak capacity brings absolute operational clarity.`;
    } else { // Consultative / Default
      finalizedPitchText = `We have synthesized a custom partnership model tailored specifically to ${prodData.name}'s current operations. At a projected contract of $${prodData.price.toLocaleString()}/mo, our system integrates seamlessly to solve ${painsText}. Let's collaborate to streamline your '${prodData.dealStage}' stage with sub-10ms high-affinity vector delivery.`;
    }

    // Advanced dynamic refinement & conversation logic if improve flag is active
    if (improve) {
      const feedback = req.body.feedback || {};
      const previousScript = req.body.previousScript || finalizedPitchText;
      const client = getGeminiClient();

      if (client) {
        const grievancesStr = feedback.grievances && feedback.grievances.length > 0
          ? feedback.grievances.join(", ")
          : "None specified";
        const amplifyAngleStr = feedback.amplifyAngle || "General SaaS partnership value";
        const customRefinementStr = feedback.customRefinement || "None specified";

        const prompt = `You are an elite enterprise B2B sales copywriter and outreach expert.
An outbound script was generated with details:
Target Prospect: ${prodData.name} (Role: ${product.prospectRole || "Decision Maker"})
Industry: ${prodData.industry}
Deal Stage: ${prodData.dealStage}
Price: $${prodData.price.toLocaleString()}/mo
Tone: ${prodData.tone}
Channel: ${product.channel || "Cold Email"}

Current Draft:
"${previousScript}"

The user is not fully satisfied with this draft and has submitted these clarification inputs and requested updates:
1. Specific complaints/grievances: ${grievancesStr}
2. Key angle to amplify: ${amplifyAngleStr}
3. Custom requests/feedback: "${customRefinementStr}"

Your mission is to rewrite and optimize this outbound copy. Address and resolve all grievances!
- If grievances include "too-long" or "too-wordy", write a hyper-short, high-impact script.
- If grievances include "too-pushy" or "too-aggressive", soften the tone to be highly collaborative.
- If grievances include "too-generic" or "needs-metrics", find logical places to inject ROI values.
- Seamlessly amplify the core value angle: ${amplifyAngleStr} (e.g. emphasize cost reduction, security, speed, etc.).
- Incorporate custom details: "${customRefinementStr}" if specified.
- Retain proper context and formatting for ${product.channel || "Cold Email"}.

Output ONLY the improved copywriting text itself. Absolutely no conversational intro/outro, no markdown wrappers like \`\`\`css or \`\`\`html. Just output the clean copy.`;

        try {
          const response = await client.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
          });
          if (response.text) {
            finalizedPitchText = response.text.trim();
            refinementUsed = "Hormojee Gemini-3.5-Flash Optimizer";
            fallbackUsed = false;
          }
        } catch (gemError: any) {
          console.error("Gemini optimization error, running offline rules:", gemError);
        }
      }

      // Offline deterministic optimization fallbacks if Gemini is not set up or fails
      if (fallbackUsed) {
        refinementUsed = "Hormojee Local Refinement Optimizer";
        
        // Handle grievances offline
        const grievances = feedback.grievances || [];
        if (grievances.includes("too-long") || grievances.includes("too-wordy")) {
          // Truncate to a punchy two-sentence core statement
          const sentences = finalizedPitchText.split(". ");
          if (sentences.length > 2) {
            finalizedPitchText = `${sentences[0]}. ${sentences[1]}. Let's secure a brief 10-minute slot to finalize our trajectory.`;
          }
        }

        if (grievances.includes("too-generic") || grievances.includes("needs-metrics")) {
          finalizedPitchText = `${finalizedPitchText} Mathematically, this eliminates up to 37.4% of waste, translating to a projected ROI of 312% with near-zero latency.`;
        }

        if (grievances.includes("too-pushy") || grievances.includes("too-aggressive")) {
          finalizedPitchText = `We'd love to partner with you to ease your current workloads. ${finalizedPitchText.replace(/cannot afford to stall/g, "is exploring new avenues").replace(/eliminates/g, "helps streamline")}`;
        }

        // Handle value angle offline
        if (feedback.amplifyAngle === "cost-savings") {
          finalizedPitchText = `${finalizedPitchText} Our model actively projects a minimal $14k/quarter overhead savings from day one of deployment.`;
        } else if (feedback.amplifyAngle === "time-to-adoption") {
          finalizedPitchText = `${finalizedPitchText} Installation integrates seamlessly within 3 business days with no production downtime whatsoever.`;
        } else if (feedback.amplifyAngle === "governance") {
          finalizedPitchText = `${finalizedPitchText} Full compliance and hyperdimensional telemetry logs are included natively, protecting your core networks.`;
        }

        // Handing custom refinement feedback manually
        if (feedback.customRefinement) {
          finalizedPitchText = `${finalizedPitchText} [Updated Custom Focus]: ${feedback.customRefinement}`;
        }
      }
    }

    // 4. Record new pitch inside history
    const newRecord: PitchRecord = {
      id: `pitch-${Date.now()}`,
      name: prodData.name,
      confidence: Number(finalConfidence.toFixed(4)),
      timestamp: new Date().toISOString(),
      product: {
        ...prodData,
        prospectRole: product.prospectRole,
        competitors: product.competitors,
        cta: product.cta,
        channel: product.channel
      },
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
