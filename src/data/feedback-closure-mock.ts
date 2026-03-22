const LIGHT_FEEDBACK_OPTIONS = [
  "建议不准",
  "分类有误",
  "触发时机不对",
  "动作建议不合适",
];

const CASE_SUMMARY_NOTES: Record<string, string> = {
  service_case_01: "本次会话已进入争议处置链路，建议持续跟踪后续回告结果。",
  outbound_case_01: "本次会话涉及触达风险，建议在后续回访前先校准策略。",
};

export const getFeedbackLightOptions = () => LIGHT_FEEDBACK_OPTIONS;

export const getFeedbackSummaryNote = (caseId: string) =>
  CASE_SUMMARY_NOTES[caseId] || "本次结果已纳入服务处置沉淀。";
