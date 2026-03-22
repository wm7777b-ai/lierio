"use client";

import { ChevronRight, Play, RotateCcw } from "lucide-react";

import { buildTopBarViewModel } from "@/adapters/workbench-adapter";
import { Button } from "@/components/ui/button";
import { SCENARIO_OPTIONS } from "@/data/mock-cases";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/store/useConversationStore";
import type { AnalysisMode } from "@/types/conversation";

const primaryStatusToneMap = {
  "未开始": "neutral",
  "AI分析总结中": "info",
  "人工处理中": "warning",
  "处理完成": "success",
} as const;

export function TopStatusBar() {
  const selectedScenario = useConversationStore((state) => state.selectedScenario);
  const pageStage = useConversationStore((state) => state.pageStage);
  const activeCaseId = useConversationStore((state) => state.activeCaseId);
  const analysisMode = useConversationStore((state) => state.analysisMode);
  const currentTurnIndex = useConversationStore((state) => state.currentTurnIndex);
  const totalTurns = useConversationStore((state) => state.conversationTurns.length);
  const setScenario = useConversationStore((state) => state.setScenario);
  const setAnalysisMode = useConversationStore((state) => state.setAnalysisMode);
  const startAnalysis = useConversationStore((state) => state.startAnalysis);
  const nextTurn = useConversationStore((state) => state.nextTurn);
  const resetPage = useConversationStore((state) => state.resetPage);

  const topBarViewModel = buildTopBarViewModel({
    activeCaseId,
    pageStage,
    analysisMode,
    currentTurnIndex,
    totalTurns,
  });
  const selectedScenarioOption = SCENARIO_OPTIONS.some(
    (item) => item.value === selectedScenario,
  )
    ? selectedScenario
    : undefined;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/95 px-5 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-[30px]">
              {topBarViewModel.systemName}
            </p>
            <p className="text-sm font-medium text-slate-600">
              {topBarViewModel.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">处理状态</span>
            <StatusBadge
              label={topBarViewModel.processingStatus}
              tone={primaryStatusToneMap[topBarViewModel.processingStatus]}
              className="px-3"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5">
          <StatusBadge
            label={topBarViewModel.moduleLabel}
            tone="intent"
            className="px-3"
          />

          <Select
            value={selectedScenarioOption}
            onValueChange={(value) => {
              const matched = SCENARIO_OPTIONS.find((item) => item.value === value);
              if (!matched) return;
              setScenario(matched.value);
            }}
          >
            <SelectTrigger className="h-9 w-[300px] rounded-xl border-slate-200 bg-white text-sm text-slate-800">
              <SelectValue placeholder="场景选择" />
            </SelectTrigger>
            <SelectContent>
              {SCENARIO_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {(["auto", "manual"] as AnalysisMode[]).map((mode) => {
              const active = topBarViewModel.analysisMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAnalysisMode(mode)}
                  className={cn(
                    "rounded-xl px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "bg-white text-slate-900 shadow-[0_6px_12px_-10px_rgba(15,23,42,0.35)]"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {mode === "auto" ? "自动推进" : "逐轮推进"}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={startAnalysis}
              className="h-9 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-500 shadow-[0_8px_18px_-14px_rgba(37,99,235,0.5)]"
            >
              <Play className="mr-1 h-4 w-4" />
              {pageStage === "idle" ? "开始分析" : "重新分析"}
            </Button>

            {topBarViewModel.canStepManually ? (
              <Button
                onClick={nextTurn}
                variant="outline"
                className="h-9 rounded-xl border-slate-200 bg-white text-slate-700"
              >
                <ChevronRight className="mr-1 h-4 w-4" />
                下一轮
              </Button>
            ) : null}

            <Button
              variant="outline"
              onClick={resetPage}
              className="h-9 rounded-xl border-slate-200 bg-white text-slate-700"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              重置
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
