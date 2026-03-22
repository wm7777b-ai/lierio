"use client";

import { create } from "zustand";

import { getCasesByScenario, MOCK_CASES, PAGE_STAGE_LABELS } from "@/data/mock-cases";
import type {
  AnalysisMode,
  ConversationCase,
  ConversationMeta,
  ConversationTurn,
  DraftState,
  FinalResultState,
  MonitoringState,
  PageStage,
  RiskLevel,
  ResolutionState,
  ReviewState,
  ScenarioType,
  TurnSnapshot,
} from "@/types/conversation";

interface ConversationStoreState {
  selectedScenario: ScenarioType;
  analysisMode: AnalysisMode;
  isAutoProgressing: boolean;
  pageStage: PageStage;
  currentTurnIndex: number;
  activeCaseId: string;
  conversationMeta: ConversationMeta;
  conversationTurns: ConversationTurn[];
  monitoringState: MonitoringState;
  draftState: DraftState;
  finalResultState: FinalResultState;
  resolutionState: ResolutionState;
  reviewState: ReviewState;
  editableCaseDetail: string;
  editableCustomerDemand: string;
  editableCustomerPainPoint: string;
  editableRiskPoint: string;
  editableTicketTitle: string;
  editableCategory: string;
  editablePriority: string;
  setScenario: (scenario: ScenarioType) => void;
  setAnalysisMode: (mode: AnalysisMode) => void;
  startAnalysis: () => void;
  nextTurn: () => void;
  resetPage: () => void;
  updateEditableCaseDetail: (value: string) => void;
  updateEditableCustomerDemand: (value: string) => void;
  updateEditableCustomerPainPoint: (value: string) => void;
  updateEditableRiskPoint: (value: string) => void;
  updateEditableTicketTitle: (value: string) => void;
  updateEditableCategory: (value: string) => void;
  updateEditablePriority: (value: string) => void;
  submitResult: (mode?: "ticket" | "no_followup") => void;
}

const TURN_INTERVAL_MIN_MS = 800;
const TURN_INTERVAL_MAX_MS = 1200;

let progressionTimers: ReturnType<typeof setTimeout>[] = [];

const clearProgressionTimers = () => {
  progressionTimers.forEach((timer) => clearTimeout(timer));
  progressionTimers = [];
};

const randomTurnDelay = () =>
  Math.floor(Math.random() * (TURN_INTERVAL_MAX_MS - TURN_INTERVAL_MIN_MS + 1)) +
  TURN_INTERVAL_MIN_MS;

const getScenarioDefaultCase = (scenario: ScenarioType): ConversationCase =>
  getCasesByScenario(scenario)[0] ?? MOCK_CASES[0];

const deriveRiskLevel = (riskPoint: string, fallback: RiskLevel): RiskLevel => {
  if (/高|投诉|升级|监管/.test(riskPoint)) return "高";
  if (/中|争议|不满/.test(riskPoint)) return "中";
  return fallback;
};

const resolveStageByTurn = (
  snapshot: TurnSnapshot,
  turnIndex: number,
  totalTurns: number,
): PageStage => {
  const shouldSwitchToHuman =
    snapshot.decision.shouldEscalate ||
    snapshot.emotion === "高风险" ||
    snapshot.riskLevel === "高" ||
    snapshot.riskSignals.some((item) => item.includes("投诉"));

  if (turnIndex === 0) return "monitoring";
  if (turnIndex === 1) return "drafting";
  if (turnIndex === 2) return "resolving";
  if (turnIndex >= totalTurns - 1) return "ready";
  if (turnIndex >= 3 && shouldSwitchToHuman) return "ready";
  return "reviewing";
};

const buildDraftFromSnapshot = (snapshot: TurnSnapshot): DraftState => ({
  caseDetail: snapshot.draft.caseDetail,
  customerDemand: snapshot.draft.customerDemand,
  customerPainPoint: snapshot.draft.customerPainPoint,
  riskPoint: snapshot.draft.riskPoint,
  suggestedTicketTitle: snapshot.draft.ticketTitle,
  suggestCreateTicket: true,
});

const buildMonitoringFromSnapshot = (snapshot: TurnSnapshot): MonitoringState => ({
  currentIntent: snapshot.currentIntent,
  emotion: snapshot.emotion,
  riskSignals: snapshot.riskSignals,
  missingInfo: snapshot.missingInfo,
});

