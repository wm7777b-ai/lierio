import { AlertTriangle, Link2 } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";
import type { InCallInsightSuggestionViewModel } from "@/types/workbench-view-model";

interface InCallInsightSuggestionCardProps {
  stage: PageStage;
  insight: InCallInsightSuggestionViewModel;
}

export function InCallInsightSuggestionCard({
  stage,
  insight,
}: InCallInsightSuggestionCardProps) {
  const visible = hasReachedStage(stage, "monitoring");
  const hasSuggestion = insight.promptStatus !== "无额外建议";

  const promptClassName =
    insight.promptStatus === "强烈建议关注"
      ? "text-rose-700"
      : insight.promptStatus === "存在轻度建议"
        ? "text-amber-700"
        : "text-slate-700";

  return (
    <SectionCard
      title="话中识别与建议"
      description="话中识别结果与当前建议"
      tone="active"
      className={cn(insight.weakDisplay && "opacity-95")}
    >
      {!visible ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          开始分析后展示话中识别与建议。
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <p className="mb-1 text-xs font-semibold text-slate-600">会话摘要</p>
            <p className="text-sm leading-6 text-slate-900">{insight.summary}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <p className="mb-1 text-xs text-slate-500">当前诉求</p>
              <p className="text-sm font-semibold text-slate-900">{insight.currentDemand}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <p className="mb-1 text-xs text-slate-500">当前情绪</p>
              <p className="text-sm font-semibold text-slate-900">{insight.currentEmotion}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <p className="mb-1 text-xs font-semibold text-slate-600">预计缺失信息</p>
            <div className="space-y-1.5">
              {insight.expectedMissingInfo.map((item) => (
                <p key={item} className="inline-flex items-center gap-1 text-sm text-slate-700">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <p className="mb-1 text-xs font-semibold text-slate-600">提示</p>
            <p className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", promptClassName)}>
              {insight.promptStatus !== "无额外建议" ? (
                <AlertTriangle
                  className={cn(
                    "h-3.5 w-3.5",
                    insight.promptStatus === "强烈建议关注" ? "text-rose-600" : "text-amber-600",
                  )}
                />
              ) : null}
              {insight.promptStatus}
            </p>
          </div>

          {hasSuggestion ? (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                <p className="mb-1 text-xs font-semibold text-slate-600">建议内容</p>
                <div className="space-y-1.5">
                  {insight.suggestionContent.map((item) => (
                    <p key={item} className="text-sm text-slate-800">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <p className="mb-1 text-xs font-semibold text-slate-600">判断依据</p>
                <p className="text-sm leading-6 text-slate-800">{insight.judgmentBasis}</p>
                {insight.docLinks.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {insight.docLinks.map((doc) => (
                      <a
                        key={`${doc.label}:${doc.href}`}
                        href={doc.href}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-600"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {doc.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-600">
              当前无额外建议。
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}
