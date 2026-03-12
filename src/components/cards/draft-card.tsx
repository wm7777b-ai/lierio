"use client";

import { CheckCircle2, FilePenLine, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { DraftState, PageStage } from "@/types/conversation";

interface DraftCardProps {
  draft: DraftState;
  stage: PageStage;
  caseDetail: string;
  customerDemand: string;
  customerPainPoint: string;
  riskPoint: string;
  ticketTitle: string;
  onCaseDetailSave: (value: string) => void;
  onCustomerDemandSave: (value: string) => void;
  onCustomerPainPointSave: (value: string) => void;
  onRiskPointSave: (value: string) => void;
  onTicketTitleSave: (value: string) => void;
}

interface EditableFieldProps {
  fieldKey: string;
  label: string;
  value: string;
  multiline?: boolean;
  canEdit: boolean;
  placeholder?: string;
  helper?: string;
  highlight?: boolean;
  lastSavedField: string | null;
  onSave: (value: string) => void;
  onSaved: (field: string) => void;
}

function EditableField({
  fieldKey,
  label,
  value,
  multiline,
  canEdit,
  placeholder,
  helper,
  highlight,
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

  const cancelEditing = () => {
    setDraftValue(value);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-2.5",
        highlight && "border-amber-200/70 bg-amber-50/50",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <p className={cn("text-xs font-medium text-slate-500", highlight && "text-amber-700")}>
          {label}
        </p>
        {lastSavedField === fieldKey ? (
          <span className="text-[11px] font-medium text-emerald-600">已更新</span>
        ) : null}
      </div>

      {editing && canEdit ? (
        multiline ? (
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
                cancelEditing();
              }
            }}
            className="min-h-[150px] rounded-xl border-slate-200 bg-white text-sm leading-7 text-slate-800"
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
                cancelEditing();
              }
            }}
            className="h-10 rounded-xl border-slate-200 bg-white text-sm text-slate-800"
            placeholder={placeholder}
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!canEdit) return;
            setDraftValue(value);
            setEditing(true);
          }}
          className={cn(
            "w-full rounded-xl text-left transition-colors",
            canEdit && "cursor-text hover:bg-slate-50/80",
            multiline ? "px-2 py-2" : "px-2 py-1.5",
          )}
          disabled={!canEdit}
        >
          <p
            className={cn(
              "text-sm text-slate-800",
              multiline && "leading-7 whitespace-pre-wrap",
              !value && "text-slate-400",
            )}
          >
            {value || placeholder}
          </p>
        </button>
      )}

      {helper ? (
        <p className="mt-1.5 text-[11px] text-slate-500">{helper}</p>
      ) : null}
    </div>
  );
}

const getDraftStatusLabel = (stage: PageStage) => {
  if (stage === "idle") return "待生成";
  if (stage === "drafting") return "生成中";
  if (stage === "ready") return "可编辑";
  if (stage === "submitted") return "已确认";
  return "AI草稿";
};

const getDraftStatusTone = (stage: PageStage) => {
  if (stage === "submitted") return "success" as const;
  if (stage === "ready") return "warning" as const;
  if (stage === "drafting" || stage === "monitoring") return "info" as const;
  return "neutral" as const;
};

