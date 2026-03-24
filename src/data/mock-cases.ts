import source from "@/data/focused_mock_cases_v4_two_cases.json";
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

interface FocusedRound {
  roundIndex: number;
  timestamp: string;
  conversationRound: {
    customer: string;
    agent: string;
  };
  recognitionResult: {
    currentIntent: string;
    currentEmotion: string;
    estimatedMissingInfo?: string[];
    suggestionLevel: "无额外建议" | "存在轻度建议" | "强烈建议关注";
    suggestionContent?: string[];
    reasoningBasis?: string[];
  };
  progressiveSummary: string;
  postCallClosurePreview: {
    summary: string;
    archiveCategory: string;
    suggestedTitle: string;
    riskPointNote: string;
    dispositionDraft: string;
    nextDispositionSuggestion: {
      recommendedAction: string;
      suggestedPriority: string;
      nextStepAdvice: string;
      reason: string;
      sopTitle: string;
    };
  };
}

interface FocusedCase {
  case_id: string;
  scenario: string;
  scenarioName?: string;
  header?: {
    systemName?: string;
    moduleName?: string;
    channel?: string;
    totalTurns?: number;
  };
  userBasicInfo: {
    phoneOrUid?: string;
    sessionId: string;
    channel?: string;
    userTags?: string[];
    accessTime?: string;
    queueName?: string;
    callDuration?: number | string;
    hasHistory?: boolean;
    lastTopic?: string;
    lastDisposition?: string;
    historyInboundCount?: number;
  };
  edgeCloudContext?: {
    boundDeviceInfo?: string;
    deviceStatus?: string;
    deviceFaultCode?: string;
    latestEvent?: string;
    cloudUnderstanding?: string;
  };
  rounds: FocusedRound[];
}

interface FocusedDataset {
  cases: FocusedCase[];
}

export interface ScenarioOption {
  value: ScenarioType;
  label: string;
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
  monitoring: "话中监测中",
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
  {
    key: "understanding",
    zhLabel: "会话理解",
    enLabel: "Understanding Agent",
    gate: "monitoring" as PageStage,
  },
  {
    key: "drafting",
    zhLabel: "草稿生成",
    enLabel: "Drafting Agent",
    gate: "drafting" as PageStage,
  },
  {
    key: "resolution",
    zhLabel: "处置建议",
    enLabel: "Resolution Agent",
    gate: "resolving" as PageStage,
  },
  {
    key: "review",
    zhLabel: "审查确认",
    enLabel: "Review Agent",
    gate: "reviewing" as PageStage,
  },
];

const DATASET = source as FocusedDataset;

const EMOTION_MAP: Record<string, EmotionLevel> = {
  平稳: "平稳",
  稳定: "平稳",
  不满: "不满",
  明显不满: "不满",
  激动: "激动",
  愤怒: "高风险",
  高风险: "高风险",
};

const normalizeEmotion = (value: string): EmotionLevel =>
  EMOTION_MAP[value] ?? "平稳";

const normalizePriority = (value: string): string => {
  if (value === "high" || value === "高") return "高";
  if (value === "medium" || value === "中") return "中";
  if (value === "low" || value === "低") return "低";
  return value || "中";
};

const formatCallDuration = (value: number | string | undefined): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const safe = Math.max(0, Math.floor(value));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  if (typeof value === "string" && value.trim()) return value;
  return "00:00";
};

const inferRiskLevel = (round: FocusedRound): RiskLevel => {
  const emotion = normalizeEmotion(round.recognitionResult.currentEmotion);
  const action = round.postCallClosurePreview.nextDispositionSuggestion.recommendedAction;
  const riskNote = round.postCallClosurePreview.riskPointNote || "";

  if (
    emotion === "高风险" ||
    emotion === "激动" ||
    round.recognitionResult.suggestionLevel === "强烈建议关注" ||
    action.includes("升级") ||
    /高风险|投诉|监管|升级/.test(riskNote)
  ) {
    return "高";
  }

  if (emotion === "不满") return "中";
  return "低";
};

const dedupe = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const buildRiskSignals = (round: FocusedRound, riskLevel: RiskLevel): string[] => {
  const reasonSignals = (round.recognitionResult.reasoningBasis ?? []).filter((item) =>
    /投诉|监管|升级|争议|风险/.test(item),
  );

  const noteSignals = /无明显高风险|低风险/.test(round.postCallClosurePreview.riskPointNote)
    ? []
    : [round.postCallClosurePreview.riskPointNote];

  const base = dedupe([...reasonSignals, ...noteSignals]).slice(0, 3);

  if (base.length > 0) return base;
  if (riskLevel === "高") return ["风险升级信号"];
  if (riskLevel === "中") return ["情绪波动"];
  return ["暂无明显风险信号"];
};

