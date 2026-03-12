"use client";

import { motion } from "framer-motion";

import { ConversationTimelineCard } from "@/components/cards/conversation-timeline-card";
import { DraftCard } from "@/components/cards/draft-card";
import { HumanReviewCard } from "@/components/cards/human-review-card";
import { LiveRecognitionSummaryCard } from "@/components/cards/live-recognition-summary-card";
import { useConversationStore } from "@/store/useConversationStore";

const columnMotion = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function ThreeColumnWorkspace() {
  const pageStage = useConversationStore((state) => state.pageStage);
  const currentTurnIndex = useConversationStore((state) => state.currentTurnIndex);
  const conversationTurns = useConversationStore((state) => state.conversationTurns);
  const monitoringState = useConversationStore((state) => state.monitoringState);
  const draftState = useConversationStore((state) => state.draftState);
  const resolutionState = useConversationStore((state) => state.resolutionState);
  const reviewState = useConversationStore((state) => state.reviewState);
  const editableCaseDetail = useConversationStore((state) => state.editableCaseDetail);
  const editableCustomerDemand = useConversationStore(
    (state) => state.editableCustomerDemand,
  );
  const editableCustomerPainPoint = useConversationStore(
    (state) => state.editableCustomerPainPoint,
  );
  const editableRiskPoint = useConversationStore((state) => state.editableRiskPoint);
  const editableTicketTitle = useConversationStore((state) => state.editableTicketTitle);
  const editableCategory = useConversationStore((state) => state.editableCategory);
  const editablePriority = useConversationStore((state) => state.editablePriority);
  const updateEditableCaseDetail = useConversationStore(
    (state) => state.updateEditableCaseDetail,
  );
  const updateEditableCustomerDemand = useConversationStore(
    (state) => state.updateEditableCustomerDemand,
  );
  const updateEditableCustomerPainPoint = useConversationStore(
    (state) => state.updateEditableCustomerPainPoint,
  );
  const updateEditableRiskPoint = useConversationStore(
    (state) => state.updateEditableRiskPoint,
  );
  const updateEditableTicketTitle = useConversationStore((state) => state.updateEditableTicketTitle);
  const updateEditableCategory = useConversationStore((state) => state.updateEditableCategory);
  const updateEditablePriority = useConversationStore((state) => state.updateEditablePriority);
  const submitResult = useConversationStore((state) => state.submitResult);

  return (
    <main className="mx-auto w-full max-w-[1720px] px-5 py-4">
      <div className="grid gap-4 xl:grid-cols-[1.08fr_1.14fr_0.78fr]">
        <motion.div
          variants={columnMotion}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.2, delay: 0.02 }}
          className="space-y-4"
        >
          <LiveRecognitionSummaryCard
            monitoring={monitoringState}
            turns={conversationTurns}
            stage={pageStage}
            activeTurnIndex={currentTurnIndex}
          />
          <ConversationTimelineCard
            turns={conversationTurns}
            stage={pageStage}
            activeTurnIndex={currentTurnIndex}
          />
        </motion.div>

        <motion.div
          variants={columnMotion}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.24, delay: 0.08 }}
          className="space-y-4"
        >
          <DraftCard
            draft={draftState}
            stage={pageStage}
            caseDetail={editableCaseDetail}
            customerDemand={editableCustomerDemand}
            customerPainPoint={editableCustomerPainPoint}
            riskPoint={editableRiskPoint}
            ticketTitle={editableTicketTitle}
            onCaseDetailSave={updateEditableCaseDetail}
            onCustomerDemandSave={updateEditableCustomerDemand}
            onCustomerPainPointSave={updateEditableCustomerPainPoint}
            onRiskPointSave={updateEditableRiskPoint}
            onTicketTitleSave={updateEditableTicketTitle}
          />
        </motion.div>

        <motion.div
          variants={columnMotion}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.2, delay: 0.12 }}
          className="space-y-4"
        >
          <HumanReviewCard
            stage={pageStage}
            monitoring={monitoringState}
            resolution={resolutionState}
            reviewAlert={reviewState.currentAlert}
            category={editableCategory}
            priority={editablePriority}
            onCategoryChange={updateEditableCategory}
            onPriorityChange={updateEditablePriority}
            onSubmit={submitResult}
          />
        </motion.div>
      </div>
    </main>
  );
}
