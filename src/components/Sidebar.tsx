/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LayoutDashboard, Sparkles, History, Settings, Plus, HelpCircle } from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onNewLeadClick: () => void;
}

export default function Sidebar({ currentTab, setTab, onNewLeadClick }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "generator", label: "Pitch Creator", icon: Sparkles },
    { id: "history", label: "Saved Pitches", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      id="side-nav-bar"
      className="h-screen w-64 fixed left-0 top-0 bg-white border-r border-slate-200/80 flex flex-col py-6 z-50 select-none"
    >
      {/* Rebranded minimalist Hormojee Brand Logo */}
      <div className="px-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          </div>
          <div>
            <h2 className="font-sans font-extrabold text-[#111827] text-xl leading-none tracking-tight">
              Hormojee
            </h2>
            <span className="text-[9px] text-slate-400 font-sans tracking-widest font-bold uppercase block mt-1">
              PITCH COMPANION
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 mt-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-slate-50 text-slate-900 border border-slate-200/60 font-black shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer operations */}
      <div className="px-4 mt-auto space-y-4">
        <button
          id="btn-sidebar-new-lead"
          onClick={onNewLeadClick}
          className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-800 transition-all duration-150 transform active:scale-95 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5px]" />
          Create New Pitch
        </button>

        <div className="pt-4 border-t border-slate-100">
          <button
            id="btn-sidebar-support"
            onClick={() => alert("Connecting to Hormojee Support Desk...")}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-slate-700 font-sans text-xs font-medium rounded-lg transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            Support Desk
          </button>
        </div>
      </div>
    </aside>
  );
}