const buildTurnSuggestion = (
  round: FocusedRound,
): TurnSnapshot["suggestion"] => {
  const level = round.recognitionResult.suggestionLevel;

  if (level === "强烈建议关注") {
    return {
      routeType: "strong_alert",
      triggerReason: round.recognitionResult.reasoningBasis?.[0] ?? null,
      currentHandlingAdvice:
        round.recognitionResult.suggestionContent?.[0] || "检测到风险升级，需座席当下处理。",
      requiresImmediateHandling: true,
      suggestionContent: round.recognitionResult.suggestionContent ?? [],
    };
  }

  if (level === "存在轻度建议") {
    return {
      routeType: "light_suggestion",
      triggerReason: round.recognitionResult.reasoningBasis?.[0] ?? null,
      currentHandlingAdvice:
        round.recognitionResult.suggestionContent?.[0] || "建议补问关键信息后继续处理。",
      requiresImmediateHandling: false,
      suggestionContent: round.recognitionResult.suggestionContent ?? [],
    };
  }

  return {
    routeType: "silent_update",
    triggerReason: null,
    currentHandlingAdvice: "当前无需额外建议。",
    requiresImmediateHandling: false,
    suggestionContent: round.recognitionResult.suggestionContent ?? [],
  };
};

const buildReviewAlert = (round: FocusedRound) => {
  if (round.recognitionResult.suggestionLevel === "强烈建议关注") {
    return "检测到风险升级信号，建议优先人工关注。";
  }
  if (round.recognitionResult.suggestionLevel === "存在轻度建议") {
    return "建议补全关键信息后继续推进。";
  }
  return "暂无额外审查提醒。";
};

const buildEdgeCloudNarrative = (
  edgeCloudContext: FocusedCase["edgeCloudContext"] | undefined,
) => {
  if (!edgeCloudContext) return "";
  const snippets = [
    edgeCloudContext.boundDeviceInfo
      ? `绑定设备为${edgeCloudContext.boundDeviceInfo}`
      : "",
    edgeCloudContext.deviceStatus
      ? `当前设备状态为${edgeCloudContext.deviceStatus}`
      : "",
    edgeCloudContext.deviceFaultCode
      ? `最近故障码为${edgeCloudContext.deviceFaultCode}`
      : "",
    edgeCloudContext.latestEvent
      ? `最近关键事件：${edgeCloudContext.latestEvent}`
      : "",
    edgeCloudContext.cloudUnderstanding
      ? `云侧理解：${edgeCloudContext.cloudUnderstanding}`
      : "",
  ].filter(Boolean);
  return snippets.join("；");
};

const normalizeConversationMeta = (item: FocusedCase): ConversationMeta => {
  const info = item.userBasicInfo;
  return {
    id: info.sessionId,
    scenario: item.scenario,
    channel: info.channel || item.header?.channel || "电话",
    accessTime: info.accessTime || "",
    queue: info.queueName || "",
    callDuration: formatCallDuration(info.callDuration),
    customerType: undefined,
    customerTags: info.userTags ?? [],
    historyTags: [],
    currentStatus: PAGE_STAGE_LABELS.idle,
    phone: info.phoneOrUid,
    uid: undefined,
    hasHistory: info.hasHistory,
    lastTopic: info.lastTopic,
    lastDisposition: info.lastDisposition,
    historyInboundCount: info.historyInboundCount,
    boundDeviceInfo: item.edgeCloudContext?.boundDeviceInfo,
    currentDeviceStatus: item.edgeCloudContext?.deviceStatus,
    deviceFaultCode: item.edgeCloudContext?.deviceFaultCode,
    latestKeyEvent: item.edgeCloudContext?.latestEvent,
    cloudUnderstandingSummary: item.edgeCloudContext?.cloudUnderstanding,
  };
};

const normalizeTurns = (rounds: FocusedRound[]): ConversationTurn[] =>
  rounds.map((round) => ({
    id: `r${round.roundIndex}`,
    time: round.timestamp,
    speaker: "客户",
    text: round.conversationRound.customer,
    agentText: round.conversationRound.agent,
    recognition: {
      intent: round.recognitionResult.currentIntent,
      emotion: normalizeEmotion(round.recognitionResult.currentEmotion),
      risk: inferRiskLevel(round),
    },
    highlight:
      round.recognitionResult.suggestionLevel === "强烈建议关注" ||
      /投诉|监管|升级/.test(round.conversationRound.customer),
  }));

