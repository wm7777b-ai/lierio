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
  currentTurnIndex: number;
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
      <div className="rounded-xl border border-slate-200/45 bg-slate-50/35 p-2">
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
            className="min-h-[96px] rounded-xl border-slate-200/55 bg-slate-50/35 text-sm leading-6 text-slate-800 shadow-none focus-visible:border-slate-300/70 focus-visible:ring-slate-200/55"
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
            className="h-10 rounded-xl border-slate-200/55 bg-slate-50/35 text-sm text-slate-800 shadow-none focus-visible:border-slate-300/70 focus-visible:ring-slate-200/55"
            placeholder={placeholder}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/45 bg-slate-50/35 p-2">
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
          canEdit ? "cursor-text hover:bg-white/55" : "cursor-default",
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
  currentTurnIndex,
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
  const [postDispositionExpanded, setPostDispositionExpanded] = useState(true);
  const [lastSavedField, setLastSavedField] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPostSession) {
      setInCallExpanded(false);
      setPostDispositionExpanded(true);
    } else {
      setPostDispositionExpanded(false);
    }
    if (!isPostSession && currentTurnIndex >= 0) {
      setInCallExpanded(true);
    }
  }, [currentTurnIndex, isPostSession]);

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
  const phaseLabel =
    stage === "submitted"
      ? "已完成"
      : isPostSession
        ? "话后归档"
        : "话中处理";
  const phaseHint =
    stage === "idle"
      ? "等待开始分析后生成识别结果和处置建议。"
      : stage === "submitted"
        ? "当前结果已提交，页面重点切换到后续处置和沉淀结果。"
        : isPostSession
          ? "系统已形成话后总结，建议快速核对摘要、归档分类和风险点说明。"
          : insight.promptStatus === "强烈建议关注"
            ? "当前会话存在强提醒，建议座席优先处理风险或投诉升级信号。"
            : insight.promptStatus === "存在轻度建议"
              ? "系统已给出轻度建议，适合边通话边补问关键缺失信息。"
              : "当前以静默识别为主，系统会持续帮助归纳重点并准备话后总结。";
  const phaseToneClass =
    stage === "submitted"
      ? "border-emerald-200/80 bg-emerald-50/45"
      : isPostSession
        ? "border-blue-200/80 bg-blue-50/45"
        : insight.promptStatus === "强烈建议关注"
          ? "border-rose-200/80 bg-rose-50/45"
          : "border-slate-200/80 bg-slate-50/75";

  return (
    <SectionCard
      title="会话理解与处置"
      description="同一张卡承接话中理解与话后归档"
      tone={isPostSession ? "active" : "focus"}
      className={cn(disposition.weakDisplay && !isPostSession && "opacity-95")}
    >
      {!visible ? (
        <div className="rounded-2xl border border-dashed border-slate-200/70 bg-slate-50/45 px-4 py-6 text-sm text-slate-600">
          开始分析后展示会话理解与处置。
        </div>
      ) : (
        <>
          <div className={cn("rounded-2xl border px-3 py-2", phaseToneClass)}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200/80">
                {phaseLabel}
              </span>
              <span className="text-[11px] text-slate-500">
                {phaseHint}
              </span>
            </div>
          </div>

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

          <div className="rounded-xl border border-slate-200/45 bg-slate-50/35 p-2.5">
            <button
              type="button"
              onClick={() => setInCallExpanded((value) => !value)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-700">话中识别与建议</p>
                <span className={cn("text-[11px] font-medium", promptClassName)}>
                  {insight.promptStatus}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                {inCallExpanded ? "收起" : "展开"}
                {inCallExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </span>
            </button>

            {inCallExpanded ? (
              <div className="mt-2 space-y-2.5">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200/45 bg-slate-50/30 p-2.5">
                    <p className="mb-1 text-xs text-slate-500">当前诉求</p>
                    <p className="text-sm font-semibold text-slate-900">{insight.currentDemand}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/45 bg-slate-50/30 p-2.5">
                    <p className="mb-1 text-xs text-slate-500">当前情绪</p>
                    <p className="text-sm font-semibold text-slate-900">{insight.currentEmotion}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/45 bg-slate-50/30 p-2.5">
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

                <div className="rounded-xl border border-slate-200/45 bg-slate-50/30 p-2.5">
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
                    <div className="rounded-xl border border-slate-200/45 bg-slate-50/30 p-2.5">
                      <p className="mb-1 text-xs font-semibold text-slate-600">建议内容</p>
                      <div className="space-y-1.5">
                        {insight.suggestionContent.map((item) => (
                          <p key={item} className="text-sm text-slate-800">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/45 bg-slate-50/30 p-2.5">
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
            <div className="space-y-2 rounded-xl border border-slate-200/45 bg-slate-50/25 p-2.5">
              <button
                type="button"
                onClick={() => setPostDispositionExpanded((value) => !value)}
                className="flex w-full items-center justify-between text-left"
              >
                <p className="text-xs font-semibold text-slate-700">话后归档</p>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  {postDispositionExpanded ? "收起" : "展开"}
                  {postDispositionExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>

              {postDispositionExpanded ? (
                <>
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

                  <div className="rounded-xl border border-slate-200/45 bg-slate-50/35 p-2.5">
                    <p className="mb-1 text-xs font-semibold text-slate-600">后续动作建议</p>
                    <div className="space-y-1.5">
                      {disposition.followUpSuggestions.map((item) => (
                        <p key={item} className="text-sm text-slate-800">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </SectionCard>
  );
}
