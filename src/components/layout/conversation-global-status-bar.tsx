"use client";

import { useConversationStore } from "@/store/useConversationStore";

export function ConversationGlobalStatusBar() {
  const meta = useConversationStore((state) => state.conversationMeta);
  const userTags = meta.customerTags.slice(0, 2).join(" / ");
  const riskTags = meta.historyTags.slice(0, 2).join(" / ");

  return (
    <section className="mx-auto mt-4 w-full max-w-[1720px] px-5">
      <div className="rounded-3xl border border-slate-200/75 bg-white/90 px-4 py-3 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)] backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold tracking-tight text-slate-900">当前会话信息</p>
          {meta.customerType ? (
            <p className="text-xs text-slate-500">客户类型：<span className="font-medium text-slate-700">{meta.customerType}</span></p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div>
            <p className="text-[11px] font-normal text-slate-500">会话ID</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{meta.id}</p>
          </div>
          <div>
            <p className="text-[11px] font-normal text-slate-500">渠道</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{meta.channel}</p>
          </div>
          <div>
            <p className="text-[11px] font-normal text-slate-500">用户标签</p>
            <p className="mt-0.5 text-sm font-medium text-slate-800">{userTags || "无"}</p>
          </div>
          <div>
            <p className="text-[11px] font-normal text-slate-500">接入时间</p>
            <p className="mt-0.5 text-sm font-medium text-slate-800">{meta.accessTime}</p>
          </div>
          <div>
            <p className="text-[11px] font-normal text-slate-500">队列</p>
            <p className="mt-0.5 text-sm font-medium text-slate-800">{meta.queue}</p>
          </div>
          <div>
            <p className="text-[11px] font-normal text-slate-500">通话时长</p>
            <p className="mt-0.5 text-sm font-medium text-slate-800">{meta.callDuration}</p>
          </div>
        </div>

        {riskTags ? (
          <div className="mt-2 border-t border-slate-100 pt-2">
            <p className="text-[11px] text-slate-500">历史风险标签：{riskTags}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
