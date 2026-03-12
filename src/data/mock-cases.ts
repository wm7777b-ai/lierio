import type {
  ConversationCase,
  PageStage,
  ScenarioType,
} from "@/types/conversation";

export const PAGE_STAGE_FLOW: PageStage[] = [
  "idle",
  "monitoring",
  "drafting",
  "resolving",
  "reviewing",
  "ready",
];

export const PAGE_STAGE_LABELS: Record<PageStage, string> = {
  idle: "未开始分析",
  monitoring: "会中监测中",
  drafting: "草稿生成中",
  resolving: "处置建议生成中",
  reviewing: "质量评估中",
  ready: "待人工确认",
  submitted: "已提交",
};

export const AGENT_CURRENT_STATUS_LABELS: Record<PageStage, string> = {
  idle: "待启动",
  monitoring: "理解中",
  drafting: "草稿生成中",
  resolving: "处置建议生成中",
  reviewing: "审查确认中",
  ready: "审查完成",
  submitted: "已提交",
};

export const AGENT_FLOW_ITEMS = [
  {
    key: "understanding",
    enLabel: "Understanding Agent",
    zhLabel: "会话理解",
    gate: "monitoring" as const,
  },
  {
    key: "drafting",
    enLabel: "Drafting Agent",
    zhLabel: "草稿生成",
    gate: "drafting" as const,
  },
  {
    key: "resolution",
    enLabel: "Resolution Agent",
    zhLabel: "处置建议",
    gate: "resolving" as const,
  },
  {
    key: "review",
    enLabel: "Review Agent",
    zhLabel: "审查确认",
    gate: "reviewing" as const,
  },
];

export const SCENARIO_LABELS: Record<ScenarioType, string> = {
  service: "客服",
  outbound: "外呼",
};

export const CATEGORY_OPTIONS = [
  "催收争议",
  "外呼投诉风险",
  "服务质量反馈",
  "其他待人工确认",
];

export const PRIORITY_OPTIONS = ["高", "中", "低"];

