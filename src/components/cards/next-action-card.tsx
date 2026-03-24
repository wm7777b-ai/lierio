"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";
import type {
  NextActionViewModel,
  NextDispositionAction,
} from "@/types/workbench-view-model";

interface NextActionCardProps {
  stage: PageStage;
  nextAction: NextActionViewModel;
  onExecute: (mode: "confirm" | "ticket_only", action: NextDispositionAction) => void;
}

const statusToneMap = {
  自动归档: "neutral",
  生成工单: "info",
  升级处理: "warning",
  其他: "neutral",
} as const;

export function NextActionCard({
  stage,
  nextAction,
  onExecute,
}: NextActionCardProps) {
  const visible = hasReachedStage(stage, "ready");
  const isSubmitted = stage === "submitted";
  const [feedback, setFeedback] = useState("");
  const [selectedAction, setSelectedAction] = useState<NextDispositionAction>(
    nextAction.recommendedAction,
  );
  const [editablePriority, setEditablePriority] = useState(nextAction.suggestedPriority);
  const [editableNextStepAdvice, setEditableNextStepAdvice] = useState(
    nextAction.nextStepAdvice,
  );
  const [editableRecommendedReason, setEditableRecommendedReason] = useState(
    nextAction.recommendedReason,
  );
  const [editableSopTitle, setEditableSopTitle] = useState(nextAction.sopTitle);

  useEffect(() => {
    setSelectedAction(nextAction.recommendedAction);
    setEditablePriority(nextAction.suggestedPriority);
    setEditableNextStepAdvice(nextAction.nextStepAdvice);
    setEditableRecommendedReason(nextAction.recommendedReason);
    setEditableSopTitle(nextAction.sopTitle);
  }, [
    nextAction.recommendedAction,
    nextAction.suggestedPriority,
    nextAction.nextStepAdvice,
    nextAction.recommendedReason,
    nextAction.sopTitle,
  ]);

  if (!visible) {
    return (
      <SectionCard title="下一步处置建议" description="话后推荐的后续处理方式" tone="default">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          会话进入话后归档阶段后，这里会给出下一步处置建议。
        </div>
      </SectionCard>
    );
  }

  const showTicketOnly = selectedAction === "生成工单";

  return (
    <SectionCard
      title="下一步处置建议"
      description="系统推荐的后续处理建议"
      tone={isSubmitted ? "active" : "focus"}
      className={cn(nextAction.weakDisplay && "opacity-90")}
      headerExtra={
        <StatusBadge
          label={selectedAction}
          tone={statusToneMap[selectedAction]}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={nextAction.actionPath} tone="neutral" />
        <StatusBadge label={nextAction.actionType} tone="neutral" />
      </div>

      <div className="border-b border-slate-100 pb-3">
        <p className="text-xs text-slate-500">推荐动作</p>
        <div className="mt-1">
          <Select
            value={selectedAction}
            onValueChange={(value) => setSelectedAction(value as NextDispositionAction)}
            disabled={isSubmitted}
          >
            <SelectTrigger className="h-9 rounded-xl border-slate-200/65 bg-slate-50/40 text-sm font-semibold text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {nextAction.recommendedActionOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-b border-slate-100 pb-3">
        <p className="text-xs text-slate-500">建议优先级</p>
        <div className="mt-1">
          <Select
            value={editablePriority}
            onValueChange={(value) => setEditablePriority(value ?? "中")}
            disabled={isSubmitted}
          >
            <SelectTrigger className="h-9 rounded-xl border-slate-200/65 bg-slate-50/40 text-sm font-semibold text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["高", "中", "低"].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-b border-slate-100 pb-3">
        <p className="text-xs text-slate-500">下一步建议</p>
        <Textarea
          value={editableNextStepAdvice}
          onChange={(event) => setEditableNextStepAdvice(event.target.value)}
          disabled={isSubmitted}
          className="mt-1 min-h-[74px] rounded-2xl border-slate-200/65 bg-slate-50/40 text-sm leading-6 text-slate-800 shadow-none"
        />
      </div>

      <div className="border-b border-slate-100 pb-3">
        <p className="text-xs text-slate-500">推荐原因</p>
        <Textarea
          value={editableRecommendedReason}
          onChange={(event) => setEditableRecommendedReason(event.target.value)}
          disabled={isSubmitted}
          className="mt-1 min-h-[74px] rounded-2xl border-slate-200/65 bg-slate-50/40 text-sm leading-6 text-slate-800 shadow-none"
        />
      </div>

      <div className="border-b border-slate-100 pb-3">
        <p className="text-[11px] text-slate-400">命中SOP</p>
        <Input
          value={editableSopTitle}
          onChange={(event) => setEditableSopTitle(event.target.value)}
          disabled={isSubmitted}
          className="mt-1 h-9 rounded-xl border-slate-200/65 bg-slate-50/40 text-xs text-slate-600 shadow-none"
        />
      </div>

      <div className="rounded-2xl bg-slate-50/70 px-3 py-2.5">
        <p className="mb-2 text-xs text-slate-500">建议确认</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              onExecute("confirm", selectedAction);
              setFeedback("已确认下一步处置建议。");
            }}
            className="h-9 rounded-xl bg-blue-600 text-white hover:bg-blue-500"
            disabled={isSubmitted}
          >
            确认
          </Button>

          {showTicketOnly ? (
            <Button
              onClick={() => {
                onExecute("ticket_only", selectedAction);
                setFeedback("已标记仅生成工单。");
              }}
              variant="outline"
              className="h-9 rounded-xl border-slate-200 bg-white text-slate-700"
              disabled={isSubmitted}
            >
              仅生成工单
            </Button>
          ) : null}
        </div>
        {feedback ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {feedback}
          </p>
        ) : null}
      </div>
    </SectionCard>
  );
}
