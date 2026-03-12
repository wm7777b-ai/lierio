"use client";

import { ChevronRight, Play, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SCENARIO_LABELS } from "@/data/mock-cases";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/store/useConversationStore";
import type { AnalysisMode, PageStage, ScenarioType } from "@/types/conversation";

type PrimaryStatus = "未开始" | "AI分析总结中" | "人工处理中" | "处理完成";

const PRIMARY_STATUS_MAP: Record<PageStage, PrimaryStatus> = {
  idle: "未开始",
  monitoring: "AI分析总结中",
  drafting: "AI分析总结中",
  resolving: "AI分析总结中",
  reviewing: "AI分析总结中",
  ready: "人工处理中",
  submitted: "处理完成",
};

const WORKFLOW_STATUS_MAP: Record<PageStage, string> = {
  idle: "待启动",
  monitoring: "会话理解中",
  drafting: "摘要生成中",
  resolving: "处置建议生成中",
  reviewing: "审查确认中",
  ready: "审查完成",
  submitted: "审查完成",
};

const WORKFLOW_STEP_PROGRESS: Record<PageStage, number> = {
  idle: -1,
  monitoring: 0,
  drafting: 1,
  resolving: 2,
  reviewing: 3,
  ready: 3,
  submitted: 3,
};

const WORKFLOW_STEPS = [
  "会话理解",
  "草稿生成",
  "处置建议",
  "审查确认",
];

const primaryStatusToneMap = {
  "未开始": "neutral",
  "AI分析总结中": "info",
  "人工处理中": "warning",
  "处理完成": "success",
} as const;

export function TopStatusBar() {
  const [openFlowPanel, setOpenFlowPanel] = useState(false);

  const selectedScenario = useConversationStore((state) => state.selectedScenario);
  const analysisMode = useConversationStore((state) => state.analysisMode);
  const pageStage = useConversationStore((state) => state.pageStage);
  const currentTurnIndex = useConversationStore((state) => state.currentTurnIndex);
  const conversationTurns = useConversationStore((state) => state.conversationTurns);
  const setScenario = useConversationStore((state) => state.setScenario);
  const setAnalysisMode = useConversationStore((state) => state.setAnalysisMode);
  const startAnalysis = useConversationStore((state) => state.startAnalysis);
  const nextTurn = useConversationStore((state) => state.nextTurn);
  const resetPage = useConversationStore((state) => state.resetPage);

  const canStepManually =
    analysisMode === "manual" &&
    pageStage !== "idle" &&
    pageStage !== "submitted" &&
    currentTurnIndex < conversationTurns.length - 1;
  const primaryStatus = PRIMARY_STATUS_MAP[pageStage];
  const workflowStatus = WORKFLOW_STATUS_MAP[pageStage];
  const activeWorkflowStep = WORKFLOW_STEP_PROGRESS[pageStage];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/95 px-5 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-[30px]">
              会话实时分析台
            </p>
            <p className="text-sm font-medium text-slate-600">
              用AI重构座席会话处理工作流
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs font-medium text-slate-500">当前状态</span>
            <StatusBadge
              label={primaryStatus}
              tone={primaryStatusToneMap[primaryStatus]}
              className="px-3"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5">
          <div className="flex items-center gap-2 sm:hidden">
            <span className="text-xs font-medium text-slate-500">当前状态</span>
            <StatusBadge
              label={primaryStatus}
              tone={primaryStatusToneMap[primaryStatus]}
              className="px-2.5"
            />
          </div>

          <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {(["service", "outbound"] as ScenarioType[]).map((item) => {
              const active = selectedScenario === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setScenario(item)}
                  className={cn(
                    "rounded-xl px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-600 text-white shadow-[0_8px_14px_-12px_rgba(37,99,235,0.5)]"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {SCENARIO_LABELS[item]}
                </button>
              );
            })}
          </div>

          <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {(["auto", "manual"] as AnalysisMode[]).map((mode) => {
              const active = analysisMode === mode;
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFlowPanel((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <span className="text-xs text-slate-500">AI工作流</span>
              <span className="font-semibold text-slate-700">{workflowStatus}</span>
            </button>

            {openFlowPanel ? (
              <div className="absolute top-11 right-0 z-30 w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_36px_-18px_rgba(15,23,42,0.32)]">
                <p className="mb-2 text-sm font-semibold text-slate-900">AI流程浮窗</p>
                <div className="space-y-2">
                  {WORKFLOW_STEPS.map((item, index) => {
                    const done = index < activeWorkflowStep;
                    const current = index === activeWorkflowStep;
                    return (
                      <div
                        key={item}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-sm",
                          done && "border-slate-200 bg-slate-50 text-slate-700",
                          current && "border-amber-200 bg-amber-50 text-amber-700",
                          !done && !current && "border-slate-200 bg-slate-50 text-slate-500",
                        )}
                      >
                        {item}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={startAnalysis}
              className="h-9 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-500 shadow-[0_8px_18px_-14px_rgba(37,99,235,0.5)]"
            >
              <Play className="mr-1 h-4 w-4" />
              重新分析
            </Button>

            {canStepManually ? (
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
