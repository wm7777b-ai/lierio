import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage, ReviewState } from "@/types/conversation";

interface QualityCardProps {
  review: ReviewState;
  stage: PageStage;
}

const getScoreWidthClass = (score: number) => {
  if (score >= 90) return "w-[90%]";
  if (score >= 80) return "w-[80%]";
  if (score >= 70) return "w-[70%]";
  if (score >= 60) return "w-[60%]";
  return "w-[45%]";
};

export function QualityCard({ review, stage }: QualityCardProps) {
  const visible = hasReachedStage(stage, "reviewing");

  if (!visible) {
    return (
      <SectionCard title="质量评估" description="置信度与回流建议" tone="default">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          reviewing 阶段将填充综合评分、置信度与回流建议。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="质量评估"
      description="置信度与回流建议"
      tone={stage === "reviewing" ? "active" : "default"}
      headerExtra={
        <StatusBadge
          label={`置信度：${review.confidence}`}
          tone={review.confidence === "高" ? "success" : review.confidence === "中" ? "warning" : "danger"}
        />
      }
    >
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>综合评分</span>
          <span className="font-semibold text-slate-800">{review.score}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className={cn(
              "h-2 rounded-full",
              getScoreWidthClass(review.score),
              review.score >= 80
                ? "bg-emerald-500"
                : review.score >= 70
                  ? "bg-amber-500"
                  : "bg-rose-500",
            )}
          />
        </div>
      </div>

      <div
        className={cn(
          "rounded-2xl border p-3 text-sm",
          review.shouldFallback
            ? "border-rose-200 bg-rose-50/70 text-rose-700"
            : "border-emerald-200 bg-emerald-50/70 text-emerald-700",
        )}
      >
        <p className="font-semibold">{review.shouldFallback ? "建议回流" : "无需回流"}</p>
        <p className="mt-1 leading-6">{review.fallbackReason}</p>
      </div>
    </SectionCard>
  );
}
