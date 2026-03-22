import source from "@/data/mock_scenarios_codex_v3_latest.json";
import type {
  ConversationCase,
  ConversationMeta,
  ConversationTurn,
  EmotionLevel,
  PageStage,
  RiskLevel,
  ScenarioType,
  TurnSnapshot,
} from "@/types/conversation";

interface RawTurn {
  id: string;
  time: string;
  speaker: string;
  text: string;
  recognition: {
    intent: string;
    emotion: string;
    risk: string;
  };
  highlight?: boolean;
}

interface RawSnapshot {
  conversationSummary?: string;
  currentIntent: string;
  emotion: string;
  currentStage?: string;
  riskLevel: string;
  riskSignals: string[];
  keyFacts?: string[];
  missingInfo: string[];
  draft: {
    caseDetail: string;
    customerDemand: string;
    customerPainPoint: string;
    riskPoint: string;
    ticketTitle: string;
  };
  decision: {
    shouldEscalate: boolean;
    recommendedAction: string;
    priority: string;
    nextStep: string;
  };
  review: {
    currentAlert: string;
  };
  suggestion?: TurnSnapshot["suggestion"];
}

interface RawCase {
  case_id: string;
  scenario: string;
  header?: {
    systemName?: string;
    moduleName?: string;
    totalTurns?: number;
  };
  meta: {
    id: string;
    scenario: string;
    channel: string;
    accessTime: string;
    queue: string;
    callDuration: number | string;
    customerType?: string;
    customerTags: string[];
    historyTags: string[];
    currentStatus: string;
    phone?: string;
    uid?: string;
    hasHistory?: boolean;
    lastTopic?: string;
    lastDisposition?: string;
    historyInboundCount?: number;
    boundDeviceInfo?: string;
    deviceFaultCode?: string;
  };
  turns: RawTurn[];
  snapshots: RawSnapshot[];
  monitoring: {
    currentIntent: string;
    emotion: string;
    riskSignals: string[];
    missingInfo: string[];
  };
  draft: {
    caseDetail: string;
    customerDemand: string;
    customerPainPoint: string;
    riskPoint: string;
    suggestedTicketTitle: string;
    suggestCreateTicket: boolean;
  };
  finalResult: {
    summary: string;
    category: string;
    priority: string;
    riskLevel: string;
  };
  resolution: {
    recommendedAction: string;
    suggestedPriority: string;
    nextStepAdvice: string;
    reason: string;
    sopTitle: string;
    escalate: boolean;
  };
  review: {
    score: number;
    confidence: number | string;
    shouldFallback: boolean;
    fallbackReason: string;
    currentAlert?: string;
    depositType?: "normal_auto_deposit" | "candidate_badcase_auto_mark";
    candidateBadcase?: boolean;
    lightFeedbackEnabled?: boolean;
    depositReason?: string;
  };
}

interface RawDataset {
  cases: RawCase[];
}

export const PAGE_STAGE_FLOW: PageStage[] = [
  "idle",
  "monitoring",
  "drafting",
  "resolving",
  "reviewing",
  "ready",
  "submitted",
];

export const PAGE_STAGE_LABELS: Record<PageStage, string> = {
  idle: "未开始分析",
  monitoring: "会中监测中",
  drafting: "草稿生成中",
  resolving: "处置建议生成中",
  reviewing: "质量评估中",
  ready: "待人工确认",
  submitted: "已提交",
};

export const AGENT_CURRENT_STATUS_LABELS: Record<PageStage, string> = {
  idle: "待启动",
  monitoring: "会话理解中",
  drafting: "草稿生成中",
  resolving: "处置建议生成中",
  reviewing: "审查确认中",
  ready: "审查完成",
  submitted: "已提交",
};

export const AGENT_FLOW_ITEMS = [
  { key: "understanding", zhLabel: "会话理解", enLabel: "Understanding Agent", gate: "monitoring" as PageStage },
  { key: "drafting", zhLabel: "草稿生成", enLabel: "Drafting Agent", gate: "drafting" as PageStage },
  { key: "resolution", zhLabel: "处置建议", enLabel: "Resolution Agent", gate: "resolving" as PageStage },
  { key: "review", zhLabel: "审查确认", enLabel: "Review Agent", gate: "reviewing" as PageStage },
];

const EMOTION_MAP: Record<string, EmotionLevel> = {
  平稳: "平稳",
  neutral: "平稳",
  calm: "平稳",
  relieved: "平稳",
  不满: "不满",
  slightly_anxious: "不满",
  anxious: "不满",
  激动: "激动",
  angry: "激动",
  高风险: "高风险",
  very_angry: "高风险",
};

