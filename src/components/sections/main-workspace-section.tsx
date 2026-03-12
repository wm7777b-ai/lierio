"use client";

import { PanelCard } from "@/components/cards/panel-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/store/workspace-store";

export function MainWorkspaceSection() {
  const activeTab = useWorkspaceStore((state) => state.activeTab);
  const draftSummary = useWorkspaceStore((state) => state.draftSummary);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);
  const setDraftSummary = useWorkspaceStore((state) => state.setDraftSummary);

  return (
    <section className="space-y-4">
      <PanelCard
        title="主工作区"
        description="本阶段仅保留结构与状态流占位，不实现复杂业务逻辑。"
        className="min-h-[560px]"
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "conversation" | "insight" | "decision")}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversation">会话理解</TabsTrigger>
            <TabsTrigger value="insight">诉求洞察</TabsTrigger>
            <TabsTrigger value="decision">处置建议</TabsTrigger>
          </TabsList>

          <TabsContent value="conversation" className="space-y-3">
            <p className="text-sm text-muted-foreground">会话实时转写、关键词和时序信息将在后续阶段接入。</p>
            <Textarea
              value={draftSummary}
              onChange={(event) => setDraftSummary(event.target.value)}
              className="min-h-[220px]"
              placeholder="摘要草稿占位：后续在这里进行 AI 辅助生成与人工编辑。"
            />
          </TabsContent>

          <TabsContent value="insight" className="space-y-3">
            <p className="text-sm text-muted-foreground">诉求分类、风险标签与情绪趋势模块待接入。</p>
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Insight 模块占位
            </div>
          </TabsContent>

          <TabsContent value="decision" className="space-y-3">
            <p className="text-sm text-muted-foreground">SOP 匹配、建议置信度和执行动作将在第1阶段后逐步接入。</p>
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Decision 模块占位
            </div>
          </TabsContent>
        </Tabs>
      </PanelCard>
    </section>
  );
}
