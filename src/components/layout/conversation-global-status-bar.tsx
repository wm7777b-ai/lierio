"use client";

import { buildBasicInfoViewModel } from "@/adapters/workbench-adapter";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/store/useConversationStore";

interface FieldValueProps {
  value: string;
  className?: string;
  forceHoverPanel?: boolean;
}

interface HoverRevealTextProps {
  value: string;
  className?: string;
  forceHoverPanel?: boolean;
}

function HoverRevealText({
  value,
  className,
  forceHoverPanel,
}: HoverRevealTextProps) {
  const safeValue = value?.trim() ? value : "-";
  const enableHoverPanel = Boolean(forceHoverPanel) || safeValue.length > 12;

  return (
    <div className="group relative">
      <p
        className={cn(
          "mt-0.5 block max-w-full truncate text-sm font-medium text-slate-800",
          className,
        )}
      >
        {safeValue}
      </p>
      {enableHoverPanel ? (
        <div className="pointer-events-none invisible absolute top-[calc(100%+6px)] left-0 z-30 w-max max-w-[360px] rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
          {safeValue}
        </div>
      ) : null}
    </div>
  );
}

function FieldValue({ value, className, forceHoverPanel }: FieldValueProps) {
  const safeValue = value?.trim() ? value : "-";

  return (
    <HoverRevealText
      value={safeValue}
      className={className}
      forceHoverPanel={forceHoverPanel}
    />
  );
}

export function ConversationGlobalStatusBar() {
  const activeCaseId = useConversationStore((state) => state.activeCaseId);
  const meta = useConversationStore((state) => state.conversationMeta);
  const basicInfo = buildBasicInfoViewModel({
    activeCaseId,
    conversationMeta: meta,
  });
  const userTags = basicInfo.userTags.join(" / ");
  const historyRiskTags = basicInfo.historyRiskTags.join(" / ");
  const history = basicInfo.historyConsultation;

  return (
    <section className="mx-auto mt-4 w-full max-w-[1720px] px-5">
      <div className="rounded-3xl border border-slate-200/75 bg-white/90 px-4 py-3 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)] backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            用户基本信息
          </p>
          {basicInfo.customerType ? (
            <p className="text-xs text-slate-500">
              客户类型：
              <span className="font-medium text-slate-700" title={basicInfo.customerType}>
                {basicInfo.customerType}
              </span>
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-3 py-2.5">
          <p className="mb-2 text-xs font-semibold text-slate-600">当前接入信息</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
            <div>
              <p className="text-[11px] font-normal text-slate-500">手机号/UID</p>
              <FieldValue value={basicInfo.uidOrPhone} className="font-semibold text-slate-900" />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">会话ID</p>
              <FieldValue value={basicInfo.sessionId} className="font-semibold text-slate-900" />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">渠道</p>
              <FieldValue value={basicInfo.channel} />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">用户标签</p>
              <FieldValue
                value={userTags || "无"}
                className="max-w-[180px]"
                forceHoverPanel
              />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">接入时间</p>
              <FieldValue value={basicInfo.accessTime} />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">队列</p>
              <FieldValue value={basicInfo.queue} />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">通话时长</p>
              <FieldValue value={basicInfo.callDuration} />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">设备信息 / 故障报码</p>
              <FieldValue
                value={`${basicInfo.deviceInfo || "设备信息待同步"} / ${
                  basicInfo.deviceFaultCode || "待回传"
                }`}
                className="text-slate-700"
              />
            </div>
          </div>

          {historyRiskTags ? (
            <div className="mt-2">
              <HoverRevealText
                value={`历史风险标签：${historyRiskTags}`}
                className="text-[11px] text-slate-500"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5">
          <p className="mb-2 text-xs font-semibold text-slate-600">历史咨询信息</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[11px] font-normal text-slate-500">是否有历史咨询</p>
              <FieldValue
                value={history.hasHistory ? "有" : "无"}
                className="font-semibold text-slate-900"
              />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">上次会话主题</p>
              <FieldValue value={history.hasHistory ? history.lastTopic || "待补充" : "-"} />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">上次处置方式</p>
              <FieldValue
                value={history.hasHistory ? history.lastDisposition || "待补充" : "-"}
              />
            </div>
            <div>
              <p className="text-[11px] font-normal text-slate-500">历史进线次数</p>
              <FieldValue value={`${history.hasHistory ? history.inboundCount ?? 0 : 0}`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
