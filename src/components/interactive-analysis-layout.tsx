"use client";

import { Button } from "@/components/ui/button";
import { Save, Download, TrendingUp } from "lucide-react";
import { ReactNode, useState } from "react";

interface InteractiveAnalysisLayoutProps {
  jobTitle?: string;
  company?: string;
  overallScore?: number;
  children: {
    leftPanel: ReactNode;
    centerPanel: ReactNode;
    rightPanel: ReactNode;
  };
}

export function InteractiveAnalysisLayout({
  jobTitle = "Position",
  company = "Company",
  overallScore = 0,
  children,
}: InteractiveAnalysisLayoutProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Header Bar */}
      <div className="w-full border-b bg-white z-10 flex-shrink-0">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-semibold truncate">
                {jobTitle} @ {company}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
                Overall Match:
              </span>
              <span className={`text-base md:text-lg font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" disabled className="hidden sm:flex">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" disabled className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: 3-Panel Layout */}
      <div className="hidden xl:flex flex-1 overflow-hidden">
        {/* Left Panel - Category Navigation */}
        <aside
          className={`
            ${leftPanelOpen ? "w-[280px]" : "w-0"} 
            border-r bg-gray-50 
            transition-all duration-300 
            overflow-y-auto
            flex-shrink-0
          `}
        >
          {leftPanelOpen && <div className="p-4">{children.leftPanel}</div>}
        </aside>

        {/* Center Panel - Category Details */}
        <main className="flex-[1.5] overflow-y-auto bg-white min-w-0" style={{ minWidth: "300px" }}>
          <div className="p-4 md:p-6">{children.centerPanel}</div>
        </main>

        {/* Right Panel - PDF Viewer (~40% width) */}
        <aside
          className={`
            ${rightPanelOpen ? "flex-[1.2] min-w-[450px]" : "w-0"} 
            border-l bg-gray-50 
            transition-all duration-300 
            overflow-y-auto
            flex-shrink-0
          `}
        >
          {rightPanelOpen && <div className="p-4 h-full">{children.rightPanel}</div>}
        </aside>
      </div>

      {/* Large Tablet/Small Desktop: 2-Panel Layout (1024px - 1279px) */}
      <div className="hidden lg:flex xl:hidden flex-1 overflow-hidden relative">
        {/* Left Panel - Category Navigation */}
        <aside
          className={`
            ${leftPanelOpen ? "w-[280px]" : "w-0"} 
            border-r bg-gray-50 
            transition-all duration-300 
            overflow-y-auto
            flex-shrink-0
          `}
        >
          {leftPanelOpen && <div className="p-4">{children.leftPanel}</div>}
        </aside>

        {/* Center Panel - Category Details */}
        <main className="flex-[1.5] overflow-y-auto bg-white min-w-0" style={{ minWidth: "300px" }}>
          <div className="p-4 md:p-6">{children.centerPanel}</div>
        </main>

        {/* Right Panel Toggle Button */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="absolute right-0 top-1/2 z-20 bg-gray-200 hover:bg-gray-300 p-2 rounded-l-lg transition-colors shadow-md"
          aria-label="Toggle right panel"
        >
          {rightPanelOpen ? "▶" : "◀"}
        </button>

        {rightPanelOpen && (
          <aside className="flex-[1.2] min-w-[400px] border-l bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="p-4 h-full">{children.rightPanel}</div>
          </aside>
        )}
      </div>

      {/* Tablet: Collapsible Panels (768px - 1023px) */}
      <div className="hidden md:flex lg:hidden flex-1 flex-col overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Panel Toggle Button */}
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="absolute left-0 top-1/2 z-20 bg-gray-200 hover:bg-gray-300 p-2 rounded-r-lg transition-colors shadow-md"
            aria-label="Toggle left panel"
          >
            {leftPanelOpen ? "◀" : "▶"}
          </button>

          {leftPanelOpen && (
            <aside className="w-[260px] border-r bg-gray-50 overflow-y-auto flex-shrink-0">
              <div className="p-4">{children.leftPanel}</div>
            </aside>
          )}

          {/* Center Panel */}
          <main
            className="flex-[1.5] overflow-y-auto bg-white min-w-0"
            style={{ minWidth: "250px" }}
          >
            <div className="p-4 md:p-6">{children.centerPanel}</div>
          </main>

          {/* Right Panel Toggle Button */}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="absolute right-0 top-1/2 z-20 bg-gray-200 hover:bg-gray-300 p-2 rounded-l-lg transition-colors shadow-md"
            aria-label="Toggle right panel"
          >
            {rightPanelOpen ? "▶" : "◀"}
          </button>

          {rightPanelOpen && (
            <aside className="flex-[1.2] min-w-[350px] border-l bg-gray-50 overflow-y-auto flex-shrink-0">
              <div className="p-4 h-full">{children.rightPanel}</div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile: Stacked Layout (< 768px) */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        {/* Category Navigation - Mobile */}
        <div className="border-b bg-gray-50 overflow-x-auto flex-shrink-0">
          <div className="p-4 min-w-max">{children.leftPanel}</div>
        </div>

        {/* Center Panel - Mobile */}
        <div className="flex-1 overflow-y-auto bg-white min-w-0">
          <div className="p-4">{children.centerPanel}</div>
        </div>

        {/* PDF Viewer - Mobile (Collapsible) */}
        {rightPanelOpen && (
          <div className="border-t bg-gray-50 overflow-y-auto max-h-[40vh] flex-shrink-0">
            <div className="p-4">{children.rightPanel}</div>
          </div>
        )}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="md:hidden w-full py-2 bg-gray-100 hover:bg-gray-200 border-t text-sm font-medium"
          aria-label="Toggle PDF viewer"
        >
          {rightPanelOpen ? "Hide Resume Preview" : "Show Resume Preview"}
        </button>
      </div>
    </div>
  );
}
