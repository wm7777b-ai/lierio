# 当前生效 Mock 数据

当前前端唯一生效的数据源：

- [focused_mock_cases_v4_two_cases.json](/Users/lier/Documents/AI/demo-contact/src/data/focused_mock_cases_v4_two_cases.json)

## 场景 1：高风险投诉升级场景

- `case_id`: `case_generic_high_risk_001`
- `scenario`: `generic_high_risk_handling`
- `scenarioName`: `高风险投诉升级场景`
- `channel`: `电话`
- `queueName`: `升级投诉队列`
- `userTags`: `重复来电`、`投诉敏感`

### 用户基本信息

- `phoneOrUid`: `139****8822 / U2008822`
- `sessionId`: `S-20260322-HR001`
- `accessTime`: `2026-03-22 14:00:00`
- `callDuration`: `362`
- `hasHistory`: `true`
- `lastTopic`: `处理进度催办`
- `lastDisposition`: `已催办，待回访`
- `historyInboundCount`: `3`

### 轮次摘要

#### 第 1 轮

- 客户：上周已报问题，超过承诺时限仍未收到结果，追问当前进度
- 座席：先核实上次工单和当前处理节点
- 当前诉求：`追问历史问题处理进度`
- 当前情绪：`不满`
- 建议等级：`存在轻度建议`

#### 第 2 轮

- 客户：表示一周仍无人回复，若继续说不清将正式投诉
- 座席：核实责任团队和当前节点，并记录催办诉求
- 当前诉求：`催办处理进度并出现投诉倾向`
- 当前情绪：`激动`
- 建议等级：`强烈建议关注`

#### 第 3 轮

- 客户：明确表示将向监管平台投诉
- 座席：记录监管投诉风险并转入优先跟进
- 当前诉求：`明确监管投诉威胁`
- 当前情绪：`激动`
- 建议等级：`强烈建议关注`

#### 第 4 轮

- 客户：要求当天给明确答复和回访时间
- 座席：提交升级团队并记录当日回访要求
- 当前诉求：`要求当日明确答复与回访`
- 当前情绪：`愤怒`
- 建议等级：`强烈建议关注`

#### 第 5 轮

- 客户：接受安排，但要求今天务必回访
- 座席：确认已按高优先级升级处理记录
- 当前诉求：`确认高优先级回访要求`
- 当前情绪：`不满`
- 建议等级：`无额外建议`

### 最终收口

- `archiveCategory`: `投诉升级`
- `suggestedTitle`: `高风险投诉升级处理`
- `riskPointNote`: `高风险投诉 / 监管投诉倾向 / 强时限要求`
- `recommendedAction`: `升级处理`
- `suggestedPriority`: `高`
- `sopTitle`: `高风险投诉升级SOP`

## 场景 2：端云协同设备离线场景

- `case_id`: `case_edge_cloud_low_risk_002`
- `scenario`: `edge_cloud_low_risk_handling`
- `scenarioName`: `端云协同设备离线场景`
- `channel`: `App`
- `queueName`: `设备故障咨询队列`
- `userTags`: `设备离线咨询`、`标准处理场景`

### 用户基本信息

- `phoneOrUid`: `U1004821`
- `sessionId`: `S-20260322-EC002`
- `accessTime`: `2026-03-22 16:00:00`
- `callDuration`: `338`
- `hasHistory`: `true`
- `lastTopic`: `摄像头偶发离线咨询`
- `lastDisposition`: `引导观察，未建单`
- `historyInboundCount`: `1`

### 端云协同信息

- `boundDeviceInfo`: `客厅摄像头 CAM-01`
- `deviceStatus`: `持续离线 2 小时`
- `deviceFaultCode`: `E-OFFLINE`
- `latestEvent`: `13:58 最后一次心跳上报，随后设备离线`
- `cloudUnderstanding`: `云侧连续检测到设备离线，建议优先确认供电、网络与重启情况`

### 轮次摘要

#### 第 1 轮

- 客户：反馈 App 中摄像头画面一直加载不出来
- 座席：确认是否为客厅摄像头
- 当前诉求：`反馈摄像头画面无法查看`
- 当前情绪：`平稳`
- 建议等级：`存在轻度建议`

#### 第 2 轮

- 客户：确认设备对象，并说明已重启过仍无效
- 座席：继续确认家庭网络状态
- 当前诉求：`确认故障设备并反馈重启无效`
- 当前情绪：`平稳`
- 建议等级：`存在轻度建议`

#### 第 3 轮

- 客户：说明家庭网络正常
- 座席：收集安装位置和联系电话尾号
- 当前诉求：`排除网络问题并收集建单信息`
- 当前情绪：`平稳`
- 建议等级：`存在轻度建议`

#### 第 4 轮

- 客户：补全安装位置与联系电话
- 座席：按摄像头离线故障提交处理
- 当前诉求：`补全建单关键信息`
- 当前情绪：`平稳`
- 建议等级：`无额外建议`

#### 第 5 轮

- 客户：确认尽快处理
- 座席：说明已按标准故障处理登记
- 当前诉求：`确认按标准故障流程处理`
- 当前情绪：`平稳`
- 建议等级：`无额外建议`

### 最终收口

- `archiveCategory`: `设备故障`
- `suggestedTitle`: `摄像头持续离线标准处理`
- `riskPointNote`: `低风险标准故障处理`
- `recommendedAction`: `生成工单`
- `suggestedPriority`: `中`
- `sopTitle`: `设备离线标准处理SOP`
