import type {
  AnalysisMode,
  EmotionLevel,
  ConversationTurn,
  ConversationMeta,
  DraftState,
  FinalResultState,
  MonitoringState,
  PageStage,
  ReviewState,
  ResolutionState,
} from "@/types/conversation";
import {
  getCaseById,
  getCaseHeaderById,
  getSnapshotByCaseAndTurn,
} from "@/data/mock-cases";
import type {
  BasicInfoViewModel,
  ConversationRoundViewModel,
  CurrentSessionStatusViewModel,
  FeedbackClosureViewModel,
  InCallInsightSuggestionViewModel,
  InCallPromptStatus,
  InCallSuggestionType,
  NextDispositionAction,
  InCallSuggestionViewModel,
  NextActionType,
  NextActionViewModel,
  PostDispositionViewModel,
  ProcessingStatus,
  TopBarViewModel,
  WorkbenchViewModel,
} from "@/types/workbench-view-model";

interface BuildTopBarViewModelInput {
  activeCaseId: string;
  pageStage: PageStage;
  analysisMode: AnalysisMode;
  currentTurnIndex: number;
  totalTurns: number;
}

interface BuildWorkbenchViewModelInput extends BuildTopBarViewModelInput {
  conversationMeta: ConversationMeta;
  conversationTurns: ConversationTurn[];
  monitoringState: MonitoringState;
  draftState: DraftState;
  finalResultState: FinalResultState;
  resolutionState: ResolutionState;
  reviewState: ReviewState;
  editableCaseDetail: string;
  editableCategory: string;
  editablePriority: string;
  editableRiskPoint: string;
}

interface BuildBasicInfoViewModelInput {
  activeCaseId: string;
  conversationMeta: ConversationMeta;
}

interface BuildCurrentSessionStatusViewModelInput {
  activeCaseId: string;
  pageStage: PageStage;
  activeTurnIndex: number;
  conversationTurns: ConversationTurn[];
  monitoringState: MonitoringState;
  draftState: DraftState;
  resolutionState: ResolutionState;
}

interface BuildInCallSuggestionViewModelInput {
  pageStage: PageStage;
  activeCaseId: string;
  activeTurnIndex: number;
  conversationMeta: ConversationMeta;
  monitoringState: MonitoringState;
  resolutionState: ResolutionState;
  reviewState: ReviewState;
}

interface BuildInCallInsightSuggestionViewModelInput {
  status: CurrentSessionStatusViewModel;
  suggestion: InCallSuggestionViewModel;
  resolutionState: ResolutionState;
  conversationMeta: ConversationMeta;
}

interface BuildPostDispositionViewModelInput {
  pageStage: PageStage;
  conversationMeta: ConversationMeta;
  draftState: DraftState;
  finalResultState: FinalResultState;
  resolutionState: ResolutionState;
  reviewState: ReviewState;
  editableCaseDetail: string;
  editableCategory: string;
  editableRiskPoint: string;
}

interface BuildNextActionViewModelInput {
  pageStage: PageStage;
  activeCaseId: string;
  monitoringState: MonitoringState;
  resolutionState: ResolutionState;
  finalResultState: FinalResultState;
  reviewState: ReviewState;
  editableCategory: string;
  editablePriority: string;
}

interface BuildFeedbackClosureViewModelInput {
  pageStage: PageStage;
  activeCaseId: string;
  resolutionState: ResolutionState;
  reviewState: ReviewState;
  finalResultState: FinalResultState;
  nextAction: NextActionViewModel;
}

const PAGE_STAGE_TO_PROCESSING_STATUS: Record<PageStage, ProcessingStatus> = {
  idle: "未开始",
  monitoring: "AI分析总结中",
  drafting: "AI分析总结中",
  resolving: "AI分析总结中",
  reviewing: "AI分析总结中",
  ready: "人工处理中",
  submitted: "处理完成",
};

