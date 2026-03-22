export type InCallSuggestionBranch = "silent" | "light" | "strong";

export interface InCallSuggestionMockItem {
  branch: InCallSuggestionBranch;
  triggerReason: string;
  handlingAdvice: string;
  needImmediateAction: boolean;
  suggestions: string[];
  useHistoryContext?: boolean;
}

const IN_CALL_SUGGESTION_MOCK: Record<string, InCallSuggestionMockItem[]> = {
  service_case_01: [
    {
      branch: "silent",
      triggerReason: "会话刚进入核验阶段，风险暂未放大。",
      handlingAdvice: "先保持核验流程，静默更新即可。",
      needImmediateAction: false,
      suggestions: ["持续记录客户诉求，等待更多明确信号。"],
    },
    {
      branch: "light",
      triggerReason: "客户开始明确催收争议，进入关键节点。",
      handlingAdvice: "建议补问关键账务信息，确认处理路径。",
      needImmediateAction: false,
      suggestions: [
        "建议补问：还款时间与账单编号。",
        "建议确认：是否仍收到催收短信。",
      ],
      useHistoryContext: true,
    },
    {
      branch: "light",
      triggerReason: "诉求已转向停止催收，处理方向需要收敛。",
      handlingAdvice: "建议先安抚，再确认停催与核账顺序。",
      needImmediateAction: false,
      suggestions: [
        "建议确认当前处理路径：停催优先还是核账优先。",
        "建议记录客户可接受的回告时点。",
      ],
      useHistoryContext: true,
    },
    {
      branch: "strong",
      triggerReason: "检测到投诉倾向，风险出现升级信号。",
      handlingAdvice: "当前需优先稳态沟通并准备人工介入。",
      needImmediateAction: true,
      suggestions: [
        "需座席当下处理：明确告知停催动作与处理时限。",
        "建议同步专员关注，避免继续触达引发升级。",
      ],
      useHistoryContext: true,
    },
    {
      branch: "strong",
      triggerReason: "客户已明确投诉表述，处置进入高风险阶段。",
      handlingAdvice: "需立即执行高优先级处置。",
      needImmediateAction: true,
      suggestions: [
        "需座席当下处理：立即确认停催并说明后续路径。",
        "建议同步人工复核后提交工单。",
      ],
      useHistoryContext: true,
    },
  ],
  outbound_case_01: [
    {
      branch: "silent",
      triggerReason: "回访刚开始，暂未进入冲突节点。",
      handlingAdvice: "先保持标准沟通，静默更新即可。",
      needImmediateAction: false,
      suggestions: ["记录客户当前态度，观察是否出现拒接升级。"],
    },
    {
      branch: "light",
      triggerReason: "客户明确表达不希望继续被联系。",
      handlingAdvice: "建议先确认停呼意愿和边界。",
      needImmediateAction: false,
      suggestions: [
        "建议补问：是否接受后续一次性确认回访。",
        "建议确认：客户希望的触达边界。",
      ],
      useHistoryContext: true,
    },
    {
      branch: "light",
      triggerReason: "负向反馈增强，需校准外呼策略。",
      handlingAdvice: "建议降低触达频率并明确后续安排。",
      needImmediateAction: false,
      suggestions: [
        "建议确认当前处理方向：降频触达或立即停呼。",
        "建议补录拒接原因，便于后续策略调整。",
      ],
      useHistoryContext: true,
    },
    {
      branch: "strong",
      triggerReason: "客户已出现“继续联系将投诉”的升级表达。",
      handlingAdvice: "当前需优先处理风险，避免继续刺激。",
      needImmediateAction: true,
      suggestions: [
        "需座席当下处理：明确停止高频触达。",
        "建议快速转人工关注并确认停呼执行。",
      ],
      useHistoryContext: true,
    },
    {
      branch: "strong",
      triggerReason: "会话进入高风险投诉区间。",
      handlingAdvice: "需立即执行合规优先处置。",
      needImmediateAction: true,
      suggestions: [
        "需座席当下处理：停止触达并同步高优先级工单。",
        "建议人工复核后再进入后续动作。",
      ],
      useHistoryContext: true,
    },
  ],
};

export const getInCallSuggestionByTurn = (
  caseId: string,
  turnIndex: number,
): InCallSuggestionMockItem | undefined => {
  const turns = IN_CALL_SUGGESTION_MOCK[caseId];
  if (!turns || turns.length === 0) return undefined;

  const normalizedIndex = Math.max(0, Math.min(turnIndex, turns.length - 1));
  return turns[normalizedIndex];
};
