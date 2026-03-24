"use client";

import { useEffect, useRef } from "react";

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
  onSelectRound: (turnIndex: number) => void;
}

export function ConversationTimelineCard({
  rounds,
  stage,
  onSelectRound,
}: ConversationTimelineCardProps) {
  const visible = hasReachedStage(stage, "monitoring");
  const reachedCount = rounds.filter((item) => item.isReached).length;
  const scrollAreaHostRef = useRef<HTMLDivElement | null>(null);
  const activeRoundRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = scrollAreaHostRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLDivElement | null;
    const activeRoundElement = activeRoundRef.current;

    if (!viewport || !activeRoundElement) return;

    const viewportRect = viewport.getBoundingClientRect();
    const activeRect = activeRoundElement.getBoundingClientRect();
    const padding = 16;
    const isAbove = activeRect.top < viewportRect.top + padding;
    const isBelow = activeRect.bottom > viewportRect.bottom - padding;

    if (!isAbove && !isBelow) return;

    const activeTop =
      activeRect.top - viewportRect.top + viewport.scrollTop;
    const targetTop = Math.max(
      0,
      activeTop - viewport.clientHeight / 2 + activeRoundElement.clientHeight / 2,
    );

    viewport.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  }, [rounds]);

  const getEmotionToneClass = (emotion: string) => {
    if (emotion.includes("愤怒")) return "text-red-600";
    if (emotion.includes("激动")) return "text-amber-600";
    return "text-black";
  };

  return (
    <SectionCard
      title="会话流"
      description="逐轮对话与当轮状态"
      tone="focus"
      className="min-h-[560px]"
      headerExtra={
        visible ? (
          <StatusBadge
            label={`已推进 ${reachedCount} / ${rounds.length}`}
            tone="neutral"
          />
        ) : null
      }
    >
      {!visible ? (
        <div className="rounded-2xl border border-dashed border-slate-200/70 bg-slate-50/45 px-4 py-8 text-sm text-slate-500">
          开始分析后展示逐轮会话变化。
        </div>
      ) : (
        <div ref={scrollAreaHostRef}>
          <ScrollArea className="h-[520px] pr-2">
            <div className="space-y-3">
            {rounds.map((round, index) => {
              return (
                <div
                  key={round.id}
                  ref={round.isActive ? activeRoundRef : null}
                  className="grid grid-cols-[16px_1fr] gap-2.5"
                >
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

                  <button
                    type="button"
                    onClick={() => onSelectRound(index)}
                    className={cn(
                      "w-full rounded-2xl border border-slate-200/55 bg-white/55 px-3.5 py-2.5 text-left transition-colors hover:border-slate-300/70 hover:bg-white/75",
                      round.isActive &&
                        "border-blue-200/70 bg-blue-50/45 shadow-[0_8px_16px_-16px_rgba(37,99,235,0.18)]",
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
                      <p className="text-sm leading-6 text-slate-900">
                        <span className="mr-1.5 font-semibold text-slate-500">客户：</span>
                        {round.customerUtterance}
                      </p>
                      <p className="text-sm leading-6 text-slate-900">
                        <span className="mr-1.5 font-semibold text-slate-500">座席：</span>
                        {round.agentUtterance}
                      </p>
                    </div>

                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200/55 bg-slate-50/45 px-2.5 py-1.5">
                        <p className="text-[11px] text-slate-500">当轮诉求</p>
                        <p className="mt-0.5 text-[13px] font-medium text-slate-800">
                          {round.demandDelta}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200/55 bg-slate-50/45 px-2.5 py-1.5">
                        <p className="text-[11px] text-slate-500">当轮情绪</p>
                        <p
                          className={cn(
                            "mt-0.5 text-[13px] font-semibold",
                            getEmotionToneClass(round.emotionDelta),
                          )}
                        >
                          {round.emotionDelta}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
            </div>
          </ScrollArea>
        </div>
      )}
    </SectionCard>
  );
}