const nearestUtteranceBySpeaker = (
  turns: ConversationTurn[],
  index: number,
  speaker: "客户" | "客服",
) => {
  if (turns[index]?.speaker === speaker) return turns[index]?.text ?? "暂无";

  let leftHit = -1;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (turns[cursor]?.speaker === speaker) {
      leftHit = cursor;
      break;
    }
  }

  let rightHit = -1;
  for (let cursor = index + 1; cursor < turns.length; cursor += 1) {
    if (turns[cursor]?.speaker === speaker) {
      rightHit = cursor;
      break;
    }
  }

  if (leftHit === -1 && rightHit === -1) return "暂无";
  if (leftHit === -1) return turns[rightHit]?.text ?? "暂无";
  if (rightHit === -1) return turns[leftHit]?.text ?? "暂无";

  return index - leftHit <= rightHit - index
    ? turns[leftHit]?.text ?? "暂无"
    : turns[rightHit]?.text ?? "暂无";
};

const buildDemandDelta = (turns: ConversationTurn[], index: number) => {
  const currentIntent = turns[index]?.recognition.intent ?? "待识别";
  return currentIntent;
};

const buildEmotionDelta = (turns: ConversationTurn[], index: number) => {
  const currentEmotion = turns[index]?.recognition.emotion ?? "平稳";
  if (currentEmotion === "高风险") return "愤怒";
  if (currentEmotion === "激动" || currentEmotion === "不满") return "激动";
  return "平稳";
};

const buildConversationRounds = (
  turns: ConversationTurn[],
  activeTurnIndex: number,
): ConversationRoundViewModel[] => {
  return turns.map((turn, index) => ({
    id: turn.id,
    roundLabel: `第${index + 1}轮`,
    timestamp: turn.time,
    customerUtterance:
      turn.speaker === "客户" ? turn.text : nearestUtteranceBySpeaker(turns, index, "客户"),
    agentUtterance:
      turn.agentText || nearestUtteranceBySpeaker(turns, index, "客服"),
    demandDelta: buildDemandDelta(turns, index),
    emotionDelta: buildEmotionDelta(turns, index),
    isKeyRound:
      Boolean(turn.highlight) ||
      turn.recognition.risk === "高" ||
      turn.recognition.intent.includes("投诉"),
    isActive: index === activeTurnIndex,
    isReached: activeTurnIndex >= 0 && index <= activeTurnIndex,
  }));
};

export const buildConversationRoundsViewModel = (
  turns: ConversationTurn[],
  activeTurnIndex: number,
) => buildConversationRounds(turns, activeTurnIndex);

export const buildCurrentSessionStatusViewModel = ({
  activeCaseId,
  pageStage,
  activeTurnIndex,
  conversationTurns,
  monitoringState,
  draftState,
  resolutionState,
}: BuildCurrentSessionStatusViewModelInput): CurrentSessionStatusViewModel => {
  const snapshot = getSnapshotByCaseAndTurn(activeCaseId, activeTurnIndex);

  const reachedTurns =
    activeTurnIndex >= 0
      ? conversationTurns.slice(0, Math.min(activeTurnIndex + 1, conversationTurns.length))
      : [];

  const highlightedFacts = reachedTurns
    .filter((item) => item.highlight)
    .map((item) => item.text);

  const rawFacts = [
    draftState.customerPainPoint ? `客户诉点：${draftState.customerPainPoint}` : "",
    highlightedFacts[0] ? `关键表达：${highlightedFacts[0]}` : "",
    resolutionState.recommendedAction
      ? `系统判断：${resolutionState.recommendedAction}`
      : "",
    ...(snapshot?.keyFacts ?? []),
  ].filter(Boolean);
  const facts = Array.from(new Set(rawFacts));
  const expectedMissingInfo =
    (snapshot?.missingInfo?.length ?? 0) > 0
      ? snapshot?.missingInfo ?? []
      : monitoringState.missingInfo.length > 0
        ? monitoringState.missingInfo
        : ["暂无明显缺失信息"];
  const oneLineUnderstanding =
    snapshot?.conversationSummary ||
    draftState.caseDetail ||
    "系统正在汇总当前会话理解。";
  const docLinks =
    resolutionState.sopTitle?.trim()
      ? [{ label: `文档索引：${resolutionState.sopTitle}`, href: "#" }]
      : [];

  return {
    summary:
      pageStage === "idle"
        ? "分析未开始，待生成会话摘要。"
        : resolveStableSummary({
            activeCaseId,
            activeTurnIndex,
            currentEmotion: snapshot?.emotion || monitoringState.emotion,
          }) ||
          snapshot?.conversationSummary ||
          draftState.caseDetail ||
          "暂无会话摘要",
    currentDemand:
      snapshot?.currentIntent || draftState.customerDemand || monitoringState.currentIntent || "待识别",
    currentEmotion: snapshot?.emotion || monitoringState.emotion,
    expectedMissingInfo,
    judgmentBasis: {
      oneLineUnderstanding,
      facts: facts.length > 0 ? facts : ["暂无关键事实"],
      docLinks,
    },
  };
};