const buildResolutionFromSnapshot = (
  base: ResolutionState,
  snapshot: TurnSnapshot,
): ResolutionState => ({
  ...base,
  recommendedAction: snapshot.decision.recommendedAction,
  suggestedPriority: snapshot.decision.priority,
  nextStepAdvice: snapshot.decision.nextStep,
  escalate: snapshot.decision.shouldEscalate,
});

const buildReviewFromSnapshot = (base: ReviewState, snapshot: TurnSnapshot): ReviewState => ({
  ...base,
  fallbackReason: snapshot.review.currentAlert,
  currentAlert: snapshot.review.currentAlert,
});

const buildIdleStateFromCase = (
  sourceCase: ConversationCase,
  analysisMode: AnalysisMode,
) => {
  const snapshot = sourceCase.snapshots[0];
  const monitoringState = snapshot
    ? buildMonitoringFromSnapshot(snapshot)
    : sourceCase.monitoring;
  const draftState = snapshot ? buildDraftFromSnapshot(snapshot) : sourceCase.draft;
  const resolutionState = snapshot
    ? buildResolutionFromSnapshot(sourceCase.resolution, snapshot)
    : sourceCase.resolution;
  const reviewState = snapshot
    ? buildReviewFromSnapshot(sourceCase.review, snapshot)
    : sourceCase.review;

  return {
    selectedScenario: sourceCase.scenario,
    analysisMode,
    isAutoProgressing: false,
    activeCaseId: sourceCase.case_id,
    pageStage: "idle" as const,
    currentTurnIndex: -1,
    conversationMeta: {
      ...sourceCase.meta,
      currentStatus: PAGE_STAGE_LABELS.idle,
      callDuration: sourceCase.meta.callDuration,
    },
    conversationTurns: sourceCase.turns,
    monitoringState,
    draftState,
    finalResultState: sourceCase.finalResult,
    resolutionState,
    reviewState,
    editableCaseDetail: draftState.caseDetail,
    editableCustomerDemand: draftState.customerDemand,
    editableCustomerPainPoint: draftState.customerPainPoint,
    editableRiskPoint: draftState.riskPoint,
    editableTicketTitle: draftState.suggestedTicketTitle,
    editableCategory: sourceCase.finalResult.category,
    editablePriority: sourceCase.finalResult.priority,
  };
};

const applySnapshotByIndex = (
  set: (
    partial:
      | Partial<ConversationStoreState>
      | ((state: ConversationStoreState) => Partial<ConversationStoreState>),
  ) => void,
  get: () => ConversationStoreState,
  turnIndex: number,
) => {
  const sourceCase = getScenarioDefaultCase(get().selectedScenario);
  const maxIndex = Math.max(0, sourceCase.snapshots.length - 1);
  const clampedIndex = Math.max(0, Math.min(turnIndex, maxIndex));
  const snapshot = sourceCase.snapshots[clampedIndex];
  if (!snapshot) return;

  const nextStage = resolveStageByTurn(snapshot, clampedIndex, sourceCase.snapshots.length);
  const nextDraft = buildDraftFromSnapshot(snapshot);
  const nextMonitoring = buildMonitoringFromSnapshot(snapshot);
  const nextResolution = buildResolutionFromSnapshot(sourceCase.resolution, snapshot);
  const nextReview = buildReviewFromSnapshot(sourceCase.review, snapshot);

  set((state) => ({
    activeCaseId: sourceCase.case_id,
    pageStage: nextStage,
    currentTurnIndex: clampedIndex,
    conversationMeta: {
      ...state.conversationMeta,
      ...sourceCase.meta,
      currentStatus: PAGE_STAGE_LABELS[nextStage],
      callDuration: sourceCase.meta.callDuration,
    },
    conversationTurns: sourceCase.turns,
    monitoringState: nextMonitoring,
    draftState: nextDraft,
    resolutionState: nextResolution,
    reviewState: nextReview,
    editableCaseDetail: nextDraft.caseDetail,
    editableCustomerDemand: nextDraft.customerDemand,
    editableCustomerPainPoint: nextDraft.customerPainPoint,
    editableRiskPoint: nextDraft.riskPoint,
    editableTicketTitle: nextDraft.suggestedTicketTitle,
    editablePriority: nextResolution.suggestedPriority,
    isAutoProgressing: state.isAutoProgressing && clampedIndex < maxIndex,
  }));
};