const RISK_MAP: Record<string, RiskLevel> = {
  低: "低",
  low: "低",
  中: "中",
  medium: "中",
  高: "高",
  high: "高",
};

const normalizeEmotion = (value: string): EmotionLevel =>
  EMOTION_MAP[value] ?? "平稳";

const normalizeRiskLevel = (value: string): RiskLevel =>
  RISK_MAP[value] ?? "低";

const normalizePriority = (value: string): string => {
  if (value === "high" || value === "高") return "高";
  if (value === "medium" || value === "中") return "中";
  if (value === "low" || value === "低") return "低";
  return value || "中";
};

const normalizeSpeaker = (speaker: string): "客户" | "客服" => {
  if (speaker === "customer" || speaker === "客户") return "客户";
  return "客服";
};

const formatCallDuration = (value: number | string): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const safe = Math.max(0, Math.floor(value));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  if (typeof value === "string" && value.trim()) return value;
  return "00:00";
};

const normalizeConfidenceLabel = (value: number | string): "高" | "中" | "低" => {
  if (typeof value === "number") {
    if (value >= 0.85) return "高";
    if (value >= 0.7) return "中";
    return "低";
  }
  if (value === "高" || value === "high") return "高";
  if (value === "低" || value === "low") return "低";
  return "中";
};

const normalizeConversationMeta = (rawMeta: RawCase["meta"]): ConversationMeta => ({
  id: rawMeta.id,
  scenario: rawMeta.scenario,
  channel: rawMeta.channel,
  accessTime: rawMeta.accessTime,
  queue: rawMeta.queue,
  callDuration: formatCallDuration(rawMeta.callDuration),
  customerType: rawMeta.customerType,
  customerTags: rawMeta.customerTags ?? [],
  historyTags: rawMeta.historyTags ?? [],
  currentStatus: rawMeta.currentStatus,
  phone: rawMeta.phone,
  uid: rawMeta.uid,
  hasHistory: rawMeta.hasHistory,
  lastTopic: rawMeta.lastTopic,
  lastDisposition: rawMeta.lastDisposition,
  historyInboundCount: rawMeta.historyInboundCount,
  boundDeviceInfo: rawMeta.boundDeviceInfo,
  deviceFaultCode: rawMeta.deviceFaultCode,
});

const normalizeTurns = (turns: RawTurn[], snapshotCount: number): ConversationTurn[] => {
  const maxCount = Math.max(1, snapshotCount);
  return turns.slice(0, maxCount).map((turn) => ({
    id: turn.id,
    time: turn.time,
    speaker: normalizeSpeaker(turn.speaker),
    text: turn.text,
    recognition: {
      intent: turn.recognition.intent,
      emotion: normalizeEmotion(turn.recognition.emotion),
      risk: normalizeRiskLevel(turn.recognition.risk),
    },
    highlight: turn.highlight,
  }));
};

const normalizeSnapshots = (snapshots: RawSnapshot[]): TurnSnapshot[] =>
  snapshots.map((snapshot) => ({
    conversationSummary: snapshot.conversationSummary,
    currentIntent: snapshot.currentIntent,
    emotion: normalizeEmotion(snapshot.emotion),
    currentStage: snapshot.currentStage,
    riskLevel: normalizeRiskLevel(snapshot.riskLevel),
    riskSignals: snapshot.riskSignals ?? [],
    keyFacts: snapshot.keyFacts ?? [],
    missingInfo: snapshot.missingInfo ?? [],
    draft: {
      caseDetail: snapshot.draft.caseDetail,
      customerDemand: snapshot.draft.customerDemand,
      customerPainPoint: snapshot.draft.customerPainPoint,
      riskPoint: snapshot.draft.riskPoint,
      ticketTitle: snapshot.draft.ticketTitle,
    },
    decision: {
      shouldEscalate: snapshot.decision.shouldEscalate,
      recommendedAction: snapshot.decision.recommendedAction,
      priority: normalizePriority(snapshot.decision.priority),
      nextStep: snapshot.decision.nextStep,
    },
    review: {
      currentAlert: snapshot.review.currentAlert,
    },
    suggestion: snapshot.suggestion,
  }));

const DATASET = source as RawDataset;