export const buildBasicInfoViewModel = ({
  activeCaseId: _activeCaseId,
  conversationMeta,
}: BuildBasicInfoViewModelInput): BasicInfoViewModel => {
  const hasEdgeCloudContext = Boolean(
    conversationMeta.boundDeviceInfo ||
      conversationMeta.currentDeviceStatus ||
      conversationMeta.deviceFaultCode ||
      conversationMeta.latestKeyEvent ||
      conversationMeta.cloudUnderstandingSummary,
  );

  return {
    uidOrPhone: conversationMeta.phone || conversationMeta.uid || "待补充",
    sessionId: conversationMeta.id,
    channel: conversationMeta.channel,
    accessTime: conversationMeta.accessTime,
    queue: conversationMeta.queue,
    callDuration: conversationMeta.callDuration,
    customerType: conversationMeta.customerType,
    userTags: conversationMeta.customerTags.slice(0, 2),
    historyRiskTags: conversationMeta.historyTags.slice(0, 2),
    edgeCloud: {
      enabled: hasEdgeCloudContext,
      boundDevice: conversationMeta.boundDeviceInfo,
      deviceStatus: conversationMeta.currentDeviceStatus,
      faultCode: conversationMeta.deviceFaultCode,
      latestEvent: conversationMeta.latestKeyEvent,
      cloudSummary: conversationMeta.cloudUnderstandingSummary,
    },
    historyConsultation: {
      hasHistory: Boolean(conversationMeta.hasHistory),
      lastTopic: conversationMeta.lastTopic,
      lastDisposition: conversationMeta.lastDisposition,
      inboundCount: conversationMeta.historyInboundCount,
    },
  };
};

const mapBranchToType = (branch: "silent" | "light" | "strong"): InCallSuggestionType => {
  if (branch === "strong") return "强提示";
  if (branch === "light") return "轻提示";
  return "静默更新";
};

const SUMMARY_BATCH_TURN_INTERVAL = 2;

const isAgitatedEmotion = (emotion: EmotionLevel) =>
  emotion === "激动" || emotion === "高风险";

// Demo summary update rule: batched refresh (approx 30s window) + immediate refresh on agitated emotion.
const resolveStableSummary = ({
  activeCaseId,
  activeTurnIndex,
  currentEmotion,
}: {
  activeCaseId: string;
  activeTurnIndex: number;
  currentEmotion: EmotionLevel;
}) => {
  const sourceCase = getCaseById(activeCaseId);
  if (!sourceCase || activeTurnIndex < 0) return undefined;
  const maxIndex = Math.max(0, sourceCase.snapshots.length - 1);
  const clampedIndex = Math.max(0, Math.min(activeTurnIndex, maxIndex));

  if (clampedIndex === maxIndex) {
    return sourceCase.snapshots[maxIndex]?.conversationSummary;
  }

  if (isAgitatedEmotion(currentEmotion)) {
    return sourceCase.snapshots[clampedIndex]?.conversationSummary;
  }

  const stableIndex =
    Math.floor(clampedIndex / SUMMARY_BATCH_TURN_INTERVAL) *
    SUMMARY_BATCH_TURN_INTERVAL;
  return sourceCase.snapshots[stableIndex]?.conversationSummary;
};