const normalizeSnapshots = (
  rounds: FocusedRound[],
  edgeCloudContext: FocusedCase["edgeCloudContext"] | undefined,
): TurnSnapshot[] =>
  rounds.map((round) => {
    const riskLevel = inferRiskLevel(round);
    const nextSuggestion = round.postCallClosurePreview.nextDispositionSuggestion;
    const edgeCloudNarrative = buildEdgeCloudNarrative(edgeCloudContext);
    const edgeRiskHint =
      edgeCloudContext?.deviceStatus && /离线|异常|故障/.test(edgeCloudContext.deviceStatus)
        ? `设备状态提示：${edgeCloudContext.deviceStatus}`
        : "";

    return {
      conversationSummary: round.progressiveSummary,
      currentIntent: round.recognitionResult.currentIntent,
      emotion: normalizeEmotion(round.recognitionResult.currentEmotion),
      currentStage: round.recognitionResult.suggestionLevel,
      riskLevel,
      riskSignals: buildRiskSignals(round, riskLevel),
      keyFacts: round.recognitionResult.reasoningBasis ?? [],
      missingInfo: round.recognitionResult.estimatedMissingInfo ?? [],
      draft: {
        caseDetail: [round.postCallClosurePreview.dispositionDraft, edgeCloudNarrative]
          .filter(Boolean)
          .join("；"),
        customerDemand: round.recognitionResult.currentIntent,
        customerPainPoint:
          round.recognitionResult.reasoningBasis?.slice(0, 2).join("；") ||
          round.recognitionResult.currentIntent,
        riskPoint: [round.postCallClosurePreview.riskPointNote, edgeRiskHint]
          .filter(Boolean)
          .join("；"),
        ticketTitle: round.postCallClosurePreview.suggestedTitle,
      },
      decision: {
        shouldEscalate:
          nextSuggestion.recommendedAction === "升级处理" ||
          (riskLevel === "高" &&
            round.recognitionResult.suggestionLevel === "强烈建议关注"),
        recommendedAction: nextSuggestion.recommendedAction,
        priority: normalizePriority(nextSuggestion.suggestedPriority),
        nextStep: nextSuggestion.nextStepAdvice,
      },
      review: {
        currentAlert: buildReviewAlert(round),
      },
      suggestion: buildTurnSuggestion(round),
    };
  });

const normalizeConfidenceLabel = (
  riskLevel: RiskLevel,
): "高" | "中" | "低" => {
  if (riskLevel === "高") return "中";
  if (riskLevel === "中") return "中";
  return "高";
};

const normalizeReviewState = (
  finalRound: FocusedRound,
  finalRiskLevel: RiskLevel,
) => {
  const isHighRisk =
    finalRiskLevel === "高" ||
    finalRound.postCallClosurePreview.nextDispositionSuggestion.recommendedAction ===
      "升级处理";

  return {
    score: isHighRisk ? 74 : 90,
    confidence: normalizeConfidenceLabel(finalRiskLevel),
    confidenceScore: isHighRisk ? 0.72 : 0.9,
    shouldFallback: isHighRisk,
    fallbackReason: isHighRisk
      ? "当前场景存在高风险信号，建议人工复核后再提交。"
      : "当前场景可按标准流程处理。",
    currentAlert: buildReviewAlert(finalRound),
    depositType: isHighRisk
      ? ("candidate_badcase_auto_mark" as const)
      : ("normal_auto_deposit" as const),
    candidateBadcase: isHighRisk,
    lightFeedbackEnabled: true,
    depositReason: isHighRisk
      ? "高风险场景自动标记为候选问题样本。"
      : "标准场景自动沉淀。",
  };
};

