import type { ActionSuggestion, SessionSummary } from "@/types/workspace";

export const MOCK_SESSION: SessionSummary = {
  id: "S-20260312-001",
  agentName: "王茜",
  customerName: "李先生",
  channel: "outbound-call",
  sentiment: "neutral",
  riskLevel: "medium",
  stage: "in-progress",
  startTime: "2026-03-12 20:30",
};

export const MOCK_ACTION_SUGGESTIONS: ActionSuggestion[] = [
  {
    id: "sop-refund-01",
    title: "核验退款申请必要材料",
    priority: "P1",
    description: "优先确认客户提供的订单号、支付流水与退款原因，避免遗漏关键信息。",
    sopCode: "SOP-RF-001",
  },
  {
    id: "sop-emotion-02",
    title: "执行情绪安抚话术",
    priority: "P2",
    description: "保持低冲突表达，复述客户核心诉求并给出明确处理时点。",
    sopCode: "SOP-EM-007",
  },
  {
    id: "sop-escalate-03",
    title: "满足条件时转升级处理",
    priority: "P3",
    description: "若出现高风险关键词或重复投诉，触发升级流程并留存上下文摘要。",
    sopCode: "SOP-ES-003",
  },
];

export const DEFAULT_PROBLEM_SAMPLES = [
  "客户要求加急退款",
  "客户对处理时效不满",
  "客户多次重复咨询同一问题",
];