const mapPromptStatus = (
  suggestionType: InCallSuggestionType,
): InCallPromptStatus => {
  if (suggestionType === "强提示") return "强烈建议关注";
  if (suggestionType === "轻提示") return "存在轻度建议";
  return "无额外建议";
};

const hasEscalateSignals = (
  emotion: EmotionLevel,
  monitoringState: MonitoringState,
  resolutionState: ResolutionState,
) =>
  emotion === "高风险" ||
  resolutionState.escalate ||
  monitoringState.riskSignals.some((item) => /投诉|升级|合规|争议/.test(item));

export const buildInCallSuggestionViewModel = ({
  pageStage,
  activeCaseId,
  activeTurnIndex,
  conversationMeta,
  monitoringState,
  resolutionState,
  reviewState,
}: BuildInCallSuggestionViewModelInput): InCallSuggestionViewModel => {
  if (pageStage === "idle" || activeTurnIndex < 0) {
    return {
      suggestionType: "静默更新",
      triggerReason: "分析未开始，话中建议将在关键节点出现。",
      handlingAdvice: "当前无需额外提醒。",
      needImmediateAction: false,
      suggestions: ["开始分析后，系统会按会话变化给出提醒。"],
      weakDisplay: true,
    };
  }

  const snapshot = getSnapshotByCaseAndTurn(activeCaseId, activeTurnIndex);
  const routeType = snapshot?.suggestion?.routeType ?? "silent_update";
  const branch = routeType === "strong_alert" ? "strong" : routeType === "light_suggestion" ? "light" : "silent";

  const escalate = hasEscalateSignals(
    snapshot?.emotion || monitoringState.emotion,
    monitoringState,
    resolutionState,
  );
  const finalType =
    escalate && branch !== "strong" ? "强提示" : mapBranchToType(branch);

  const triggerReasonBase =
    snapshot?.suggestion?.triggerReason || "会话持续更新，系统已同步当前建议。";

  const triggerReason =
    conversationMeta.hasHistory && conversationMeta.lastTopic
      ? `${triggerReasonBase}（参考历史：${conversationMeta.lastTopic}）`
      : triggerReasonBase;

  const suggestions = [
    ...(snapshot?.suggestion?.suggestionContent ?? []),
  ];
  if (suggestions.length === 0) {
    suggestions.push("建议持续跟踪当前会话变化。");
  }
  if (conversationMeta.hasHistory && conversationMeta.lastDisposition) {
    suggestions.push(`历史处置参考：${conversationMeta.lastDisposition}`);
  }
  if (reviewState.currentAlert) {
    suggestions.push(`审查提示：${reviewState.currentAlert}`);
  }

  return {
    suggestionType: finalType,
    triggerReason,
    handlingAdvice:
      finalType === "强提示" && !snapshot?.suggestion?.currentHandlingAdvice
        ? "检测到风险升级，需优先进行当下处置。"
        : snapshot?.suggestion?.currentHandlingAdvice || "建议按当前处理路径继续推进。",
    needImmediateAction:
      finalType === "强提示" ||
      Boolean(snapshot?.suggestion?.requiresImmediateHandling),
    suggestions,
    weakDisplay:
      finalType === "静默更新" ||
      pageStage === "ready" ||
      pageStage === "submitted",
  };
};

