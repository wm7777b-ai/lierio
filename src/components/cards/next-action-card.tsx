"use client";

import { Archive, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";
import type {
  NextActionType,
  NextActionViewModel,
} from "@/types/workbench-view-model";

interface NextActionCardProps {
  stage: PageStage;
  nextAction: NextActionViewModel;
  onExecute: (actionType: NextActionType) => void;
}

const typeToneMap: Record<
  NextActionViewModel["actionType"],
  "neutral" | "info" | "warning" | "danger"
> = {
  直接归档: "neutral",
  一键执行: "info",
  确认后执行: "warning",
  人工接管: "danger",
};

export function NextActionCard({
  stage,
  nextAction,
  onExecute,
}: NextActionCardProps) {
  const visible = hasReachedStage(stage, "ready");
  const [feedback, setFeedback] = useState("");
  const isSubmitted = stage === "submitted";

  const buttonClassName = useMemo(() => {
    if (nextAction.actionType === "人工接管") {
      return "h-10 rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100";
    }
    if (nextAction.actionType === "确认后执行") {
      return "h-10 rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
    }
    if (nextAction.actionType === "直接归档") {
      return "h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
    }
    return "h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-500";
  }, [nextAction.actionType]);

  if (!visible) {
    return (
      <SectionCard title="下一步动作" description="会话收口后的执行建议" tone="default">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          会话进入收口阶段后，这里会给出下一步动作建议。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="下一步动作"
      description="会后收口到执行的动作建议"
      tone={isSubmitted ? "active" : "focus"}
      className={cn(nextAction.weakDisplay && "opacity-90")}
      headerExtra={
        <StatusBadge
          label={nextAction.actionType}
          tone={typeToneMap[nextAction.actionType]}
        />
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">动作类型</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{nextAction.actionType}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">动作名称</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{nextAction.actionName}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">动作原因</p>
        <p className="mt-1 text-sm text-slate-800">{nextAction.actionReason}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-xs text-slate-500">是否需要确认</p>
        <p
          className={cn(
            "mt-1 text-sm font-semibold",
            nextAction.needConfirmation ? "text-amber-700" : "text-slate-700",
          )}
        >
          {nextAction.needConfirmation ? "需要人工确认" : "可直接执行"}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">建议说明</p>
        <p className="mt-1 text-sm text-slate-800">{nextAction.suggestionNote}</p>
      </div>

      {nextAction.riskTip ? (
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 px-3 py-2">
          <p className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
            <ShieldAlert className="h-3.5 w-3.5" />
            风险提示
          </p>
          <p className="mt-1 text-sm text-rose-700">{nextAction.riskTip}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <p className="mb-2 text-xs text-slate-500">动作执行</p>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              const nextFeedback =
                nextAction.actionType === "人工接管"
                  ? "已标记人工接管。"
                  : nextAction.actionType === "确认后执行"
                    ? "已确认并标记待执行。"
                    : nextAction.actionType === "直接归档"
                      ? "已标记直接归档。"
                      : "已标记一键执行。";
              setFeedback(nextFeedback);
              onExecute(nextAction.actionType);
            }}
            className={buttonClassName}
          >
            {nextAction.actionType === "直接归档" ? (
              <Archive className="mr-1 h-4 w-4" />
            ) : (
              <Sparkles className="mr-1 h-4 w-4" />
            )}
            {nextAction.executeButtonLabel}
          </Button>
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
