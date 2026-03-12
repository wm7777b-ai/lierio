import { InfoField } from "@/components/ui/info-field";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ConversationMeta } from "@/types/conversation";

interface ConversationMetaCardProps {
  meta: ConversationMeta;
}

const getStatusTone = (status: string) => {
  if (status.includes("提交")) return "success" as const;
  if (status.includes("待人工确认")) return "warning" as const;
  if (status.includes("监测") || status.includes("生成") || status.includes("评估")) return "info" as const;
  return "neutral" as const;
};

export function ConversationMetaCard({ meta }: ConversationMetaCardProps) {
  const userTags = [meta.customerTags[0], meta.historyTags[0]].filter(Boolean) as string[];

  return (
    <SectionCard
      title="会话状态"
      description="当前处理会话"
      tone="default"
      headerExtra={<StatusBadge label={meta.currentStatus} tone={getStatusTone(meta.currentStatus)} />}
    >
      <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_1.2fr]">
        <InfoField label="会话ID" value={meta.id} strong className="grid-cols-[56px_1fr]" />
        <InfoField label="渠道" value={meta.channel} className="grid-cols-[40px_1fr]" />
        <div className="grid grid-cols-[56px_1fr] items-start gap-2">
          <p className="pt-0.5 text-xs font-semibold text-slate-500">用户标签</p>
          <div className="flex flex-wrap gap-1.5">
            {userTags.map((tag) => (
              <StatusBadge key={tag} label={tag} tone="warning" className="px-2 py-0.5 text-[10px]" />
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
