import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";
import type { ConversationRoundViewModel } from "@/types/workbench-view-model";

interface ConversationTimelineCardProps {
  rounds: ConversationRoundViewModel[];
  stage: PageStage;
}

export function ConversationTimelineCard({
  rounds,
  stage,
}: ConversationTimelineCardProps) {
  const visible = hasReachedStage(stage, "monitoring");

  return (
    <SectionCard
      title="会话流"
      description="逐轮会话变化与关键轮次"
      tone="focus"
      className="min-h-[560px]"
    >
      {!visible ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          开始分析后展示逐轮会话变化。
        </div>
      ) : (
        <ScrollArea className="h-[520px] pr-2">
          <div className="space-y-3">
            {rounds.map((round, index) => {
              return (
                <div key={round.id} className="grid grid-cols-[16px_1fr] gap-2.5">
                  <div className="relative pt-1">
                    <span
                      className={cn(
                        "block h-2.5 w-2.5 rounded-full ring-4 ring-white",
                        round.isActive ? "bg-blue-500" : "bg-slate-300",
                      )}
                    />
                    {index < rounds.length - 1 ? (
                      <span className="absolute top-4 left-[4px] h-[calc(100%+6px)] w-px bg-slate-200" />
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl border border-slate-200/80 bg-slate-50/65 px-3.5 py-2.5",
                      round.isActive &&
                        "border-blue-200/90 bg-blue-50/65 shadow-[0_10px_20px_-14px_rgba(37,99,235,0.35)]",
                      !round.isReached && "opacity-60",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        {round.roundLabel} · {round.timestamp}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {round.isActive ? (
                          <StatusBadge label="当前轮次" tone="info" className="text-[10px]" />
                        ) : null}
                        {round.isKeyRound ? (
                          <StatusBadge label="关键轮次" tone="warning" className="text-[10px]" />
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
                        <p className="text-[11px] text-slate-500">客户发言</p>
                        <p className="mt-0.5 text-sm leading-6 text-slate-900">
                          {round.customerUtterance}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
                        <p className="text-[11px] text-slate-500">座席发言</p>
                        <p className="mt-0.5 text-sm leading-6 text-slate-900">
                          {round.agentUtterance}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                        <p className="text-[11px] text-slate-500">诉求变化</p>
                        <p className="mt-0.5 text-[13px] font-medium text-slate-800">
                          {round.demandDelta}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                        <p className="text-[11px] text-slate-500">情绪变化</p>
                        <p className="mt-0.5 text-[13px] font-medium text-slate-800">
                          {round.emotionDelta}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </SectionCard>
  );
}
