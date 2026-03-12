import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { ConversationTurn, PageStage } from "@/types/conversation";

interface ConversationTimelineCardProps {
  turns: ConversationTurn[];
  stage: PageStage;
  activeTurnIndex: number;
}

export function ConversationTimelineCard({
  turns,
  stage,
  activeTurnIndex,
}: ConversationTimelineCardProps) {
  const activeIndex = Math.max(-1, Math.min(activeTurnIndex, turns.length - 1));
  const visible = hasReachedStage(stage, "monitoring");

  return (
    <SectionCard title="会话流主区" description="识别变化证据链" tone="focus" className="min-h-[560px]">
      {!visible ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          开始分析后展示 5 轮会话与识别变化。
        </div>
      ) : (
        <ScrollArea className="h-[520px] pr-2">
          <div className="space-y-3">
            {turns.map((turn, index) => {
              const isActive = index === activeIndex;
              const isReached = index <= activeIndex;
              const emotionTone =
                turn.recognition.emotion === "高风险"
                  ? "danger"
                  : turn.recognition.emotion === "不满" || turn.recognition.emotion === "激动"
                    ? "warning"
                    : "neutral";
              const riskTone =
                turn.recognition.risk === "高"
                  ? "danger"
                  : turn.recognition.risk === "中"
                    ? "warning"
                    : "neutral";

              return (
                <div key={turn.id} className="grid grid-cols-[16px_1fr] gap-2.5">
                  <div className="relative pt-1">
                    <span
                      className={cn(
                        "block h-2.5 w-2.5 rounded-full ring-4 ring-white",
                        isActive ? "bg-blue-500" : "bg-slate-300",
                      )}
                    />
                    {index < turns.length - 1 ? (
                      <span className="absolute top-4 left-[4px] h-[calc(100%+6px)] w-px bg-slate-200" />
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl border border-slate-200/80 bg-slate-50/65 px-3.5 py-2.5",
                      isActive && "border-blue-200/90 bg-blue-50/65 shadow-[0_10px_20px_-14px_rgba(37,99,235,0.35)]",
                      !isReached && "opacity-60",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">{turn.time}</span>
                      <div className="flex items-center gap-1.5">
                        {isActive ? <StatusBadge label="当前轮次" tone="info" className="text-[10px]" /> : null}
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px]",
                            turn.speaker === "客户" ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-700",
                          )}
                        >
                          {turn.speaker}
                        </span>
                      </div>
                    </div>

                    <p
                      className={cn(
                        "text-sm leading-6 text-slate-800",
                        turn.highlight && "font-semibold text-slate-900",
                      )}
                    >
                      {turn.text}
                    </p>

                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <StatusBadge label={`意图：${turn.recognition.intent}`} tone="intent" className="text-[10px]" />
                      <StatusBadge label={`情绪：${turn.recognition.emotion}`} tone={emotionTone} className="text-[10px]" />
                      <StatusBadge label={`风险：${turn.recognition.risk}`} tone={riskTone} className="text-[10px]" />
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