export function DraftCard({
  draft,
  stage,
  caseDetail,
  customerDemand,
  customerPainPoint,
  riskPoint,
  ticketTitle,
  onCaseDetailSave,
  onCustomerDemandSave,
  onCustomerPainPointSave,
  onRiskPointSave,
  onTicketTitleSave,
}: DraftCardProps) {
  const visible = hasReachedStage(stage, "drafting");
  const canEdit = stage === "ready";
  const [lastSavedField, setLastSavedField] = useState<string | null>(null);
  const [draftMarked, setDraftMarked] = useState(false);
  const fieldSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFieldSaved = (field: string) => {
    if (fieldSavedTimerRef.current) clearTimeout(fieldSavedTimerRef.current);
    setLastSavedField(field);
    fieldSavedTimerRef.current = setTimeout(() => {
      setLastSavedField(null);
    }, 1300);
  };

  useEffect(
    () => () => {
      if (fieldSavedTimerRef.current) clearTimeout(fieldSavedTimerRef.current);
      if (markDoneTimerRef.current) clearTimeout(markDoneTimerRef.current);
    },
    [],
  );

  if (!visible) {
      return (
        <SectionCard
          title="AI生成处置草稿区"
          description="生成中..."
          tone="focus"
          className="min-h-[700px]"
          headerExtra={<StatusBadge label="待生成" tone="neutral" />}
        >
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
            进入草稿生成阶段后，这里会生成案件详情、客户诉求、风险点与建议工单标题。
          </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="AI生成处置草稿区"
      description="AI生成并支持人工直接修正"
      tone={stage === "drafting" ? "active" : stage === "submitted" ? "stable" : "focus"}
      className="min-h-[700px]"
      headerExtra={
        <StatusBadge label={getDraftStatusLabel(stage)} tone={getDraftStatusTone(stage)} />
      }
    >
      {stage === "submitted" ? (
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-700">
          当前草稿已提交并沉淀为正式处置结果。
        </div>
      ) : null}

      {!canEdit && stage !== "submitted" ? (
        <p className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          待进入人工处理阶段后，可点击字段直接编辑。
        </p>
      ) : null}

      <EditableField
        fieldKey="caseDetail"
        label="案件详情"
        value={caseDetail || draft.caseDetail}
        multiline
        canEdit={canEdit}
        placeholder="请补充案件详情"
        helper="点击进入编辑；失焦自动保存；Ctrl/Cmd + Enter 快捷保存。"
        lastSavedField={lastSavedField}
        onSave={onCaseDetailSave}
        onSaved={handleFieldSaved}
      />

      <div className="grid gap-2.5 sm:grid-cols-2">
        <EditableField
          fieldKey="customerDemand"
          label="客户诉求"
          value={customerDemand || draft.customerDemand}
          canEdit={canEdit}
          placeholder="请填写客户诉求"
          lastSavedField={lastSavedField}
          onSave={onCustomerDemandSave}
          onSaved={handleFieldSaved}
        />
        <EditableField
          fieldKey="customerPainPoint"
          label="客户诉点"
          value={customerPainPoint || draft.customerPainPoint}
          canEdit={canEdit}
          placeholder="请填写客户诉点"
          lastSavedField={lastSavedField}
          onSave={onCustomerPainPointSave}
          onSaved={handleFieldSaved}
        />
        <EditableField
          fieldKey="riskPoint"
          label="风险点"
          value={riskPoint || draft.riskPoint}
          canEdit={canEdit}
          highlight
          placeholder="请填写风险点"
          lastSavedField={lastSavedField}
          onSave={onRiskPointSave}
          onSaved={handleFieldSaved}
        />
        <EditableField
          fieldKey="ticketTitle"
          label="建议工单标题"
          value={ticketTitle || draft.suggestedTicketTitle}
          canEdit={canEdit}
          placeholder="请填写建议工单标题"
          lastSavedField={lastSavedField}
          onSave={onTicketTitleSave}
          onSaved={handleFieldSaved}
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5">
        <p className="mb-2 text-xs font-medium text-slate-500">编辑动作</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canEdit}
            onClick={() => {
              if (!canEdit) return;
              setDraftMarked(true);
              if (markDoneTimerRef.current) clearTimeout(markDoneTimerRef.current);
              markDoneTimerRef.current = setTimeout(() => {
                setDraftMarked(false);
              }, 1400);
            }}
            className="h-9 rounded-xl border-slate-200 bg-white text-slate-700"
          >
            <FilePenLine className="mr-1 h-4 w-4" />
            修改完成
          </Button>
          {draftMarked ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              已更新
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              最终处置动作在右侧“审查与处置”执行。
            </span>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
