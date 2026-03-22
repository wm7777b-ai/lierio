"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { buildWorkbenchViewModel } from "@/adapters/workbench-adapter";
import { ConversationTimelineCard } from "@/components/cards/conversation-timeline-card";
import { FeedbackClosureCard } from "@/components/cards/feedback-closure-card";
import { InCallSuggestionCard } from "@/components/cards/in-call-suggestion-card";
import { LiveRecognitionSummaryCard } from "@/components/cards/live-recognition-summary-card";
import { NextActionCard } from "@/components/cards/next-action-card";
import { PostDispositionCard } from "@/components/cards/post-disposition-card";
import { useConversationStore } from "@/store/useConversationStore";
import type { NextActionType } from "@/types/workbench-view-model";

const columnMotion = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function ThreeColumnWorkspace() {
  const activeCaseId = useConversationStore((state) => state.activeCaseId);
  const pageStage = useConversationStore((state) => state.pageStage);
  const currentTurnIndex = useConversationStore((state) => state.currentTurnIndex);
  const conversationTurns = useConversationStore((state) => state.conversationTurns);
  const conversationMeta = useConversationStore((state) => state.conversationMeta);
  const monitoringState = useConversationStore((state) => state.monitoringState);
  const draftState = useConversationStore((state) => state.draftState);
  const finalResultState = useConversationStore((state) => state.finalResultState);
  const resolutionState = useConversationStore((state) => state.resolutionState);
  const reviewState = useConversationStore((state) => state.reviewState);
  const analysisMode = useConversationStore((state) => state.analysisMode);
  const editableCaseDetail = useConversationStore((state) => state.editableCaseDetail);
  const editableRiskPoint = useConversationStore((state) => state.editableRiskPoint);
  const editableCategory = useConversationStore((state) => state.editableCategory);
  const editablePriority = useConversationStore((state) => state.editablePriority);
  const updateEditableCaseDetail = useConversationStore(
    (state) => state.updateEditableCaseDetail,
  );
  const updateEditableRiskPoint = useConversationStore(
    (state) => state.updateEditableRiskPoint,
  );
  const updateEditableCategory = useConversationStore((state) => state.updateEditableCategory);
  const submitResult = useConversationStore((state) => state.submitResult);
  const [executedCaseId, setExecutedCaseId] = useState<string | null>(null);
  const actionExecuted = pageStage === "submitted" && executedCaseId === activeCaseId;
  const postSessionFocus = pageStage === "ready" || pageStage === "submitted";

  const handleExecuteNextAction = (actionType: NextActionType) => {
    setExecutedCaseId(activeCaseId);
    if (actionType === "直接归档") {
      submitResult("no_followup");
      return;
    }
    submitResult("ticket");
  };

  const viewModel = buildWorkbenchViewModel({
    pageStage,
    analysisMode,
    currentTurnIndex,
    totalTurns: conversationTurns.length,
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
  });

  return (
    <main className="mx-auto w-full max-w-[1720px] px-5 py-4">
      <div className="grid gap-4 xl:grid-cols-[1.08fr_1.14fr_0.78fr]">
        <motion.div
          variants={columnMotion}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.2, delay: 0.02 }}
          className={
            postSessionFocus
              ? "space-y-4 opacity-90 transition-opacity"
              : "space-y-4 opacity-100 transition-opacity"
          }
        >
          <LiveRecognitionSummaryCard
            stage={pageStage}
            status={viewModel.currentSessionStatus}
          />
          <ConversationTimelineCard
            rounds={viewModel.conversationRounds}
            stage={pageStage}
          />
        </motion.div>

        <motion.div
          variants={columnMotion}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.24, delay: 0.08 }}
          className={
            postSessionFocus
              ? "space-y-4 opacity-100 transition-opacity"
              : "space-y-4 opacity-100 transition-opacity"
          }
        >
          <InCallSuggestionCard
            stage={pageStage}
            suggestion={viewModel.inCallSuggestion}
          />
          <PostDispositionCard
            stage={pageStage}
            disposition={viewModel.postDisposition}
            onSummarySave={updateEditableCaseDetail}
            onCategorySave={updateEditableCategory}
            onDraftSave={updateEditableCaseDetail}
            onRiskNoteSave={updateEditableRiskPoint}
          />
        </motion.div>

        <motion.div
          variants={columnMotion}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.2, delay: 0.12 }}
          className={
            postSessionFocus
              ? "space-y-4 opacity-100 transition-opacity"
              : "space-y-4 opacity-95 transition-opacity"
          }
        >
          <NextActionCard
            stage={pageStage}
            nextAction={viewModel.nextAction}
            onExecute={handleExecuteNextAction}
          />
          <FeedbackClosureCard
            key={`${activeCaseId}:${actionExecuted ? "done" : "pending"}`}
            stage={pageStage}
            feedbackClosure={viewModel.feedbackClosure}
            actionExecuted={actionExecuted}
          />
        </motion.div>
      </div>
    </main>
  );
}
