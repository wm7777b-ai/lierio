"use client";

import { create } from "zustand";

import type { ContactStage } from "@/types/workspace";

type WorkspaceTab = "conversation" | "insight" | "decision";

interface WorkspaceState {
  stage: ContactStage;
  activeTab: WorkspaceTab;
  selectedSuggestionId: string | null;
  draftSummary: string;
  setStage: (stage: ContactStage) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  setSelectedSuggestionId: (suggestionId: string | null) => void;
  setDraftSummary: (value: string) => void;
  resetDraft: () => void;
}

const INITIAL_DRAFT = "";

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  stage: "in-progress",
  activeTab: "conversation",
  selectedSuggestionId: null,
  draftSummary: INITIAL_DRAFT,
  setStage: (stage) => set({ stage }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedSuggestionId: (selectedSuggestionId) => set({ selectedSuggestionId }),
  setDraftSummary: (draftSummary) => set({ draftSummary }),
  resetDraft: () => set({ draftSummary: INITIAL_DRAFT }),
}));
