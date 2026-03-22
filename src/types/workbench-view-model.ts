import type { AnalysisMode } from "@/types/conversation";

export type ProcessingStatus =
  | "未开始"
  | "AI分析总结中"
  | "人工处理中"
  | "处理完成";

export interface TopBarViewModel {
  systemName: string;
  subtitle: string;
  moduleLabel: string;
  processingStatus: ProcessingStatus;
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
  deviceInfo?: string;
  deviceFaultCode?: string;
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
  currentStage: string;
  riskLevel: "低" | "中" | "高";
  keyFacts: string[];
  missingInfo: string[];
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

export interface NextActionViewModel {
  actionType: NextActionType;
  actionPath: NextActionPath;
  actionName: string;
  actionReason: string;
  needConfirmation: boolean;
  suggestionNote: string;
  riskTip?: string;
  canExecuteDirectly: boolean;
  executeButtonLabel: string;
  weakDisplay: boolean;
}

export type FeedbackClosureStatus = "待收尾" | "已自动沉淀" | "候选 badcase";

export interface FeedbackClosureViewModel {
  status: FeedbackClosureStatus;
  candidateBadcase: boolean;
  candidateReason?: string;
  summary: string;
  suggestionNote: string;
  lightFeedbackOptions: string[];
  weakDisplay: boolean;
}

export interface WorkbenchViewModel {
  topBar: TopBarViewModel;
  basicInfo: BasicInfoViewModel;
  conversationRounds: ConversationRoundViewModel[];
  currentSessionStatus: CurrentSessionStatusViewModel;
  inCallSuggestion: InCallSuggestionViewModel;
  postDisposition: PostDispositionViewModel;
  nextAction: NextActionViewModel;
  feedbackClosure: FeedbackClosureViewModel;
}
