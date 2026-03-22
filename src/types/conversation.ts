export type PageStage =
  | "idle"
  | "monitoring"
  | "drafting"
  | "resolving"
  | "reviewing"
  | "ready"
  | "submitted";

export type ScenarioType = string;
export type AnalysisMode = "auto" | "manual";

export type EmotionLevel = "平稳" | "不满" | "激动" | "高风险";

export type RiskLevel = "低" | "中" | "高";

export type RecommendedAction = string;

export interface ConversationMeta {
  id: string;
  scenario: ScenarioType;
  channel: string;
  accessTime: string;
  queue: string;
  callDuration: string;
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
  currentDeviceStatus?: string;
  deviceFaultCode?: string;
  latestKeyEvent?: string;
  cloudUnderstandingSummary?: string;
}

export interface ConversationTurn {
  id: string;
  time: string;
  speaker: "客户" | "客服";
  text: string;
  agentText?: string;
  recognition: {
    intent: string;
    emotion: EmotionLevel;
    risk: RiskLevel;
  };
  highlight?: boolean;
}

export interface MonitoringState {
  currentIntent: string;
  emotion: EmotionLevel;
  riskSignals: string[];
  missingInfo: string[];
}

export interface DraftState {
  caseDetail: string;
  customerDemand: string;
  customerPainPoint: string;
  riskPoint: string;
  suggestedTicketTitle: string;
  suggestCreateTicket: boolean;
}

export interface FinalResultState {
  summary: string;
  category: string;
  priority: string;
  riskLevel: RiskLevel;
}

export interface ResolutionState {
  recommendedAction: RecommendedAction;
  suggestedPriority: string;
  nextStepAdvice: string;
  reason: string;
  sopTitle: string;
  escalate: boolean;
}

export interface ReviewState {
  score: number;
  confidence: "高" | "中" | "低";
  confidenceScore?: number;
  shouldFallback: boolean;
  fallbackReason: string;
  currentAlert?: string;
  depositType?: "normal_auto_deposit" | "candidate_badcase_auto_mark";
  candidateBadcase?: boolean;
  lightFeedbackEnabled?: boolean;
  depositReason?: string;
}

export interface TurnSnapshot {
  conversationSummary?: string;
  currentIntent: string;
  emotion: EmotionLevel;
  currentStage?: string;
  riskLevel: RiskLevel;
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
    recommendedAction: RecommendedAction;
    priority: string;
    nextStep: string;
  };
  review: {
    currentAlert: string;
  };
  suggestion?: {
    routeType: "silent_update" | "light_suggestion" | "strong_alert";
    triggerReason: string | null;
    currentHandlingAdvice: string;
    requiresImmediateHandling: boolean;
    suggestionContent: string[];
  };
}

export interface ConversationCase {
  case_id: string;
  scenario: ScenarioType;
  meta: ConversationMeta;
  turns: ConversationTurn[];
  snapshots: TurnSnapshot[];
  monitoring: MonitoringState;
  draft: DraftState;
  finalResult: FinalResultState;
  resolution: ResolutionState;
  review: ReviewState;
}