const normalizeCase = (item: FocusedCase): ConversationCase => {
  const rounds = item.rounds ?? [];
  const snapshots = normalizeSnapshots(rounds, item.edgeCloudContext);
  const turns = normalizeTurns(rounds);

  const finalRound = rounds[rounds.length - 1] ?? rounds[0];
  const finalSuggestion =
    finalRound?.postCallClosurePreview.nextDispositionSuggestion;
  const finalRiskLevel = finalRound ? inferRiskLevel(finalRound) : "低";

  const fallbackMonitoring: ConversationCase["monitoring"] = {
    currentIntent: "待识别",
    emotion: "平稳",
    riskSignals: ["暂无明显风险信号"],
    missingInfo: [],
  };

  const firstSnapshot = snapshots[0];
  const finalSnapshot = snapshots[snapshots.length - 1] ?? firstSnapshot;

  return {
    case_id: item.case_id,
    scenario: item.scenario,
    meta: normalizeConversationMeta(item),
    turns,
    snapshots,
    monitoring: firstSnapshot
      ? {
          currentIntent: firstSnapshot.currentIntent,
          emotion: firstSnapshot.emotion,
          riskSignals: firstSnapshot.riskSignals,
          missingInfo: firstSnapshot.missingInfo,
        }
      : fallbackMonitoring,
    draft: {
      caseDetail:
        finalSnapshot?.draft.caseDetail ||
        finalRound?.postCallClosurePreview.dispositionDraft ||
        "待生成",
      customerDemand:
        finalSnapshot?.draft.customerDemand ||
        finalRound?.recognitionResult.currentIntent ||
        "待识别",
      customerPainPoint:
        finalSnapshot?.draft.customerPainPoint ||
        finalRound?.recognitionResult.reasoningBasis?.[0] ||
        "待补充",
      riskPoint:
        finalSnapshot?.draft.riskPoint ||
        finalRound?.postCallClosurePreview.riskPointNote ||
        "暂无",
      suggestedTicketTitle:
        finalSnapshot?.draft.ticketTitle ||
        finalRound?.postCallClosurePreview.suggestedTitle ||
        "待生成工单标题",
      suggestCreateTicket:
        finalSuggestion?.recommendedAction !== "自动归档" &&
        finalSuggestion?.recommendedAction !== "无需跟进",
    },
    finalResult: {
      summary:
        finalRound?.postCallClosurePreview.summary ||
        finalSnapshot?.conversationSummary ||
        "待生成",
      category: finalRound?.postCallClosurePreview.archiveCategory || "待归档",
      priority: normalizePriority(finalSuggestion?.suggestedPriority || "中"),
      riskLevel: finalRiskLevel,
    },
    resolution: {
      recommendedAction: finalSuggestion?.recommendedAction || "其他",
      suggestedPriority: normalizePriority(finalSuggestion?.suggestedPriority || "中"),
      nextStepAdvice: finalSuggestion?.nextStepAdvice || "建议继续跟进当前会话。",
      reason: finalSuggestion?.reason || "系统根据当前会话信息生成处置建议。",
      sopTitle: finalSuggestion?.sopTitle || "通用处置SOP",
      escalate:
        finalSuggestion?.recommendedAction === "升级处理" || finalRiskLevel === "高",
    },
    review: finalRound
      ? normalizeReviewState(finalRound, finalRiskLevel)
      : {
          score: 80,
          confidence: "中",
          confidenceScore: 0.8,
          shouldFallback: false,
          fallbackReason: "暂无",
          currentAlert: "暂无额外审查提醒。",
          depositType: "normal_auto_deposit",
          candidateBadcase: false,
          lightFeedbackEnabled: true,
          depositReason: "标准场景自动沉淀。",
        },
  };
};

export const MOCK_CASES: ConversationCase[] = (DATASET.cases ?? []).map(normalizeCase);

const CASE_MAP = new Map(MOCK_CASES.map((item) => [item.case_id, item]));
const RAW_CASE_MAP = new Map((DATASET.cases ?? []).map((item) => [item.case_id, item]));

export const SCENARIO_LABELS: Record<string, string> = Object.fromEntries(
  (DATASET.cases ?? []).map((item) => [item.scenario, item.scenarioName || item.scenario]),
);

export const SCENARIO_OPTIONS: ScenarioOption[] = Array.from(
  new Map(
    (DATASET.cases ?? []).map((item) => [
      item.scenario,
      {
        value: item.scenario,
        label: item.scenarioName || item.scenario,
      },
    ]),
  ).values(),
);

const UNIQUE_CATEGORIES = Array.from(
  new Set(MOCK_CASES.map((item) => item.finalResult.category).filter(Boolean)),
);

export const CATEGORY_OPTIONS = ["无需跟进", ...UNIQUE_CATEGORIES];
export const PRIORITY_OPTIONS = ["低", "中", "高"];

export const getCaseHeaderById = (caseId: string) => {
  const rawCase = RAW_CASE_MAP.get(caseId);
  return {
    systemName: rawCase?.header?.systemName || "会话分析处置台",
    moduleName: rawCase?.header?.moduleName || "客服",
    totalTurns: rawCase?.header?.totalTurns ?? rawCase?.rounds?.length ?? 0,
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
  return MOCK_CASES.slice(0, 1);
};
