import { AlertTriangle, BellRing, ShieldAlert } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";
import type { InCallSuggestionViewModel } from "@/types/workbench-view-model";

interface InCallSuggestionCardProps {
  stage: PageStage;
  suggestion: InCallSuggestionViewModel;
}

const typeToneMap: Record<
  InCallSuggestionViewModel["suggestionType"],
  "neutral" | "warning" | "danger"
> = {
  静默更新: "neutral",
  轻提示: "warning",
  强提示: "danger",
};

export function InCallSuggestionCard({
  stage,
  suggestion,
}: InCallSuggestionCardProps) {
  const visible = hasReachedStage(stage, "monitoring");

  if (!visible) {
    return (
      <SectionCard title="话中建议" description="仅在关键时刻提醒座席" tone="default">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          开始分析后，系统将按会话变化给出话中建议。
        </div>
      </SectionCard>
    );
  }

  const isStrong = suggestion.suggestionType === "强提示";
  const isLight = suggestion.suggestionType === "轻提示";

  return (
    <SectionCard
      title="话中建议"
      description="仅在值得提醒时出现"
      tone={isStrong ? "active" : isLight ? "focus" : "default"}
      headerExtra={
        <StatusBadge
          label={suggestion.suggestionType}
          tone={typeToneMap[suggestion.suggestionType]}
        />
      }
      className={cn(
        suggestion.weakDisplay && "opacity-90",
      )}
    >
      <div
        className={cn(
          "rounded-xl border px-3 py-2",
          isStrong
            ? "border-rose-200 bg-rose-50/75"
            : isLight
              ? "border-amber-200 bg-amber-50/55"
              : "border-slate-200 bg-slate-50/70",
        )}
      >
        <p className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          {isStrong ? (
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
          ) : isLight ? (
            <BellRing className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />
          )}
          建议类型：{suggestion.suggestionType}
        </p>
        <p className="mt-1 text-sm text-slate-800">{suggestion.triggerReason}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">当前建议处置方式</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {suggestion.handlingAdvice}
        </p>
      </div>

      <div
        className={cn(
          "rounded-xl border px-3 py-2",
          suggestion.needImmediateAction
            ? "border-rose-200 bg-rose-50/70"
            : "border-slate-200 bg-slate-50/70",
        )}
      >
        <p className="text-xs text-slate-500">是否需座席当下处理</p>
        <p
          className={cn(
            "mt-1 text-sm font-semibold",
            suggestion.needImmediateAction ? "text-rose-700" : "text-slate-700",
          )}
        >
          {suggestion.needImmediateAction ? "需座席当下处理" : "暂不需要当下处理"}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="mb-1 text-xs text-slate-500">建议内容</p>
        <div className="space-y-1.5">
          {suggestion.suggestions.map((item) => (
            <p key={item} className="text-sm text-slate-800">
              {item}
            </p>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
