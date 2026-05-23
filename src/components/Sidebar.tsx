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
    { id: "generator", label: "Pitch Generator", icon: Sparkles },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Deploy & Config", icon: Settings },
  ];

  return (
    <aside
      id="side-nav-bar"
      className="h-screen w-64 fixed left-0 top-0 bg-[#161616] border-r border-[#2d2d2d] flex flex-col py-6 z-50 select-none"
    >
      {/* Brand logo */}
      <div className="px-6 pb-8">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm bg-[#00FF41] animate-pulse"></div>
          <h2 className="font-sans font-black text-xl text-white tracking-tight">
            Oracle Sales
          </h2>
        </div>
        <p className="text-[#a5b4fc] text-[10px] font-mono uppercase tracking-widest mt-1.5 font-bold">
          Elite Tier Agent
        </p>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#242424] text-[#00FF41] border-l-2 border-[#00FF41] font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#1d1d1d]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#00FF41]" : "text-slate-400"}`} />
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
          className="w-full bg-[#00FF41] text-black py-2.5 rounded font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#2eff63] transition-all duration-150 transform active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.15)]"
        >
          <Plus className="w-4 h-4 text-black stroke-[3px]" />
          New Lead Link
        </button>

        <div className="pt-4 border-t border-[#242424]">
          <button
            id="btn-sidebar-support"
            onClick={() => alert("Connecting to elite enterprise support desk...")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-[#1d1d1d] font-sans text-xs font-medium rounded transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            Support Desk
          </button>
        </div>
      </div>
    </aside>
  );
}
