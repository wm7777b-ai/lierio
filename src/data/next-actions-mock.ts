import type {
  NextActionPath,
  NextActionType,
} from "@/types/workbench-view-model";

interface NextActionTemplate {
  actionName: string;
  actionReason: string;
  suggestionNote: string;
  riskTip?: string;
}

type NextActionTemplateMap = Record<NextActionType, NextActionTemplate>;

const DEFAULT_TEMPLATES: NextActionTemplateMap = {
  直接归档: {
    actionName: "直接归档会话",
    actionReason: "当前会话已完成标准处理，且无需额外动作。",
    suggestionNote: "建议同步记录处理结果后直接归档。",
  },
  一键执行: {
    actionName: "一键执行标准动作",
    actionReason: "当前信息完整，且动作为标准化流程。",
    suggestionNote: "建议直接执行并自动生成处理记录。",
  },
  确认后执行: {
    actionName: "确认关键字段后执行",
    actionReason: "当前动作可执行，但仍需座席确认关键信息。",
    suggestionNote: "建议确认分类与优先级后再执行。",
  },
  人工接管: {
    actionName: "转人工接管处理",
    actionReason: "检测到风险升级，当前不建议直接自动执行。",
    suggestionNote: "建议由人工接管并优先处理风险事项。",
    riskTip: "当前存在风险升级信号，请避免直接执行自动动作。",
  },
};

const CASE_OVERRIDES: Record<string, Partial<NextActionTemplateMap>> = {
  service_case_01: {
    确认后执行: {
      actionName: "确认停催与核账路径后执行",
      actionReason: "会话进入争议收口阶段，需先确认停催与核账顺序。",
      suggestionNote: "确认处理路径后执行工单动作，避免重复触达。",
    },
    人工接管: {
      actionName: "转争议专员人工接管",
      actionReason: "会话存在投诉升级风险，需人工接管收口。",
      suggestionNote: "建议优先由争议专员接管并复核后续动作。",
      riskTip: "催收争议已升级，当前不建议直接自动执行。",
    },
  },
  outbound_case_01: {
    人工接管: {
      actionName: "转外呼合规人工接管",
      actionReason: "客户出现投诉升级表达，需人工确认后执行。",
      suggestionNote: "建议先停止触达，再由人工确认后续路径。",
      riskTip: "外呼风险已升级，需人工接管避免误执行。",
    },
  },
};

export const resolveNextActionTemplate = (
  caseId: string,
  actionType: NextActionType,
): NextActionTemplate => {
  const base = DEFAULT_TEMPLATES[actionType];
  const override = CASE_OVERRIDES[caseId]?.[actionType];
  if (!override) return base;
  return {
    ...base,
    ...override,
  };
};

export const resolvePathBySignals = ({
  highRisk,
  missingInfo,
}: {
  highRisk: boolean;
  missingInfo: boolean;
}): NextActionPath => {
  if (highRisk) return "风险升级路径";
  if (missingInfo) return "信息补问路径";
  return "标准处理路径";
};