export const MOCK_CASES: ConversationCase[] = [
  {
    case_id: "service_case_01",
    scenario: "service",
    meta: {
      id: "SRV-20260312-001",
      scenario: "service",
      channel: "电话客服",
      accessTime: "2026-03-12 20:31",
      queue: "账单争议队列",
      callDuration: "03:42",
      customerType: "高账龄客户",
      customerTags: ["历史账单争议", "高账龄客户"],
      historyTags: ["近期投诉倾向"],
      currentStatus: "会中监测中",
    },
    turns: [
      {
        id: "t1",
        time: "00:03",
        speaker: "客户",
        text: "我上周已经还款了，为什么还在发催收短信？",
        recognition: {
          intent: "账单确认",
          emotion: "平稳",
          risk: "低",
        },
        highlight: true,
      },
      {
        id: "t2",
        time: "00:10",
        speaker: "客服",
        text: "我先帮您核实还款记录和短信触达状态。",
        recognition: {
          intent: "催收争议",
          emotion: "平稳",
          risk: "低",
        },
      },
      {
        id: "t3",
        time: "00:19",
        speaker: "客户",
        text: "我已经确认还了，你们继续催收就是对账单有问题。",
        recognition: {
          intent: "催收争议",
          emotion: "不满",
          risk: "中",
        },
        highlight: true,
      },
      {
        id: "t4",
        time: "00:27",
        speaker: "客服",
        text: "理解您的感受，我先为您登记停催并提交核账处理。",
        recognition: {
          intent: "停止催收",
          emotion: "激动",
          risk: "中",
        },
      },
      {
        id: "t5",
        time: "00:35",
        speaker: "客户",
        text: "如果你们今天还联系我，我就正式投诉你们。",
        recognition: {
          intent: "投诉倾向",
          emotion: "高风险",
          risk: "高",
        },
        highlight: true,
      },
    ],
    snapshots: [
      {
        currentIntent: "账单确认",
        emotion: "平稳",
        riskLevel: "低",
        riskSignals: ["已还款疑问"],
        missingInfo: ["还款时间", "账单编号", "短信触达时间"],
        draft: {
          caseDetail: "客户表示已完成还款，但仍收到催收短信，当前希望先核验账务状态。",
          customerDemand: "核实还款是否已入账",
          customerPainPoint: "已还款仍收到催收短信",
          riskPoint: "沟通误触风险",
          ticketTitle: "客户反馈已还款待核实催收短信",
        },
        decision: {
          shouldEscalate: false,
          recommendedAction: "继续标准处理",
          priority: "中",
          nextStep: "先核验还款流水并向客户回告核验结果。",
        },
        review: {
          currentAlert: "需补齐基础账务信息。",
        },
      },
      {
        currentIntent: "催收争议",
        emotion: "平稳",
        riskLevel: "低",
        riskSignals: ["催收争议苗头"],
        missingInfo: ["还款时间", "账单编号"],
        draft: {
          caseDetail: "客服开始核验还款记录，客户进一步强调催收触达不合理，争议点已形成。",
          customerDemand: "核对账单并解释催收触达原因",
          customerPainPoint: "重复触达造成困扰",
          riskPoint: "争议升级风险",
          ticketTitle: "催收触达争议待核验账单",
        },
        decision: {
          shouldEscalate: false,
          recommendedAction: "继续标准处理",
          priority: "中",
          nextStep: "确认催收策略是否命中并告知客户处理时点。",
        },
        review: {
          currentAlert: "建议尽快补齐账单编号。",
        },
      },
      {
        currentIntent: "停止催收",
        emotion: "不满",
        riskLevel: "中",
        riskSignals: ["催收争议", "情绪升温"],
        missingInfo: ["账单编号"],
        draft: {
          caseDetail: "客户明确提出继续催收属于错误触达，要求停止催收并给出清晰解释，情绪转为不满。",
          customerDemand: "停止催收并完成账单核查",
          customerPainPoint: "解释不充分、触达频率高",
          riskPoint: "投诉倾向前兆",
          ticketTitle: "客户要求停止催收并核账",
        },
        decision: {
          shouldEscalate: false,
          recommendedAction: "建议高优先级跟进",
          priority: "高",
          nextStep: "先安抚客户并登记停催申请，准备人工接入。",
        },
        review: {
          currentAlert: "建议重点关注并准备人工介入。",
        },
      },
      {
        currentIntent: "投诉倾向",
        emotion: "激动",
        riskLevel: "中",
        riskSignals: ["投诉倾向", "要求停止联系"],
        missingInfo: ["账单编号"],
        draft: {
          caseDetail: "客户情绪明显激动，已提出如果继续触达将投诉，需立即转入安抚与建单流程。",
          customerDemand: "立刻停催并给出明确处理结果",
          customerPainPoint: "持续触达影响生活",
          riskPoint: "投诉升级风险",
          ticketTitle: "客户情绪激动并提出投诉倾向，需停催建单",
        },
        decision: {
          shouldEscalate: true,
          recommendedAction: "优先安抚并建单",
          priority: "高",
          nextStep: "立即停催并升级专员回访，进入争议工单流转。",
        },
        review: {
          currentAlert: "已触发人工处理条件。",
        },
      },
      {
        currentIntent: "投诉倾向",
        emotion: "高风险",
        riskLevel: "高",
        riskSignals: ["明确投诉表述", "催收争议升级"],
        missingInfo: ["账单编号"],
        draft: {
          caseDetail: "客户明确表示将正式投诉，风险升至高位，建议立即完成停催、建单与人工复核。",
          customerDemand: "停止全部催收触达并给出正式解释",
          customerPainPoint: "持续误催导致强烈不满",
          riskPoint: "高风险投诉升级",
          ticketTitle: "已还款仍被催收且明确投诉，需高优先级处置",
        },
        decision: {
          shouldEscalate: true,
          recommendedAction: "优先安抚并建单",
          priority: "高",
          nextStep: "停催 + 建单 + 人工复核后提交处置结果。",
        },
        review: {
          currentAlert: "高风险，建议立即提交工单并人工复核。",
        },
      },
    ],
    monitoring: {
      currentIntent: "账单/催收争议",
      emotion: "激动",
      riskSignals: ["投诉倾向", "催收争议"],
      missingInfo: ["还款时间", "账单编号"],
    },
    draft: {
      caseDetail:
        "客户反馈在已还款情况下仍持续收到催收短信，情绪逐步升级，明确要求核账并停止后续催收触达，已出现投诉倾向。",
      customerDemand: "立即停止催收并完成账单核查",
      customerPainPoint: "已还款仍被催收、解释不清、触达频繁",
      riskPoint: "投诉升级风险、停催时效风险",
      suggestedTicketTitle: "已还款仍被催收，申请核账并停催",
      suggestCreateTicket: true,
    },
    finalResult: {
      summary: "客户反馈已还款但仍收到催收提醒，要求停止催收并核查账单，存在投诉升级风险。",
      category: "催收争议",
      priority: "高",
      riskLevel: "高",
    },
    resolution: {
      recommendedAction: "优先安抚并建单",
      suggestedPriority: "高",
      nextStepAdvice: "停止后续催收触达，优先核账并由专员回访客户。",
      reason: "存在催收争议且客户情绪升级，需优先安抚并进入后续核账流程。",
      sopTitle: "催收争议场景处置SOP",
      escalate: true,
    },
    review: {
      score: 78,
      confidence: "中",
      shouldFallback: true,
      fallbackReason: "关键信息尚未齐全，建议人工确认后提交。",
    },
  },
  {
    case_id: "outbound_case_01",
    scenario: "outbound",
    meta: {
      id: "OUT-20260312-002",
      scenario: "outbound",
      channel: "外呼回访",
      accessTime: "2026-03-12 21:08",
      queue: "外呼合规回访队列",
      callDuration: "02:57",
      customerType: "账期敏感用户",
      customerTags: ["近期频繁触达", "账期敏感用户"],
      historyTags: ["负向反馈记录"],
      currentStatus: "会中监测中",
    },
    turns: [
      {
        id: "t1",
        time: "00:02",
        speaker: "客服",
        text: "您好，这边是账务服务中心，想确认一下近期账单处理情况。",
        recognition: {
          intent: "账务回访",
          emotion: "平稳",
          risk: "低",
        },
      },
      {
        id: "t2",
        time: "00:08",
        speaker: "客户",
        text: "我之前已经说过，不希望继续被外呼联系。",
        recognition: {
          intent: "停止联系",
          emotion: "不满",
          risk: "低",
        },
        highlight: true,
      },
      {
        id: "t3",
        time: "00:14",
        speaker: "客服",
        text: "抱歉给您带来困扰，我这边想确认是否需要立即停呼。",
        recognition: {
          intent: "外呼确认",
          emotion: "不满",
          risk: "中",
        },
      },
      {
        id: "t4",
        time: "00:20",
        speaker: "客户",
        text: "如果还继续联系，我就会去投诉你们。",
        recognition: {
          intent: "投诉倾向",
          emotion: "激动",
          risk: "中",
        },
        highlight: true,
      },
      {
        id: "t5",
        time: "00:27",
        speaker: "客户",
        text: "再打我就直接向监管投诉，别再联系我了。",
        recognition: {
          intent: "投诉倾向",
          emotion: "高风险",
          risk: "高",
        },
        highlight: true,
      },
    ],
    snapshots: [
      {
        currentIntent: "账务回访",
        emotion: "平稳",
        riskLevel: "低",
        riskSignals: ["首次拒接信号"],
        missingInfo: ["是否已解决历史问题", "可联系时段"],
        draft: {
          caseDetail: "客服发起常规账务回访，客户反馈意愿较弱，需先确认历史问题状态。",
          customerDemand: "减少无效回访",
          customerPainPoint: "被反复联系",
          riskPoint: "触达体验下降风险",
          ticketTitle: "外呼回访触达意愿待确认",
        },
        decision: {
          shouldEscalate: false,
          recommendedAction: "继续标准处理",
          priority: "中",
          nextStep: "确认客户当前问题是否已解决并更新回访策略。",
        },
        review: {
          currentAlert: "先确认基础回访信息。",
        },
      },
      {
        currentIntent: "停止联系",
        emotion: "不满",
        riskLevel: "低",
        riskSignals: ["明确拒绝继续触达"],
        missingInfo: ["停呼意愿确认", "历史问题状态"],
        draft: {
          caseDetail: "客户表达不希望继续被外呼联系，情绪出现不满，建议降低触达频率。",
          customerDemand: "减少或停止外呼",
          customerPainPoint: "频繁回访打扰",
          riskPoint: "负向反馈累计风险",
          ticketTitle: "客户表达拒接意愿，建议调整触达策略",
        },
        decision: {
          shouldEscalate: false,
          recommendedAction: "继续标准处理",
          priority: "中",
          nextStep: "再次确认是否永久停呼，并记录拒接原因。",
        },
        review: {
          currentAlert: "建议记录拒接原因。",
        },
      },
      {
        currentIntent: "外呼拒接/投诉风险",
        emotion: "不满",
        riskLevel: "中",
        riskSignals: ["拒接升级", "负向反馈"],
        missingInfo: ["是否同意后续回访"],
        draft: {
          caseDetail: "客户连续表达拒接态度，负向反馈增强，外呼策略需转入重点关注。",
          customerDemand: "停止高频触达",
          customerPainPoint: "沟通体验差",
          riskPoint: "投诉风险上升",
          ticketTitle: "客户拒接升级，需重点关注外呼策略",
        },
        decision: {
          shouldEscalate: false,
          recommendedAction: "建议高优先级跟进",
          priority: "中",
          nextStep: "降低触达频率并准备人工关注方案。",
        },
        review: {
          currentAlert: "需准备投诉预案。",
        },
      },
      {
        currentIntent: "投诉倾向",
        emotion: "激动",
        riskLevel: "中",
        riskSignals: ["若继续联系将投诉"],
        missingInfo: ["停呼确认"],
        draft: {
          caseDetail: "客户明确提出继续联系将投诉，情绪转激动，建议立即暂停标准外呼并转人工处理。",
          customerDemand: "立即停止外呼联系",
          customerPainPoint: "持续触达引发强烈反感",
          riskPoint: "投诉升级风险",
          ticketTitle: "客户提出投诉倾向，建议暂停外呼并升级处理",
        },
        decision: {
          shouldEscalate: true,
          recommendedAction: "升级人工关注",
          priority: "高",
          nextStep: "立即暂停外呼，转专员介入确认停呼。",
        },
        review: {
          currentAlert: "触发升级关注条件。",
        },
      },
      {
        currentIntent: "投诉倾向",
        emotion: "高风险",
        riskLevel: "高",
        riskSignals: ["明确监管投诉倾向", "强烈拒绝触达"],
        missingInfo: ["停呼执行回执"],
        draft: {
          caseDetail: "客户已进入高风险投诉状态，需停止外呼并提交高优先级工单，人工复核后执行。",
          customerDemand: "停止所有外呼触达",
          customerPainPoint: "反复触达造成严重反感",
          riskPoint: "高风险投诉与合规风险",
          ticketTitle: "外呼触达触发高风险投诉，需立即停呼建单",
        },
        decision: {
          shouldEscalate: true,
          recommendedAction: "升级人工关注",
          priority: "高",
          nextStep: "停止外呼并提交高优先级工单，由人工确认后处置。",
        },
        review: {
          currentAlert: "高风险，必须人工确认后处置。",
        },
      },
    ],
    monitoring: {
      currentIntent: "外呼拒接/投诉风险",
      emotion: "高风险",
      riskSignals: ["明确拒绝继续触达", "投诉倾向"],
      missingInfo: ["是否确认历史问题已解决"],
    },
    draft: {
      caseDetail:
        "客户对持续外呼表现明显不满，沟通中多次强调不要继续联系，末轮明确提出若继续触达将进行投诉，风险已升级。",
      customerDemand: "立即停止外呼联系",
      customerPainPoint: "频繁触达造成困扰、沟通体验差",
      riskPoint: "投诉风险、触达合规风险",
      suggestedTicketTitle: "客户拒绝继续外呼，存在投诉风险",
      suggestCreateTicket: true,
    },
    finalResult: {
      summary: "客户明确拒绝继续外呼，并表示若持续触达将投诉，建议停止标准外呼策略并升级关注。",
      category: "外呼投诉风险",
      priority: "高",
      riskLevel: "高",
    },
    resolution: {
      recommendedAction: "升级人工关注",
      suggestedPriority: "高",
      nextStepAdvice: "立即停止标准外呼策略，转专员一对一回访并确认停呼。",
      reason: "客户明确拒绝继续外呼并出现投诉倾向，建议停止标准触达并升级人工处理。",
      sopTitle: "外呼投诉风险处置SOP",
      escalate: true,
    },
    review: {
      score: 72,
      confidence: "中",
      shouldFallback: true,
      fallbackReason: "涉及投诉风险，必须人工确认后决定是否建单和停呼。",
    },
  },
];

export const getCasesByScenario = (scenario: ScenarioType) =>
  MOCK_CASES.filter((item) => item.scenario === scenario);
