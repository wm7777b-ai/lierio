"use client";

import { CheckCircle2, Flag, MessageSquarePlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";
import type { FeedbackClosureViewModel } from "@/types/workbench-view-model";

interface FeedbackClosureCardProps {
  stage: PageStage;
  feedbackClosure: FeedbackClosureViewModel;
  actionExecuted: boolean;
}

export function FeedbackClosureCard({
  stage,
  feedbackClosure,
  actionExecuted,
}: FeedbackClosureCardProps) {
  const visible = hasReachedStage(stage, "ready");
  const [showFeedbackOptions, setShowFeedbackOptions] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string>("");

  if (!visible) {
    return (
      <SectionCard title="反馈沉淀" description="自动优先，人工可选" tone="default">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          主流程收口后，这里会显示沉淀状态。
        </div>
      </SectionCard>
    );
  }

  const showFinalStatus = actionExecuted;
  const isCandidate = showFinalStatus && feedbackClosure.candidateBadcase;
  const statusLabel = showFinalStatus ? feedbackClosure.status : "待收尾";

  return (
    <SectionCard
      title="反馈沉淀"
      description="自动收尾，不增加主流程负担"
      tone="default"
      className={cn(feedbackClosure.weakDisplay && "opacity-90")}
      headerExtra={
        <StatusBadge
          label={statusLabel}
          tone={isCandidate ? "warning" : showFinalStatus ? "success" : "neutral"}
        />
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">沉淀状态</p>
        <p className="mt-1 text-sm text-slate-800">
          {showFinalStatus ? feedbackClosure.suggestionNote : "下一步动作完成后自动沉淀。"}
        </p>
      </div>

      {isCandidate ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2">
          <p className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
            <Flag className="h-3.5 w-3.5" />
            候选 badcase
          </p>
          <p className="mt-1 text-sm text-amber-700">
            已标记候选问题样本
            {feedbackClosure.candidateReason ? `：${feedbackClosure.candidateReason}` : ""}
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <p className="mb-2 text-xs text-slate-500">轻量反馈（可选）</p>
        {!showFinalStatus ? (
          <p className="text-sm text-slate-600">完成下一步动作后可进行轻量反馈。</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackOptions((value) => !value)}
                className="h-8 rounded-lg border-slate-200 bg-white text-slate-700"
              >
                <MessageSquarePlus className="mr-1 h-4 w-4" />
                反馈问题
              </Button>
              {selectedFeedback ? (
                <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  已反馈：{selectedFeedback}
                </p>
              ) : null}
            </div>
            {showFeedbackOptions ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {feedbackClosure.lightFeedbackOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedFeedback(option);
                      setShowFeedbackOptions(false);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </SectionCard>
  );
}
