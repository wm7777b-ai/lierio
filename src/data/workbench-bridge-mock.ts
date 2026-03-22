interface SessionBridgeMeta {
  uidOrPhone: string;
  deviceInfo?: string;
  deviceFaultCode?: string;
  historyConsultation: {
    hasHistory: boolean;
    lastTopic?: string;
    lastDisposition?: string;
    inboundCount?: number;
  };
}

const BRIDGE_META_BY_CASE_ID: Record<string, SessionBridgeMeta> = {
  service_case_01: {
    uidOrPhone: "138****6621",
    deviceInfo: "iOS 17 / App 5.3.2",
    deviceFaultCode: "暂未上报码",
    historyConsultation: {
      hasHistory: true,
      lastTopic: "账单催收争议",
      lastDisposition: "登记核账并建议停催",
      inboundCount: 3,
    },
  },
  outbound_case_01: {
    uidOrPhone: "UID-OUT-20981",
    deviceInfo: "Android 15 / App 5.2.9",
    deviceFaultCode: "设备码待回传",
    historyConsultation: {
      hasHistory: true,
      lastTopic: "外呼频次投诉",
      lastDisposition: "降频触达并人工回访",
      inboundCount: 2,
    },
  },
};

export const getBridgeMetaByCaseId = (caseId: string): SessionBridgeMeta => {
  return (
    BRIDGE_META_BY_CASE_ID[caseId] ?? {
      uidOrPhone: "UID-待补充",
      deviceInfo: "设备信息待同步",
      deviceFaultCode: "设备报码待同步",
      historyConsultation: {
        hasHistory: false,
      },
    }
  );
};
