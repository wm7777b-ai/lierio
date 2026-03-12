"use client";

import { CheckCircle2 } from "lucide-react";

import { PanelCard } from "@/components/cards/panel-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MOCK_ACTION_SUGGESTIONS } from "@/data/mock-session";
import { useWorkspaceStore } from "@/store/workspace-store";

export function RightActionSection() {
  const selectedSuggestionId = useWorkspaceStore((state) => state.selectedSuggestionId);
  const setSelectedSuggestionId = useWorkspaceStore((state) => state.setSelectedSuggestionId);

  return (
    <section className="space-y-4">
      <PanelCard title="处置决策区" description="突出可操作性，后续接入 SOP 和规则引擎。">
        <div className="space-y-3">
          {MOCK_ACTION_SUGGESTIONS.map((item) => {
            const isActive = selectedSuggestionId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedSuggestionId(item.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <Badge variant="secondary">{item.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">{item.sopCode}</p>
              </button>
            );
          })}
        </div>

        <Separator className="my-4" />

        <Button className="w-full rounded-xl">
          <CheckCircle2 className="mr-1 h-4 w-4" />
          确认并提交处置结果
        </Button>
      </PanelCard>
    </section>
  );
}
