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
  getCaseHeaderById,
  getSnapshotByCaseAndTurn,
} from "@/data/mock-cases";
import type {
  BasicInfoViewModel,
  ConversationRoundViewModel,
  CurrentSessionStatusViewModel,
  FeedbackClosureViewModel,
  InCallSuggestionType,
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

interface BuildPostDispositionViewModelInput {
  pageStage: PageStage;
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

const PAGE_STAGE_TO_CURRENT_STAGE_LABEL: Record<PageStage, string> = {
  idle: "待分析",
  monitoring: "会话识别中",
  drafting: "话中建议生成中",
  resolving: "处置方案收敛中",
  reviewing: "人工审查中",
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
  if (index === 0) return `初始诉求：${currentIntent}`;
  const prevIntent = turns[index - 1]?.recognition.intent ?? "待识别";
  if (prevIntent === currentIntent) return `诉求保持：${currentIntent}`;
  return `诉求变化：${prevIntent} -> ${currentIntent}`;
};

const buildEmotionDelta = (turns: ConversationTurn[], index: number) => {
  const currentEmotion = turns[index]?.recognition.emotion ?? "平稳";
  if (index === 0) return `初始情绪：${currentEmotion}`;
  const prevEmotion = turns[index - 1]?.recognition.emotion ?? "平稳";
  if (prevEmotion === currentEmotion) return `情绪保持：${currentEmotion}`;
  return `情绪变化：${prevEmotion} -> ${currentEmotion}`;
};

const deriveRiskLevel = (
  monitoringState: MonitoringState,
  activeTurn?: ConversationTurn,
): "低" | "中" | "高" => {
  if (
    monitoringState.emotion === "高风险" ||
    activeTurn?.recognition.risk === "高" ||
    monitoringState.riskSignals.some((item) => /投诉|升级|监管|高风险/.test(item))
  ) {
    return "高";
  }

  if (
    monitoringState.emotion === "不满" ||
    monitoringState.emotion === "激动" ||
    activeTurn?.recognition.risk === "中" ||
    monitoringState.riskSignals.some((item) => /争议|拒绝|不满/.test(item))
  ) {
    return "中";
  }

  return "低";
};

const buildConversationRounds = (
  turns: ConversationTurn[],
  activeTurnIndex: number,
): ConversationRoundViewModel[] => {
  return turns.map((turn, index) => ({
    id: turn.id,
    roundLabel: `第${index + 1}轮`,
    timestamp: turn.time,
    customerUtterance: nearestUtteranceBySpeaker(turns, index, "客户"),
    agentUtterance: nearestUtteranceBySpeaker(turns, index, "客服"),
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
  const activeTurn =
    activeTurnIndex >= 0 && activeTurnIndex < conversationTurns.length
      ? conversationTurns[activeTurnIndex]
      : undefined;

  const reachedTurns =
    activeTurnIndex >= 0
      ? conversationTurns.slice(0, Math.min(activeTurnIndex + 1, conversationTurns.length))
      : [];

  const highlightedFacts = reachedTurns
    .filter((item) => item.highlight)
    .map((item) => item.text);

  const keyFacts = [
    draftState.customerPainPoint ? `客户诉点：${draftState.customerPainPoint}` : "",
    highlightedFacts[0] ? `关键表达：${highlightedFacts[0]}` : "",
    resolutionState.recommendedAction
      ? `系统判断：${resolutionState.recommendedAction}`
      : "",
    ...(snapshot?.keyFacts ?? []),
  ].filter(Boolean);

  return {
    summary:
      pageStage === "idle"
        ? "分析未开始，待生成会话摘要。"
        : snapshot?.conversationSummary || draftState.caseDetail || "暂无会话摘要",
    currentDemand:
      snapshot?.currentIntent || draftState.customerDemand || monitoringState.currentIntent || "待识别",
    currentEmotion: snapshot?.emotion || monitoringState.emotion,
    currentStage: snapshot?.currentStage || PAGE_STAGE_TO_CURRENT_STAGE_LABEL[pageStage],
    riskLevel: snapshot?.riskLevel || deriveRiskLevel(monitoringState, activeTurn),
    keyFacts: keyFacts.length > 0 ? keyFacts : ["暂无关键事实"],
    missingInfo:
      (snapshot?.missingInfo?.length ?? 0) > 0
        ? snapshot?.missingInfo ?? []
        : monitoringState.missingInfo.length > 0
          ? monitoringState.missingInfo
        : ["暂无明显缺失信息"],
  };
};

export const buildBasicInfoViewModel = ({
  activeCaseId: _activeCaseId,
  conversationMeta,
}: BuildBasicInfoViewModelInput): BasicInfoViewModel => {
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
    deviceInfo: conversationMeta.boundDeviceInfo,
    deviceFaultCode: conversationMeta.deviceFaultCode,
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
  draftState,
  finalResultState,
  resolutionState,
  reviewState,
  editableCaseDetail,
  editableCategory,
  editableRiskPoint,
}: BuildPostDispositionViewModelInput): PostDispositionViewModel => {
  const finalSummary =
    editableCaseDetail ||
    (pageStage === "submitted"
      ? finalResultState.summary
      : draftState.caseDetail);

  const riskNoteSource = [
    editableRiskPoint || draftState.riskPoint,
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
    dispositionDraft: editableCaseDetail || draftState.caseDetail,
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

const resolveActionTemplate = (
  actionType: NextActionType,
  resolutionState: ResolutionState,
) => {
  if (actionType === "直接归档") {
    return {
      actionName: "直接归档会话",
      actionReason: "当前会话已完成标准处理，且无需额外后续动作。",
      suggestionNote: resolutionState.nextStepAdvice || "建议按标准流程直接归档。",
      riskTip: undefined,
    };
  }
  if (actionType === "一键执行") {
    return {
      actionName: "一键执行标准动作",
      actionReason: "当前信息完整，动作为标准化流程，可直接执行。",
      suggestionNote: resolutionState.nextStepAdvice || "建议直接执行并沉淀处理结果。",
      riskTip: undefined,
    };
  }
  if (actionType === "人工接管") {
    return {
      actionName: "转人工接管处理",
      actionReason: "当前场景存在高风险或稳定性不足，不建议自动执行。",
      suggestionNote: resolutionState.nextStepAdvice || "建议人工接管并优先处理风险事项。",
      riskTip: "当前存在风险升级信号，请先人工接管再进入后续动作。",
    };
  }
  return {
    actionName: "确认关键字段后执行",
    actionReason: "当前动作可执行，但仍需人工确认关键字段与处理路径。",
    suggestionNote: resolutionState.nextStepAdvice || "建议确认分类与优先级后再执行。",
    riskTip: undefined,
  };
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
  const template = resolveActionTemplate(actionType, resolutionState);

  return {
    actionType,
    actionPath,
    actionName: template.actionName,
    actionReason: `${template.actionReason}（当前优先级：${
      editablePriority || finalResultState.priority || "中"
    }）${
      reviewState.currentAlert ? `（${reviewState.currentAlert}）` : ""
    }`,
    needConfirmation: actionType === "确认后执行" || actionType === "人工接管",
    suggestionNote: template.suggestionNote,
    riskTip: template.riskTip,
    canExecuteDirectly: actionType === "一键执行" || actionType === "直接归档",
    executeButtonLabel:
      actionType === "直接归档"
        ? "直接归档"
        : actionType === "一键执行"
          ? "一键执行"
          : actionType === "确认后执行"
            ? "确认后执行"
            : "转人工接管",
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

  const candidateBadcase = highRiskSignals || lowConfidenceSignals;
  const status =
    pageStage === "submitted"
      ? candidateBadcase
        ? "候选 badcase"
        : "已自动沉淀"
      : "待收尾";

  const candidateReason = candidateBadcase
    ? [
        highRiskSignals ? "当前处置进入风险升级路径" : "",
        lowConfidenceSignals ? "结果稳定性不足，建议进入候选问题样本" : "",
      ]
        .filter(Boolean)
        .join("；")
    : undefined;

  const lightFeedbackOptions = reviewState.lightFeedbackEnabled
    ? ["建议不准", "分类有误", "触发时机不对", "动作建议不合适"]
    : [];

  return {
    status,
    candidateBadcase,
    candidateReason,
    summary: reviewState.depositReason || "本次结果已纳入服务处置沉淀。",
    suggestionNote:
      status === "待收尾"
        ? "待下一步动作完成后自动沉淀。"
        : candidateBadcase
          ? "已自动标记候选问题样本，可补充轻量反馈。"
          : "本次结果已自动沉淀，可按需补充轻量反馈。",
    lightFeedbackOptions,
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
    currentSessionStatus: buildCurrentSessionStatusViewModel({
      activeCaseId,
      pageStage,
      activeTurnIndex: currentTurnIndex,
      conversationTurns,
      monitoringState,
      draftState,
      resolutionState,
    }),
    inCallSuggestion: buildInCallSuggestionViewModel({
      pageStage,
      activeCaseId,
      activeTurnIndex: currentTurnIndex,
      conversationMeta,
      monitoringState,
      resolutionState,
      reviewState,
    }),
    postDisposition: buildPostDispositionViewModel({
      pageStage,
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