export const buildInCallInsightSuggestionViewModel = ({
  status,
  suggestion,
  resolutionState,
  conversationMeta,
}: BuildInCallInsightSuggestionViewModelInput): InCallInsightSuggestionViewModel => {
  const promptStatus = mapPromptStatus(suggestion.suggestionType);
  const hasActionableSuggestion = promptStatus !== "无额外建议";
  const edgeCloudEvidence = [
    conversationMeta.currentDeviceStatus
      ? `设备状态为${conversationMeta.currentDeviceStatus}`
      : "",
    conversationMeta.deviceFaultCode
      ? `故障码为${conversationMeta.deviceFaultCode}`
      : "",
    conversationMeta.latestKeyEvent
      ? `最近关键事件为${conversationMeta.latestKeyEvent}`
      : "",
    conversationMeta.cloudUnderstandingSummary
      ? `云侧理解为${conversationMeta.cloudUnderstandingSummary}`
      : "",
  ].filter(Boolean);
  const edgeCloudEvidenceText =
    edgeCloudEvidence.length > 0
      ? `，并结合${edgeCloudEvidence.join("，")}`
      : "";

  return {
    summary: status.summary,
    currentDemand: status.currentDemand,
    currentEmotion: status.currentEmotion,
    expectedMissingInfo: status.expectedMissingInfo,
    promptStatus,
    suggestionContent: hasActionableSuggestion ? suggestion.suggestions : [],
    judgmentBasis: hasActionableSuggestion
      ? `AI 结合 ${resolutionState.sopTitle || "SOP文档"} 和当前对话信息${edgeCloudEvidenceText}综合判断：${suggestion.triggerReason}`
      : "",
    docLinks: hasActionableSuggestion ? status.judgmentBasis.docLinks : [],
    weakDisplay: promptStatus === "无额外建议",
  };
};

const PAGE_STAGE_TO_POST_DISPOSITION_LABEL: Record<PageStage, string> = {
  idle: "待生成",
  monitoring: "会中草稿",
  drafting: "会中草稿",
  resolving: "会中收敛",
  reviewing: "待确认",
  ready: "可确认",
  submitted: "已收口",
};

export const buildPostDispositionViewModel = ({
  pageStage,
  conversationMeta,
  draftState,
  finalResultState,
  resolutionState,
  reviewState,
  editableCaseDetail,
  editableCategory,
  editableRiskPoint,
}: BuildPostDispositionViewModelInput): PostDispositionViewModel => {
  const edgeCloudNarrative = [
    conversationMeta.boundDeviceInfo
      ? `绑定设备${conversationMeta.boundDeviceInfo}`
      : "",
    conversationMeta.currentDeviceStatus
      ? `当前设备状态${conversationMeta.currentDeviceStatus}`
      : "",
    conversationMeta.deviceFaultCode
      ? `故障码${conversationMeta.deviceFaultCode}`
      : "",
    conversationMeta.latestKeyEvent
      ? `关键事件${conversationMeta.latestKeyEvent}`
      : "",
    conversationMeta.cloudUnderstandingSummary
      ? `云侧理解：${conversationMeta.cloudUnderstandingSummary}`
      : "",
  ].filter(Boolean);

  const finalSummary =
    editableCaseDetail ||
    (pageStage === "submitted"
      ? finalResultState.summary
      : draftState.caseDetail);
  const rawDispositionDraft = editableCaseDetail || draftState.caseDetail;
  const edgeCloudNarrativeText = edgeCloudNarrative.join("；");
  const dispositionDraft =
    edgeCloudNarrativeText && !rawDispositionDraft.includes(edgeCloudNarrativeText)
      ? [rawDispositionDraft, edgeCloudNarrativeText].filter(Boolean).join("；")
      : rawDispositionDraft;

  const riskNoteSource = [
    editableRiskPoint || draftState.riskPoint,
    conversationMeta.currentDeviceStatus &&
    /离线|异常|故障/.test(conversationMeta.currentDeviceStatus)
      ? `设备异常等级提示：${conversationMeta.currentDeviceStatus}`
      : "",
    reviewState.currentAlert ? `审查提示：${reviewState.currentAlert}` : "",
  ]
    .filter(Boolean)
    .join("；") || "当前未识别到明确高风险。";

  const followUpSuggestions = [
    resolutionState.nextStepAdvice,
    resolutionState.escalate
      ? "建议优先由人工复核后执行。"
      : "建议按标准流程完成归档与回告。",
  ].filter(Boolean);

  return {
    summary: finalSummary,
    archiveCategory: editableCategory || finalResultState.category || "待归档",
    dispositionDraft,
    riskNote: riskNoteSource,
    followUpSuggestions,
    stageLabel: PAGE_STAGE_TO_POST_DISPOSITION_LABEL[pageStage],
    isPrimary: pageStage === "ready" || pageStage === "submitted",
    weakDisplay: pageStage === "drafting" || pageStage === "resolving" || pageStage === "reviewing",
    canEdit: pageStage === "ready" || pageStage === "submitted",
  };
};

