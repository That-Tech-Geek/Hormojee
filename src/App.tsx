/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import GeneratorView from "./components/GeneratorView";
import HistoryView from "./components/HistoryView";
import SettingsView from "./components/SettingsView";
import { PitchRecord, ProductData } from "./types";

export default function App() {
  const [currentTab, setTab] = useState<string>("dashboard");
  const [historyList, setHistoryList] = useState<PitchRecord[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<PitchRecord | null>(null);

  // Synchronize history from server API on mount
  const syncHistoryWithServer = async () => {
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch pitch history from backend", err);
    }
  };

  useEffect(() => {
    syncHistoryWithServer();
  }, []);

  // Handle deletions
  const handleDeletePitch = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setHistoryList((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete pitch item", err);
    }
  };

  // Callback when generator synthesizes a new vector and pitch
  const handlePitchGenerated = (newRecord: PitchRecord) => {
    setHistoryList((prev) => [newRecord, ...prev]);
  };

  // Navigates directly to tweaking form with parameters loaded
  const handleReviewDraft = (record: PitchRecord) => {
    setSelectedDraft(record);
    setTab("generator");
  };

  // "New Lead" sidebar button click triggers clearing form and navigating to compiler
  const handleNewLeadClick = () => {
    setSelectedDraft(null); // clears selection
    setTab("generator");
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans antialiased text-[#161616]">
      {/* Visual background atmospheric corporate grid lines */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-70 select-none bg-gradient-to-b from-white via-transparent to-[#F4F6F9]">
        {/* Subtle professional grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* Main Sidebar Anchor */}
      <Sidebar
        currentTab={currentTab}
        setTab={setTab}
        onNewLeadClick={handleNewLeadClick}
      />

      {/* Core main wrapper */}
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Top Header Panel */}
        <Header
          currentTab={currentTab}
          setTab={setTab}
          onSynthesizeClick={handleNewLeadClick}
        />

        {/* Primary View Area Canvas Container */}
        <main className="flex-1 p-6 max-w-[1440px] w-full mx-auto pb-16">
          {currentTab === "dashboard" && (
            <DashboardView
              history={historyList}
              onReviewDraft={handleReviewDraft}
              setTab={setTab}
            />
          )}

          {currentTab === "generator" && (
            <GeneratorView
              initialProduct={selectedDraft}
              onPitchGenerated={handlePitchGenerated}
            />
          )}

          {currentTab === "history" && (
            <HistoryView
              history={historyList}
              onReviewDraft={handleReviewDraft}
              onDeletePitch={handleDeletePitch}
              setTab={setTab}
            />
          )}

          {currentTab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
