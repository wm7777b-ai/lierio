export type PageStage =
  | "idle"
  | "monitoring"
  | "drafting"
  | "resolving"
  | "reviewing"
  | "ready"
  | "submitted";

export type ScenarioType = "service" | "outbound";
export type AnalysisMode = "auto" | "manual";

export type EmotionLevel = "平稳" | "不满" | "激动" | "高风险";

export type RiskLevel = "低" | "中" | "高";

export type RecommendedAction =
  | "继续标准处理"
  | "优先安抚并建单"
  | "升级人工关注"
  | "建议高优先级跟进";

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
}

export interface ConversationTurn {
  id: string;
  time: string;
  speaker: "客户" | "客服";
  text: string;
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
  shouldFallback: boolean;
  fallbackReason: string;
  currentAlert?: string;
}

export interface TurnSnapshot {
  currentIntent: string;
  emotion: EmotionLevel;
  riskLevel: RiskLevel;
  riskSignals: string[];
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