const resolveNextActionType = ({
  pageStage,
  hasHighRisk,
  hasMissingInfo,
  archiveCategory,
}: {
  pageStage: PageStage;
  hasHighRisk: boolean;
  hasMissingInfo: boolean;
  archiveCategory: string;
}): NextActionType => {
  if (archiveCategory === "无需跟进") return "直接归档";
  if (hasHighRisk) return "人工接管";
  if (hasMissingInfo) return "确认后执行";
  if (pageStage === "submitted") return "一键执行";
  return "确认后执行";
};

const resolveActionPath = ({
  highRisk,
  missingInfo,
}: {
  highRisk: boolean;
  missingInfo: boolean;
}): "标准处理路径" | "信息补问路径" | "风险升级路径" => {
  if (highRisk) return "风险升级路径";
  if (missingInfo) return "信息补问路径";
  return "标准处理路径";
};

const mapActionTypeToDispositionAction = (
  actionType: NextActionType,
): NextDispositionAction => {
  if (actionType === "直接归档") return "自动归档";
  if (actionType === "人工接管") return "升级处理";
  return "生成工单";
};

export const buildNextActionViewModel = ({
  pageStage,
  activeCaseId: _activeCaseId,
  monitoringState,
  resolutionState,
  finalResultState,
  reviewState,
  editableCategory,
  editablePriority,
}: BuildNextActionViewModelInput): NextActionViewModel => {
  const archiveCategory = editableCategory || finalResultState.category || "待归档";
  const hasHighRisk =
    finalResultState.riskLevel === "高" ||
    resolutionState.escalate ||
    monitoringState.emotion === "高风险" ||
    monitoringState.riskSignals.some((item) => /投诉|升级|争议|合规/.test(item));
  const requiresManualByReview =
    reviewState.shouldFallback || reviewState.confidence === "低";
  const hasMissingInfo = monitoringState.missingInfo.length > 0;

  const actionPath = resolveActionPath({
    highRisk: hasHighRisk,
    missingInfo: hasMissingInfo,
  });
  const actionType = resolveNextActionType({
    pageStage,
    hasHighRisk: hasHighRisk || requiresManualByReview,
    hasMissingInfo,
    archiveCategory,
  });
  const recommendedAction = mapActionTypeToDispositionAction(actionType);
  const suggestedPriority =
    resolutionState.suggestedPriority ||
    editablePriority ||
    finalResultState.priority ||
    "中";
  const baseReason = resolutionState.reason || "系统根据当前会话状态给出处置建议。";
  const recommendedReason = reviewState.currentAlert
    ? `${baseReason}（${reviewState.currentAlert}）`
    : baseReason;

  return {
    actionType,
    actionPath,
    recommendedAction,
    recommendedActionOptions: ["自动归档", "生成工单", "升级处理", "其他"],
    suggestedPriority,
    nextStepAdvice: resolutionState.nextStepAdvice || "建议按当前流程继续处理。",
    recommendedReason:
      recommendedReason || "系统已结合当前会话信息给出处置建议。",
    sopTitle: resolutionState.sopTitle || "无",
    weakDisplay: pageStage !== "ready" && pageStage !== "submitted",
  };
};

