import type { PageStage } from "@/types/conversation";

const STAGE_ORDER: Record<PageStage, number> = {
  idle: 0,
  monitoring: 1,
  drafting: 2,
  resolving: 3,
  reviewing: 4,
  ready: 5,
  submitted: 6,
};

export const hasReachedStage = (current: PageStage, target: PageStage) =>
  STAGE_ORDER[current] >= STAGE_ORDER[target];

export const getStageOrder = (stage: PageStage) => STAGE_ORDER[stage];
