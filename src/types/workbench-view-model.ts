import type { AnalysisMode } from "@/types/conversation";

export type ProcessingStatus =
  | "未开始"
  | "话中处理"
  | "话后处理"
  | "处理完成";

export interface TopBarViewModel {
  systemName: string;
  subtitle: string;
  moduleLabel: string;
  processingStatus: ProcessingStatus;
  agentStatusLabel: string;
  workflowHint: string;
  turnProgressLabel: string;
  analysisMode: AnalysisMode;
  canStepManually: boolean;
}

export interface BasicInfoViewModel {
  uidOrPhone: string;
  sessionId: string;
  channel: string;
  accessTime: string;
  queue: string;
  callDuration: string;
  customerType?: string;
  userTags: string[];
  historyRiskTags: string[];
  edgeCloud: {
    enabled: boolean;
    boundDevice?: string;
    deviceStatus?: string;
    faultCode?: string;
    latestEvent?: string;
    cloudSummary?: string;
  };
  historyConsultation: {
    hasHistory: boolean;
    lastTopic?: string;
    lastDisposition?: string;
    inboundCount?: number;
  };
}

export interface ConversationRoundViewModel {
  id: string;
  roundLabel: string;
  timestamp: string;
  customerUtterance: string;
  agentUtterance: string;
  demandDelta: string;
  emotionDelta: string;
  isKeyRound: boolean;
  isActive: boolean;
  isReached: boolean;
}

export interface CurrentSessionStatusViewModel {
  summary: string;
  currentDemand: string;
  currentEmotion: string;
  expectedMissingInfo: string[];
  judgmentBasis: {
    oneLineUnderstanding: string;
    facts: string[];
    docLinks: Array<{
      label: string;
      href: string;
    }>;
  };
}

export type InCallSuggestionType = "静默更新" | "轻提示" | "强提示";

export interface InCallSuggestionViewModel {
  suggestionType: InCallSuggestionType;
  triggerReason: string;
  handlingAdvice: string;
  needImmediateAction: boolean;
  suggestions: string[];
  weakDisplay: boolean;
}

export type InCallPromptStatus =
  | "无额外建议"
  | "存在轻度建议"
  | "强烈建议关注";

export interface InCallInsightSuggestionViewModel {
  summary: string;
  currentDemand: string;
  currentEmotion: string;
  expectedMissingInfo: string[];
  promptStatus: InCallPromptStatus;
  suggestionContent: string[];
  judgmentBasis: string;
  docLinks: Array<{
    label: string;
    href: string;
  }>;
  weakDisplay: boolean;
}

export interface PostDispositionViewModel {
  summary: string;
  archiveCategory: string;
  dispositionDraft: string;
  riskNote: string;
  followUpSuggestions: string[];
  stageLabel: string;
  isPrimary: boolean;
  weakDisplay: boolean;
  canEdit: boolean;
}

export type NextActionType = "直接归档" | "一键执行" | "确认后执行" | "人工接管";
export type NextActionPath = "标准处理路径" | "信息补问路径" | "风险升级路径";
export type NextDispositionAction = "自动归档" | "生成工单" | "升级处理" | "其他";

export interface NextActionViewModel {
  actionType: NextActionType;
  actionPath: NextActionPath;
  recommendedAction: NextDispositionAction;
  recommendedActionOptions: NextDispositionAction[];
  suggestedPriority: string;
  nextStepAdvice: string;
  recommendedReason: string;
  sopTitle: string;
  weakDisplay: boolean;
}

export interface FeedbackClosureViewModel {
  demoTitleInternal: string;
  depositToKnowledgeBase: boolean;
  fallbackToBadcase: boolean;
  weakDisplay: boolean;
}

export interface WorkbenchViewModel {
  topBar: TopBarViewModel;
  basicInfo: BasicInfoViewModel;
  conversationRounds: ConversationRoundViewModel[];
  currentSessionStatus: CurrentSessionStatusViewModel;
  inCallSuggestion: InCallSuggestionViewModel;
  inCallInsightSuggestion: InCallInsightSuggestionViewModel;
  postDisposition: PostDispositionViewModel;
  nextAction: NextActionViewModel;
  feedbackClosure: FeedbackClosureViewModel;
}
