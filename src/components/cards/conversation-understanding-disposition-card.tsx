"use client";

import { AlertTriangle, ChevronDown, ChevronUp, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import { Textarea } from "@/components/ui/textarea";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";
import type {
  InCallInsightSuggestionViewModel,
  PostDispositionViewModel,
} from "@/types/workbench-view-model";

interface ConversationUnderstandingDispositionCardProps {
  stage: PageStage;
  insight: InCallInsightSuggestionViewModel;
  disposition: PostDispositionViewModel;
  ticketTitle: string;
  onSummarySave: (value: string) => void;
  onCategorySave: (value: string) => void;
  onTicketTitleSave: (value: string) => void;
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
            className="min-h-[96px] rounded-lg border-slate-200 text-sm leading-6 text-slate-800"
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

export function ConversationUnderstandingDispositionCard({
  stage,
  insight,
  disposition,
  ticketTitle,
  onSummarySave,
  onCategorySave,
  onTicketTitleSave,
  onRiskNoteSave,
}: ConversationUnderstandingDispositionCardProps) {
  const visible = hasReachedStage(stage, "monitoring");
  const isPostSession = hasReachedStage(stage, "ready");
  const [inCallExpanded, setInCallExpanded] = useState(true);
  const [lastSavedField, setLastSavedField] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPostSession) {
      setInCallExpanded(false);
    }
  }, [isPostSession]);

  const markSaved = (fieldKey: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLastSavedField(fieldKey);
    timerRef.current = setTimeout(() => setLastSavedField(null), 1200);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const hasSuggestion = insight.promptStatus !== "无额外建议";
  const promptClassName =
    insight.promptStatus === "强烈建议关注"
      ? "text-rose-700"
      : insight.promptStatus === "存在轻度建议"
        ? "text-amber-700"
        : "text-slate-700";

  return (
    <SectionCard
      title="会话理解与处置"
      description="同一张卡承接会中理解与会后收口"
      tone={isPostSession ? "active" : "focus"}
      className={cn(disposition.weakDisplay && !isPostSession && "opacity-95")}
    >
      {!visible ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          开始分析后展示会话理解与处置。
        </div>
      ) : (
        <>
          <EditableField
            fieldKey="summary"
            label="会话摘要"
            value={insight.summary}
            placeholder="待生成会话摘要"
            multiline
            canEdit={isPostSession}
            lastSavedField={lastSavedField}
            onSave={onSummarySave}
            onSaved={markSaved}
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
            <button
              type="button"
              onClick={() => setInCallExpanded((value) => !value)}
              className="flex w-full items-center justify-between text-left"
            >
              <p className="text-xs font-semibold text-slate-700">会中识别与建议</p>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                {inCallExpanded ? "收起" : "展开"}
                {inCallExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </span>
            </button>

            {inCallExpanded ? (
              <div className="mt-2 space-y-2.5">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="mb-1 text-xs text-slate-500">当前诉求</p>
                    <p className="text-sm font-semibold text-slate-900">{insight.currentDemand}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="mb-1 text-xs text-slate-500">当前情绪</p>
                    <p className="text-sm font-semibold text-slate-900">{insight.currentEmotion}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                  <p className="mb-1 text-xs font-semibold text-slate-600">预计缺失信息</p>
                  <div className="space-y-1.5">
                    {insight.expectedMissingInfo.map((item) => (
                      <p key={item} className="inline-flex items-center gap-1 text-sm text-slate-700">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        {item}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                  <p className="mb-1 text-xs font-semibold text-slate-600">提示</p>
                  <p className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", promptClassName)}>
                    {insight.promptStatus !== "无额外建议" ? (
                      <AlertTriangle
                        className={cn(
                          "h-3.5 w-3.5",
                          insight.promptStatus === "强烈建议关注" ? "text-rose-600" : "text-amber-600",
                        )}
                      />
                    ) : null}
                    {insight.promptStatus}
                  </p>
                </div>

                {hasSuggestion ? (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                      <p className="mb-1 text-xs font-semibold text-slate-600">建议内容</p>
                      <div className="space-y-1.5">
                        {insight.suggestionContent.map((item) => (
                          <p key={item} className="text-sm text-slate-800">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                      <p className="mb-1 text-xs font-semibold text-slate-600">判断依据</p>
                      <p className="text-sm leading-6 text-slate-800">{insight.judgmentBasis}</p>
                      {insight.docLinks.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {insight.docLinks.map((doc) => (
                            <a
                              key={`${doc.label}:${doc.href}`}
                              href={doc.href}
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-600"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                              {doc.label}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {isPostSession ? (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white/95 p-2.5">
              <p className="text-xs font-semibold text-slate-700">会后收口字段</p>

              <EditableField
                fieldKey="archiveCategory"
                label="归档分类"
                value={disposition.archiveCategory}
                placeholder="待补充归档分类"
                canEdit
                lastSavedField={lastSavedField}
                onSave={onCategorySave}
                onSaved={markSaved}
              />

              <EditableField
                fieldKey="ticketTitle"
                label="建议标题"
                value={ticketTitle}
                placeholder="待生成建议标题"
                canEdit
                lastSavedField={lastSavedField}
                onSave={onTicketTitleSave}
                onSaved={markSaved}
              />

              <EditableField
                fieldKey="riskNote"
                label="风险点说明"
                value={disposition.riskNote}
                placeholder="待生成风险点说明"
                multiline
                canEdit
                lastSavedField={lastSavedField}
                onSave={onRiskNoteSave}
                onSaved={markSaved}
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <p className="mb-1 text-xs font-semibold text-slate-600">后续动作建议</p>
                <div className="space-y-1.5">
                  {disposition.followUpSuggestions.map((item) => (
                    <p key={item} className="text-sm text-slate-800">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </SectionCard>
  );
}
