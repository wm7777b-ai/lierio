import { Activity, AlertTriangle, Siren } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import type { MonitoringState, ConversationTurn, PageStage } from "@/types/conversation";

interface LiveRecognitionSummaryCardProps {
  monitoring: MonitoringState;
  turns: ConversationTurn[];
  stage: PageStage;
  activeTurnIndex: number;
}

const buildTrack = (values: string[]) => {
  const result: string[] = [];
  values.forEach((value) => {
    if (result[result.length - 1] !== value) {
      result.push(value);
    }
  });
  return result;
};

export function LiveRecognitionSummaryCard({
  monitoring,
  turns,
  stage,
  activeTurnIndex,
}: LiveRecognitionSummaryCardProps) {
  const visible = hasReachedStage(stage, "monitoring");
  const trackTurns =
    activeTurnIndex >= 0 ? turns.slice(0, Math.min(activeTurnIndex + 1, turns.length)) : [];

  const emotionTrack = buildTrack(trackTurns.map((item) => item.recognition.emotion));
  const intentTrack = buildTrack(trackTurns.map((item) => item.recognition.intent));
  const riskTrack = buildTrack(
    trackTurns.map((item) =>
      item.recognition.risk === "低"
        ? "低风险"
        : item.recognition.risk === "中"
          ? "中风险"
          : "高风险",
    ),
  );

  if (!visible) {
    return (
      <SectionCard title="会中识别总结" description="实时识别状态" tone="focus">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          开始分析后展示会中主诉求、情绪、风险与变化轨迹。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="会中识别总结" description="实时识别状态" tone="active">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
          <p className="mb-1 text-xs text-slate-500">当前主诉求</p>
          <p className="text-sm font-semibold text-slate-900">{monitoring.currentIntent}</p>
        </div>
        <div
          className={
            monitoring.emotion === "高风险"
              ? "rounded-xl border border-rose-200/70 bg-rose-50/60 p-2.5"
              : monitoring.emotion === "激动"
                ? "rounded-xl border border-amber-200/70 bg-amber-50/50 p-2.5"
              : "rounded-xl border border-slate-200/80 bg-slate-50 p-2.5"
          }
        >
          <p className="mb-1 text-xs text-slate-500">当前情绪状态</p>
          <p
            className={
              monitoring.emotion === "高风险"
                ? "text-sm font-semibold text-rose-700"
                : monitoring.emotion === "激动"
                  ? "text-sm font-semibold text-amber-700"
                : "text-sm font-semibold text-slate-900"
            }
          >
            {monitoring.emotion}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
        <p className="text-xs font-semibold text-slate-600">当前风险等级/风险信号</p>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge
            label={monitoring.emotion === "高风险" ? "高风险" : "中风险预警"}
            tone={monitoring.emotion === "高风险" ? "danger" : "warning"}
            className="text-[10px]"
          />
          {monitoring.riskSignals.map((signal) => (
            <StatusBadge key={signal} label={signal} tone="neutral" className="text-[10px]" />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        <p className="mb-1 text-xs font-semibold text-slate-600">当前信息缺口</p>
        <p className="text-sm text-slate-700">{monitoring.missingInfo.join("、")}</p>
      </div>

      <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-2.5">
        <p className="text-xs font-semibold text-slate-700">识别变化轨迹</p>

        <div className="flex items-start gap-2 text-xs">
          <Activity className="mt-0.5 h-3.5 w-3.5 text-slate-500" />
          <div className="flex flex-wrap items-center gap-1.5">
            {intentTrack.map((item) => (
              <StatusBadge key={item} label={item} tone="intent" className="text-[10px]" />
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
          <div className="flex flex-wrap items-center gap-1.5">
            {emotionTrack.map((item) => (
              <StatusBadge
                key={item}
                label={item}
                tone={item === "高风险" ? "danger" : item === "不满" || item === "激动" ? "warning" : "neutral"}
                className="text-[10px]"
              />
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs">
          <Siren className="mt-0.5 h-3.5 w-3.5 text-rose-600" />
          <div className="flex flex-wrap items-center gap-1.5">
            {riskTrack.map((item) => (
              <StatusBadge
                key={item}
                label={item}
                tone={item === "高风险" ? "danger" : item === "中风险" ? "warning" : "neutral"}
                className="text-[10px]"
              />
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