const initialCase = getScenarioDefaultCase(MOCK_CASES[0]?.scenario ?? "");

export const useConversationStore = create<ConversationStoreState>((set, get) => ({
  ...buildIdleStateFromCase(initialCase, "auto"),

  setScenario: (selectedScenario) => {
    clearProgressionTimers();
    const nextCase = getScenarioDefaultCase(selectedScenario);
    set({
      ...buildIdleStateFromCase(nextCase, get().analysisMode),
      selectedScenario,
    });
  },

  setAnalysisMode: (analysisMode) => {
    clearProgressionTimers();
    set({ analysisMode, isAutoProgressing: false });
  },

  startAnalysis: () => {
    clearProgressionTimers();
    const sourceCase = getScenarioDefaultCase(get().selectedScenario);
    const currentMode = get().analysisMode;
    const maxIndex = Math.max(0, sourceCase.snapshots.length - 1);

    set({
      ...buildIdleStateFromCase(sourceCase, currentMode),
      isAutoProgressing: currentMode === "auto" && maxIndex > 0,
    });

    applySnapshotByIndex(set, get, 0);

    if (currentMode === "manual" || maxIndex <= 0) {
      set({ isAutoProgressing: false });
      return;
    }

    let elapsed = 0;
    for (let index = 1; index <= maxIndex; index += 1) {
      elapsed += randomTurnDelay();
      const timer = setTimeout(() => {
        applySnapshotByIndex(set, get, index);
      }, elapsed);
      progressionTimers.push(timer);
    }
  },

  nextTurn: () => {
    clearProgressionTimers();
    const sourceCase = getScenarioDefaultCase(get().selectedScenario);
    const maxIndex = Math.max(0, sourceCase.snapshots.length - 1);
    const currentIndex = get().currentTurnIndex;
    const nextIndex =
      currentIndex < 0 ? 0 : Math.max(0, Math.min(currentIndex + 1, maxIndex));
    set({ isAutoProgressing: false });
    applySnapshotByIndex(set, get, nextIndex);
  },

  resetPage: () => {
    clearProgressionTimers();
    const sourceCase = getScenarioDefaultCase(get().selectedScenario);
    set({
      ...buildIdleStateFromCase(sourceCase, get().analysisMode),
      selectedScenario: get().selectedScenario,
    });
  },

  updateEditableCaseDetail: (value) => set({ editableCaseDetail: value }),
  updateEditableCustomerDemand: (value) => set({ editableCustomerDemand: value }),
  updateEditableCustomerPainPoint: (value) => set({ editableCustomerPainPoint: value }),
  updateEditableRiskPoint: (value) => set({ editableRiskPoint: value }),
  updateEditableTicketTitle: (value) => set({ editableTicketTitle: value }),
  updateEditableCategory: (value) => set({ editableCategory: value }),
  updateEditablePriority: (value) => set({ editablePriority: value }),

  submitResult: (mode = "ticket") => {
    clearProgressionTimers();
    const currentMeta = get().conversationMeta;
    const noFollowUp = mode === "no_followup";
    const nextCategory = noFollowUp ? "无需跟进" : get().editableCategory;
    const nextPriority = noFollowUp ? "低" : get().editablePriority;
    const nextRiskLevel = deriveRiskLevel(
      get().editableRiskPoint,
      get().finalResultState.riskLevel,
    );

    set({
      isAutoProgressing: false,
      pageStage: "submitted",
      conversationMeta: {
        ...currentMeta,
        currentStatus: PAGE_STAGE_LABELS.submitted,
      },
      finalResultState: {
        ...get().finalResultState,
        summary: get().editableCaseDetail,
        category: nextCategory,
        priority: nextPriority,
        riskLevel: nextRiskLevel,
      },
      draftState: {
        ...get().draftState,
        caseDetail: get().editableCaseDetail,
        customerDemand: get().editableCustomerDemand,
        customerPainPoint: get().editableCustomerPainPoint,
        riskPoint: get().editableRiskPoint,
        suggestedTicketTitle: get().editableTicketTitle,
      },
    });
  },
}));
