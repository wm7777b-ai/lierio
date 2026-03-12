export type ContactChannel = "outbound-call" | "online-support" | "follow-up";

export type ContactStage = "in-progress" | "pending-review" | "submitted";

export interface SessionSummary {
  id: string;
  agentName: string;
  customerName: string;
  channel: ContactChannel;
  sentiment: "positive" | "neutral" | "negative";
  riskLevel: "low" | "medium" | "high";
  stage: ContactStage;
  startTime: string;
}

export interface ActionSuggestion {
  id: string;
  title: string;
  priority: "P1" | "P2" | "P3";
  description: string;
  sopCode: string;
}
