"use client";

import { CheckCircle2, ClipboardCheck, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";
import type { PostDispositionViewModel } from "@/types/workbench-view-model";

interface PostDispositionCardProps {
  stage: PageStage;
  disposition: PostDispositionViewModel;
  onSummarySave: (value: string) => void;
  onCategorySave: (value: string) => void;
  onDraftSave: (value: string) => void;
  onRiskNoteSave: (value: string) => void;
}

interface EditableFieldProps {
  fieldKey: string;
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  canEdit: boolean;
  lastSavedField: string | null;
  onSave: (value: string) => void;
  onSaved: (fieldKey: string) => void;
}

function EditableField({
  fieldKey,
  label,
  value,
  placeholder,
  multiline,
  canEdit,
  lastSavedField,
  onSave,
  onSaved,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState("");

  const commitValue = () => {
    if (!canEdit) return;
    const next = draftValue.trim();
    if (next !== value) {
      onSave(next);
      onSaved(fieldKey);
    }
    setEditing(false);
  };

  if (editing && canEdit) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <p className="mb-1 text-xs text-slate-500">{label}</p>
        {multiline ? (
          <Textarea
            autoFocus
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={commitValue}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                commitValue();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setEditing(false);
              }
            }}
            className="min-h-[108px] rounded-lg border-slate-200 text-sm leading-6 text-slate-800"
            placeholder={placeholder}
          />
        ) : (
          <Input
            autoFocus
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={commitValue}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitValue();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setEditing(false);
              }
            }}
            className="h-10 rounded-lg border-slate-200 text-sm text-slate-800"
            placeholder={placeholder}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs text-slate-500">{label}</p>
        {lastSavedField === fieldKey ? (
          <span className="text-[11px] font-medium text-emerald-600">已修改</span>
        ) : null}
      </div>
      <button
        type="button"
        disabled={!canEdit}
        onClick={() => {
          if (!canEdit) return;
          setDraftValue(value);
          setEditing(true);
        }}
        className={cn(
          "w-full rounded-lg px-2 py-1.5 text-left transition-colors",
          canEdit ? "cursor-text hover:bg-slate-50" : "cursor-default",
        )}
      >
        <p className={cn("text-sm text-slate-900", multiline && "leading-6 whitespace-pre-wrap")}>
          {value || placeholder}
        </p>
      </button>
    </div>
  );
}

export function PostDispositionCard({
  stage,
  disposition,
  onSummarySave,
  onCategorySave,
  onDraftSave,
  onRiskNoteSave,
}: PostDispositionCardProps) {
  const visible = hasReachedStage(stage, "drafting");
  const [lastSavedField, setLastSavedField] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markSaved = (fieldKey: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLastSavedField(fieldKey);
    timerRef.current = setTimeout(() => setLastSavedField(null), 1300);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  if (!visible) {
    return (
      <SectionCard title="话后处置" description="会话结束后的收口草稿" tone="default">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          会话进行到后半程后，这里会生成话后处置草稿。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="话后处置"
      description="会话结束后的收口与归档建议"
      tone={disposition.isPrimary ? "active" : "focus"}
      className={cn(disposition.weakDisplay && "opacity-90")}
      headerExtra={
        <StatusBadge
          label={disposition.stageLabel}
          tone={disposition.isPrimary ? "success" : "info"}
        />
      }
    >
      <EditableField
        fieldKey="summary"
        label="话后总结"
        value={disposition.summary}
        placeholder="待生成话后总结"
        multiline
        canEdit={disposition.canEdit}
        lastSavedField={lastSavedField}
        onSave={onSummarySave}
        onSaved={markSaved}
      />

      <EditableField
        fieldKey="archiveCategory"
        label="归档分类"
        value={disposition.archiveCategory}
        placeholder="待补充归档分类"
        canEdit={disposition.canEdit}
        lastSavedField={lastSavedField}
        onSave={onCategorySave}
        onSaved={markSaved}
      />

      <EditableField
        fieldKey="dispositionDraft"
        label="处置草稿"
        value={disposition.dispositionDraft}
        placeholder="待补充处置草稿"
        multiline
        canEdit={disposition.canEdit}
        lastSavedField={lastSavedField}
        onSave={onDraftSave}
        onSaved={markSaved}
      />

      <EditableField
        fieldKey="riskNote"
        label="风险说明"
        value={disposition.riskNote}
        placeholder="待补充风险说明"
        multiline
        canEdit={disposition.canEdit}
        lastSavedField={lastSavedField}
        onSave={onRiskNoteSave}
        onSaved={markSaved}
      />

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <p className="mb-1 text-xs text-slate-500">后续动作建议</p>
        <div className="space-y-1.5">
          {disposition.followUpSuggestions.map((item) => (
            <p key={item} className="text-sm text-slate-800">
              {item}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Button
          variant="outline"
          disabled={!disposition.canEdit}
          className="h-9 rounded-xl border-slate-200 bg-white text-slate-700"
        >
          <ClipboardCheck className="mr-1 h-4 w-4" />
          处置草稿已核对
        </Button>
        {disposition.isPrimary ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            会话结束后已切换至主展示
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
            <ShieldAlert className="h-3.5 w-3.5" />
            会话结束后该模块将提升为主展示
          </span>
        )}
      </div>
    </SectionCard>
  );
}
