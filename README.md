# Hormojee (YC W26) 🚀

> **We vectorize B2B customer profiles to synthesize hyper-personalized, high-conversion sales copy in under 100ms.**

---

### The Problem
Modern B2B outbound sales is polarized. Teams are forced to choose between **low-response automated spam campaigns** or **highly researched manual pitches** that waste hours of representative bandwidth. Existing sales engagement tools do not understand the geometry of a deal—they rely on flat, static email templates that fail to engage modern executive buyers.

### Our Solution
**Hormojee** is a modern B2B Vector Pitch Synthesis Engine. We represent company firmographics, deal stages, contract values, and core buyer pain points as dense high-dimensional binary vectors. 

By calculating the geometric cosine similarity to historic conversion centroids, Hormojee instantly maps new warm leads to the exact mathematical template that closed similar historic deals. We then run a real-time, tone-customized LLM refinement pass (powered by OpenRouter & Gemini) before bundling the output into a **one-click ChatGPT Deep Link** to instantly scale hyper-personalized outbound outreach.

---

## ⚡ Core Startup Features

1. **Hyperdimensional Vectorization Engine**
   - Transmutes categorical fields (Industry, Deal Stage, Pain Points, Contract Value) into dense profile-mapping bits.
   - Computes real-time geometric similarity on the client-side to instantly visualize cluster alignment.

2. **Multi-Tone LLM Refinement Pipeline**
   - Refines draft scripts via API-orchestrated Large Language Models (OpenRouter API with native server-side Gemini fallback).
   - Adjusts the copywriting instantly based on specific buyer-persona psychology: **Consultative**, **Aggressive**, **Empathetic**, **Direct**, or **Analytical**.

3. **Instant Outbound Deep-Linking**
   - Instantly compiles the raw pitch, mathematical vectors, and company details into a secure ChatGPT deep-link.
   - Allows sales representatives to seamlessly transition directly from CRM dashboards into active AI workspaces via any ChatGPT interface (`gpt-4o`, `o1`, or `o1-mini`) with pre-framed context to instantly produce polished marketing copy.

---

## 🛠️ Stack & Architecture

Hormojee is built with a highly responsive, high-performance full-stack architecture:

- **Frontend**: Single-Page React (Vite) + Tailwind CSS + Lucide Icons + custom canvas laser-scanning simulation to show real-time high-dimensional profile-bit streaming.
- **Backend**: Lightweight Express.js Node server for secure server-side LLM orchestration keeping API keys safe from the client.
- **Intelligence**: Native OpenRouter API integrations (backed by `google/gemini-2.5-flash`) with dynamic fallback to server-side Google Gemini.

---

## 🚦 Getting Started Inside the Sandbox

### 1. Setup Environmental Variables
Create your local `.env` configuration file from the template:
```bash
cp .env.example .env
```

Define your secrets inside `.env`:
```env
GEMINI_API_KEY="your-google-gemini-key"
OPEN_API="your-openrouter-key"
```

### 2. Install & Start Development Environment
```bash
# Install dependencies
npm install

# Build and boot full-stack server
npm run dev
```

The application is configured to run on Port `3000` with hot-reloading configurations.

---

## 📈 YC Venture Backing (W26 Concept Pitch)
Hormojee is empowering B2B outbound teams to execute high-volume campaigns with bespoke-level quality. By reducing research times from **15 minutes to zero seconds** while boosting email reply rates, we are building the definitive foundational layer for autonomous sales intelligence.