export const buildFeedbackClosureViewModel = ({
  pageStage,
  activeCaseId: _activeCaseId,
  resolutionState,
  reviewState,
  finalResultState,
  nextAction,
}: BuildFeedbackClosureViewModelInput): FeedbackClosureViewModel => {
  const highRiskSignals =
    resolutionState.escalate ||
    nextAction.actionType === "人工接管" ||
    finalResultState.riskLevel === "高";
  const lowConfidenceSignals =
    reviewState.shouldFallback || reviewState.confidence === "低";

  const fallbackToBadcase =
    reviewState.depositType === "candidate_badcase_auto_mark" ||
    reviewState.candidateBadcase === true ||
    highRiskSignals ||
    lowConfidenceSignals;
  const depositToKnowledgeBase =
    pageStage === "submitted" && !fallbackToBadcase;

  return {
    demoTitleInternal: "反馈沉淀（知识库沉淀 / badcase回流）",
    depositToKnowledgeBase,
    fallbackToBadcase,
    weakDisplay: true,
  };
};

export const buildTopBarViewModel = ({
  activeCaseId,
  pageStage,
  analysisMode,
  currentTurnIndex,
  totalTurns,
}: BuildTopBarViewModelInput): TopBarViewModel => {
  const header = getCaseHeaderById(activeCaseId);
  return {
    systemName:
      header.systemName === "客服会话智能处置台"
        ? "会话实时处置台"
        : header.systemName,
    subtitle: "用AI重构座席会话处理工作流",
    moduleLabel: `${header.moduleName}模块`,
    processingStatus: PAGE_STAGE_TO_PROCESSING_STATUS[pageStage],
    analysisMode,
    canStepManually:
      analysisMode === "manual" &&
      pageStage !== "idle" &&
      pageStage !== "submitted" &&
      currentTurnIndex < totalTurns - 1,
  };
};

export const buildWorkbenchViewModel = ({
  pageStage,
  analysisMode,
  currentTurnIndex,
  totalTurns,
  activeCaseId,
  conversationMeta,
  conversationTurns,
  monitoringState,
  draftState,
  finalResultState,
  resolutionState,
  reviewState,
  editableCaseDetail,
  editableCategory,
  editablePriority,
  editableRiskPoint,
}: BuildWorkbenchViewModelInput): WorkbenchViewModel => {
  const currentSessionStatus = buildCurrentSessionStatusViewModel({
    activeCaseId,
    pageStage,
    activeTurnIndex: currentTurnIndex,
    conversationTurns,
    monitoringState,
    draftState,
    resolutionState,
  });
  const inCallSuggestion = buildInCallSuggestionViewModel({
    pageStage,
    activeCaseId,
    activeTurnIndex: currentTurnIndex,
    conversationMeta,
    monitoringState,
    resolutionState,
    reviewState,
  });
  const inCallInsightSuggestion = buildInCallInsightSuggestionViewModel({
    status: currentSessionStatus,
    suggestion: inCallSuggestion,
    resolutionState,
    conversationMeta,
  });

  const nextAction = buildNextActionViewModel({
    pageStage,
    activeCaseId,
    monitoringState,
    resolutionState,
    finalResultState,
    reviewState,
    editableCategory,
    editablePriority,
  });

  return {
    topBar: buildTopBarViewModel({
      activeCaseId,
      pageStage,
      analysisMode,
      currentTurnIndex,
      totalTurns,
    }),
    basicInfo: buildBasicInfoViewModel({
      activeCaseId,
      conversationMeta,
    }),
    conversationRounds: buildConversationRoundsViewModel(
      conversationTurns,
      currentTurnIndex,
    ),
    currentSessionStatus,
    inCallSuggestion,
    inCallInsightSuggestion,
    postDisposition: buildPostDispositionViewModel({
      pageStage,
      conversationMeta,
      draftState,
      finalResultState,
      resolutionState,
      reviewState,
      editableCaseDetail,
      editableCategory,
      editableRiskPoint,
    }),
    nextAction,
    feedbackClosure: buildFeedbackClosureViewModel({
      pageStage,
      activeCaseId,
      resolutionState,
      reviewState,
      finalResultState,
      nextAction,
    }),
  };
};