export const MOCK_CASES: ConversationCase[] = (DATASET.cases ?? []).map((item) => {
  const normalizedSnapshots = normalizeSnapshots(item.snapshots ?? []);

  return {
    case_id: item.case_id,
    scenario: item.scenario,
    meta: normalizeConversationMeta(item.meta),
    turns: normalizeTurns(item.turns ?? [], normalizedSnapshots.length),
    snapshots: normalizedSnapshots,
    monitoring: {
      currentIntent: item.monitoring.currentIntent,
      emotion: normalizeEmotion(item.monitoring.emotion),
      riskSignals: item.monitoring.riskSignals ?? [],
      missingInfo: item.monitoring.missingInfo ?? [],
    },
    draft: {
      caseDetail: item.draft.caseDetail,
      customerDemand: item.draft.customerDemand,
      customerPainPoint: item.draft.customerPainPoint,
      riskPoint: item.draft.riskPoint,
      suggestedTicketTitle: item.draft.suggestedTicketTitle,
      suggestCreateTicket: item.draft.suggestCreateTicket,
    },
    finalResult: {
      summary: item.finalResult.summary,
      category: item.finalResult.category,
      priority: normalizePriority(item.finalResult.priority),
      riskLevel: normalizeRiskLevel(item.finalResult.riskLevel),
    },
    resolution: {
      recommendedAction: item.resolution.recommendedAction,
      suggestedPriority: normalizePriority(item.resolution.suggestedPriority),
      nextStepAdvice: item.resolution.nextStepAdvice,
      reason: item.resolution.reason,
      sopTitle: item.resolution.sopTitle,
      escalate: item.resolution.escalate,
    },
    review: {
      score: item.review.score,
      confidence: normalizeConfidenceLabel(item.review.confidence),
      confidenceScore:
        typeof item.review.confidence === "number" ? item.review.confidence : undefined,
      shouldFallback: item.review.shouldFallback,
      fallbackReason: item.review.fallbackReason,
      currentAlert: item.review.currentAlert,
      depositType: item.review.depositType,
      candidateBadcase: item.review.candidateBadcase,
      lightFeedbackEnabled: item.review.lightFeedbackEnabled,
      depositReason: item.review.depositReason,
    },
  };
});

const CASE_MAP = new Map(MOCK_CASES.map((item) => [item.case_id, item]));

const LEGACY_SCENARIO_ALIAS: Record<string, string[]> = {
  service: ["standard_service_query", "missing_info_fill_ticket"],
  outbound: ["risk_escalation"],
};

export const SCENARIO_LABELS: Record<string, string> = {
  standard_service_query: "标准咨询",
  missing_info_fill_ticket: "信息补问",
  risk_escalation: "风险升级",
  service: "客服",
  outbound: "外呼",
};

const UNIQUE_CATEGORIES = Array.from(
  new Set(MOCK_CASES.map((item) => item.finalResult.category).filter(Boolean)),
);

export const CATEGORY_OPTIONS = ["无需跟进", ...UNIQUE_CATEGORIES];
export const PRIORITY_OPTIONS = ["低", "中", "高"];

const rawCaseById = new Map((DATASET.cases ?? []).map((item) => [item.case_id, item]));

export const getCaseHeaderById = (caseId: string) => {
  const rawCase = rawCaseById.get(caseId);
  return {
    systemName: rawCase?.header?.systemName || "会话实时处置台",
    moduleName: rawCase?.header?.moduleName || "客服",
    totalTurns: rawCase?.header?.totalTurns ?? rawCase?.snapshots?.length ?? 0,
  };
};

export const getCaseById = (caseId: string): ConversationCase | undefined =>
  CASE_MAP.get(caseId);

export const getSnapshotByCaseAndTurn = (
  caseId: string,
  turnIndex: number,
): TurnSnapshot | undefined => {
  const currentCase = getCaseById(caseId);
  if (!currentCase || currentCase.snapshots.length === 0) return undefined;
  const clamped = Math.max(0, Math.min(turnIndex, currentCase.snapshots.length - 1));
  return currentCase.snapshots[clamped];
};

export const getCasesByScenario = (scenario: ScenarioType): ConversationCase[] => {
  const direct = MOCK_CASES.filter((item) => item.scenario === scenario);
  if (direct.length > 0) return direct;

  const aliases = LEGACY_SCENARIO_ALIAS[scenario];
  if (aliases?.length) {
    const aliasHits = MOCK_CASES.filter((item) => aliases.includes(item.scenario));
    if (aliasHits.length > 0) return aliasHits;
  }

  return MOCK_CASES;
};
