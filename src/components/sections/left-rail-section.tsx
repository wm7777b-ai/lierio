import { MOCK_SESSION } from "@/data/mock-session";

import { PanelCard } from "@/components/cards/panel-card";
import { Badge } from "@/components/ui/badge";

export function LeftRailSection() {
  return (
    <section className="space-y-4">
      <PanelCard title="会话信息" description="基础信息占位，后续接入实时会话流。">
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted-foreground">会话 ID</dt>
          <dd className="font-medium">{MOCK_SESSION.id}</dd>
          <dt className="text-muted-foreground">坐席</dt>
          <dd className="font-medium">{MOCK_SESSION.agentName}</dd>
          <dt className="text-muted-foreground">客户</dt>
          <dd className="font-medium">{MOCK_SESSION.customerName}</dd>
          <dt className="text-muted-foreground">开始时间</dt>
          <dd className="font-medium">{MOCK_SESSION.startTime}</dd>
        </dl>
      </PanelCard>

      <PanelCard title="风险与情绪" description="后续接入实时识别模型。">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">风险: {MOCK_SESSION.riskLevel}</Badge>
          <Badge variant="outline">情绪: {MOCK_SESSION.sentiment}</Badge>
          <Badge variant="outline">渠道: {MOCK_SESSION.channel}</Badge>
        </div>
      </PanelCard>
    </section>
  );
}
