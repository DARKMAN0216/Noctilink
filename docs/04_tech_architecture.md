# Noctilink 技术架构设计 v0.1

> 项目中文名：夜链  
> 项目类型：都市异常多视角因果链文字冒险小游戏  
> 推荐仓库名：`noctilink`  
> 推荐保存路径：`docs/04_tech_architecture.md`

---

## 1. 文档目的

本文档用于记录 **Noctilink（夜链）** 的技术架构方案，作为后续开发、Codex 生成代码、剧情内容生产、后端接口设计、剧情工具链设计的基础约束。

本项目不是传统 RPG，也不是单纯电子小说，而是：

```text
都市异常题材 · 多主角 · 多视角 · 因果链 · 文字冒险小游戏
```

技术架构的核心目标是支撑：

- 剧情选择
- 属性判定
- 角色好感
- 生存管理
- 多主角时间线
- 跨角色因果影响
- 默认行动脚本
- 付费视角解锁
- 多周目继承
- 坏结局收集
- 连载式章节更新

---

## 2. 总体技术结论

### 2.1 技术栈

| 层级 | 技术选型 | 说明 |
|---|---|---|
| 客户端 | Cocos Creator 3.x + TypeScript | 微信小游戏优先，负责 UI、剧情播放、选择、资源加载、广告/支付入口 |
| 后端 | C# / .NET LTS + ASP.NET Core Web API | 负责用户、云存档、权益、订单、广告奖励、内容版本、埋点 |
| ORM | EF Core | 后端数据库访问 |
| 数据库 | PostgreSQL | 正式环境推荐；MVP 可临时使用 SQLite，但不作为最终方案 |
| 内容文档 | Markdown | 世界观、角色设定、技术规则、Codex 上下文 |
| 剧情源数据 | YAML | 人类和 Codex 都更容易编辑 |
| 客户端运行数据 | JSON | 由工具链构建后给客户端加载 |
| 工具链 | C# CLI：StoryTool | 剧情校验、构建、因果链检查、可达性检查 |
| 平台 | 微信小游戏优先 | 后续预留抖音小游戏、QQ 小游戏、快应用适配 |

### 2.2 一句话架构

```text
Cocos + TypeScript 实现轻量小游戏客户端；
C#/.NET 实现后端、云存档、权益、订单、广告奖励和内容版本；
Markdown/YAML/JSON 管理剧情内容；
StoryTool 保证剧情数据质量；
WorldState 管理多主角共享世界状态；
TimelineRunner 支持未解锁角色的默认行动；
CausalGraphManager 记录和展示跨主角因果链。
```

---

## 3. 总体架构图

```text
Markdown 设计文档
        │
        ▼
人工 / Codex 编写剧情 YAML
        │
        ▼
StoryTool 校验与构建
        │
        ├──────────────► 调试用因果图数据
        │
        ▼
客户端剧情 JSON
        │
        ▼
Cocos 客户端
        │
        ├── StoryEngine 剧情引擎
        ├── WorldStateStore 世界状态
        ├── TimelineRunner 默认时间线
        ├── CausalGraphManager 因果图
        ├── SaveManager 存档
        ├── EntitlementManager 权益
        ├── PlatformAdapter 平台适配
        └── ResourceManager 资源加载
        │
        ▼
ASP.NET Core 后端
        │
        ├── 用户系统
        ├── 云存档
        ├── 付费权益
        ├── 订单校验
        ├── 广告奖励
        ├── 内容版本
        └── 埋点统计
        │
        ▼
PostgreSQL 数据库
```

---

## 4. 架构核心原则

### 4.1 剧情不硬编码

禁止在客户端代码中直接写死剧情分支。

错误方式：

```ts
if (choice === "explode_lab" && aStatus === "escaped") {
  nextNode = "ch01_b_dead";
}
```

正确方式：

```text
剧情节点、条件、效果、跳转、结局判断全部来自剧情数据。
客户端只负责解释和执行剧情数据。
```

### 4.2 世界状态统一管理

项目不能只记录“当前剧情节点”。必须维护统一的 `WorldState`，用于记录：

- 场景状态
- 角色状态
- 时间线状态
- 线索状态
- 世界 flag
- 付费权益
- 多周目状态

所有主角剧情都通过 `WorldState` 读取和写入状态。

### 4.3 多主角共享同一时间线

多个主角不是独立剧情线，而是在同一时间轴中行动。

```text
A 的行动可以改变 B 的现场状态。
B 的选择可以导致 C 的路线变化。
C 的隐藏行为可以解释 A 线中的未知事件。
```

因此系统需要支持：

- 时间线系统
- 默认行动脚本
- 因果事件记录
- 跨主角状态读取
- 玩家选择覆盖默认行动

### 4.4 免费视角完整，付费视角改写因果

商业化原则：

```text
免费主角线必须能形成完整体验。
付费视角不是单纯补剧情，而是提供新信息、新选择和因果改写能力。
```

技术上需要支持：

- 视角权益判断
- 付费节点锁定
- 已购视角解锁
- 默认行动被玩家选择覆盖
- 因果图补全

---

## 5. 项目目录结构

推荐仓库结构：

```text
noctilink/
  client/
    assets/
    scripts/
      story/
        StoryEngine.ts
        StoryRuntime.ts
        StoryNode.ts
        WorldStateStore.ts
        ConditionEvaluator.ts
        EffectApplier.ts
        TimelineRunner.ts
        CausalGraphManager.ts

      save/
        SaveManager.ts
        LocalSaveProvider.ts
        CloudSaveProvider.ts

      platform/
        PlatformAdapter.ts
        WechatMiniGameAdapter.ts
        MockPlatformAdapter.ts

      entitlement/
        EntitlementManager.ts

      ads/
        AdManager.ts

      resources/
        ResourceManager.ts
        ChapterResourceLoader.ts

      ui/
        story/
        causalGraph/
        archive/
        ending/
        shop/
        common/

  server/
    GameServer/
      Controllers/
      Services/
      Entities/
      Data/
      Migrations/

  tools/
    StoryTool/
      Commands/
      Validators/
      Builders/
      Schemas/

  content/
    chapters/
    characters/
    variables/
    products/
    hints/

  docs/
    00_project_brief.md
    01_world_bible.md
    02_character_bible.md
    03_story_rules.md
    04_tech_architecture.md
    05_story_node_schema.md
    06_world_state_schema.md
    07_causal_graph_rules.md
    08_commercialization.md
    09_backend_api.md
    10_storytool_usage.md

  AGENTS.md
  README.md
```

---

## 6. 客户端架构

客户端采用：

```text
Cocos Creator 3.x + TypeScript
```

客户端主要职责：

- 剧情文本展示
- 选项交互
- 属性变化展示
- 角色好感展示
- 线索/道具展示
- 因果图展示
- 结局图鉴
- 本地存档
- 云存档同步
- 提示广告调用
- 付费入口调用
- 资源加载
- 分包加载
- 像素 UI 表现

### 6.1 客户端模块列表

| 模块 | 职责 |
|---|---|
| `StoryEngine` | 剧情执行核心 |
| `WorldStateStore` | 世界状态管理 |
| `ConditionEvaluator` | 条件判断 |
| `EffectApplier` | 效果执行 |
| `TimelineRunner` | 默认时间线 / 默认行动脚本执行 |
| `CausalGraphManager` | 因果图记录与展示 |
| `SaveManager` | 本地存档 / 云存档同步 |
| `EntitlementManager` | 付费视角 / 章节权益判断 |
| `AdManager` | 提示广告调用 |
| `PlatformAdapter` | 微信小游戏等平台能力适配 |
| `ResourceManager` | 远程资源、分包、章节资源加载 |

---

## 7. 客户端核心模块设计

### 7.1 StoryEngine

剧情执行核心。

职责：

- 加载剧情节点
- 进入剧情节点
- 展示文本
- 展示可用选项
- 执行玩家选择
- 调用条件判断
- 调用效果执行
- 跳转下一个节点
- 触发结局
- 通知 UI 刷新

接口示意：

```ts
class StoryEngine {
  loadChapter(chapterId: string): Promise<void>;
  enterNode(nodeId: string): Promise<void>;
  getCurrentNode(): StoryNode;
  getAvailableChoices(): StoryChoice[];
  choose(choiceId: string): Promise<StoryResult>;
  triggerEnding(endingId: string): Promise<void>;
}
```

### 7.2 WorldStateStore

世界状态管理器。

职责：

- 保存所有世界状态变量
- 提供读取接口
- 提供写入接口
- 支持快照
- 支持回滚
- 支持存档序列化
- 支持多周目继承

结构示意：

```ts
type WorldState = {
  scene: Record<string, string | number | boolean>;
  characters: Record<string, CharacterState>;
  timeline: Record<string, string | number | boolean>;
  clues: Record<string, boolean>;
  flags: Record<string, boolean>;
  loops: Record<string, string | number | boolean>;
};
```

### 7.3 ConditionEvaluator

条件判断器。

职责：

- 判断节点是否可进入
- 判断选项是否可显示
- 判断选项是否可选择
- 判断结局是否触发
- 判断隐藏节点是否解锁
- 判断付费视角是否可访问

支持条件类型：

- 属性条件
- 世界状态条件
- 线索条件
- 好感条件
- 付费权益条件
- 多周目条件
- 时间线条件
- 复合条件：`all` / `any` / `not`

条件示例：

```yaml
requirements:
  all:
    - attribute.insight >= 3
    - world.scene.lab_power != "off"
    - clue.broken_camera == true
```

### 7.4 EffectApplier

效果执行器。

职责：

- 修改属性
- 修改好感
- 写入世界状态
- 添加线索
- 添加道具
- 记录因果事件
- 记录选择历史
- 触发结局
- 解锁隐藏节点
- 消耗资源

效果示例：

```yaml
effects:
  attributes:
    sanity: -2
    insight: +1

  world:
    scene.corridor_blocked: true
    timeline.army_alert_level: "high"

  clues:
    add:
      - broken_camera

  causal_events:
    add:
      - cause_ch01_a_found_camera
```

### 7.5 TimelineRunner

默认时间线执行器。

职责：

- 执行未操作主角的默认行动
- 处理默认行动与玩家行动的覆盖关系
- 写入默认世界状态
- 支持多周目重新运行
- 支持付费视角改写默认行动

核心逻辑：

```text
如果某主角视角未解锁：
    执行默认行动脚本

如果某主角视角已解锁但玩家尚未改写：
    仍执行默认行动脚本

如果玩家在该视角做出选择：
    使用玩家选择覆盖默认行动
```

### 7.6 CausalGraphManager

因果图管理器。

职责：

- 记录关键事件
- 记录事件依赖关系
- 记录事件导致的世界状态变化
- 记录未知因果点
- 根据付费视角解锁补全因果图
- 根据坏结局反推原因
- 为 UI 提供因果图数据

因果事件结构：

```ts
type CausalEvent = {
  id: string;
  chapterId: string;
  time: string;
  pov: string;
  title: string;
  knownToPlayer: boolean;
  sourceNodeId: string;
  dependsOn: string[];
  writes: string[];
  unlockBy?: string;
};
```

### 7.7 SaveManager

存档管理器。

职责：

- 本地存档
- 云存档同步
- 存档版本兼容
- 坏结局记录
- 多周目记录
- 付费权益缓存
- 选择历史保存
- 世界状态保存

存档不能只存当前节点。

推荐结构：

```ts
type SaveData = {
  version: string;
  userId: string;

  currentChapter: string;
  currentNodeId: string;
  currentPov: string;

  attributes: Record<string, number>;
  relationships: Record<string, number>;
  worldState: WorldState;

  choiceHistory: ChoiceRecord[];
  causalEvents: CausalEvent[];

  endingsUnlocked: string[];
  cluesUnlocked: string[];

  loopIndex: number;
  paidUnlocks: string[];

  contentVersion: string;
  updatedAt: number;
};
```

### 7.8 EntitlementManager

权益管理器。

职责：

- 判断角色视角是否已购买
- 判断章节是否已购买
- 判断整季通行证是否有效
- 判断广告提示券是否可用
- 从后端同步权益
- 缓存权益
- 防止客户端伪造权益

注意：

```text
客户端可以缓存权益用于 UI 展示。
最终权益以服务端为准。
```

### 7.9 PlatformAdapter

平台适配层。

客户端不允许在业务逻辑中到处直接调用微信 API。

统一抽象：

```ts
interface PlatformAdapter {
  login(): Promise<LoginResult>;
  showRewardedAd(scene: AdScene): Promise<AdRewardResult>;
  createOrder(productId: string): Promise<OrderResult>;
  restorePurchases(): Promise<Entitlement[]>;
  loadRemoteAsset(path: string): Promise<unknown>;
  getSystemInfo(): PlatformSystemInfo;
}
```

实现类：

```text
WechatMiniGameAdapter
MockPlatformAdapter
FutureDouyinAdapter
FutureQQAdapter
```

---

## 8. 剧情数据架构

### 8.1 内容生产流程

```text
Markdown 设定文档
      │
      ▼
人工 / Codex 生成 YAML
      │
      ▼
StoryTool validate
      │
      ▼
是否通过校验？
      │
      ├── 否：返回错误报告
      │
      └── 是：StoryTool build
              │
              ▼
        客户端 JSON
              │
              ▼
        Cocos 加载运行
```

### 8.2 剧情节点格式

剧情节点示例：

```yaml
id: ch01_a_001
chapter: ch01
pov: A
time: "22:10"
title: "走廊尽头"

paid: false
hidden: false

text: |
  你站在走廊尽头。
  灯光闪烁，空气中有烧焦的气味。

conditions:
  all:
    - world.scene.lab_power != "off"

choices:
  - id: inspect_corridor
    text: "观察走廊"
    requirements:
      all:
        - attribute.insight >= 2
    effects:
      attributes:
        sanity: -1
        insight: +1
      world:
        scene.a_found_camera: true
      clues:
        add:
          - broken_camera
      causal_events:
        add:
          - cause_ch01_a_found_camera
    next: ch01_a_002

  - id: leave_immediately
    text: "立刻离开"
    effects:
      attributes:
        stamina: -1
      world:
        timeline.a_left_corridor_early: true
    next: ch01_a_003
```

### 8.3 剧情节点字段说明

| 字段 | 说明 |
|---|---|
| `id` | 节点唯一 ID |
| `chapter` | 所属章节 |
| `pov` | 当前主角视角 |
| `time` | 时间线时间点 |
| `title` | 节点标题 |
| `paid` | 是否付费节点 |
| `hidden` | 是否隐藏节点 |
| `text` | 剧情正文 |
| `conditions` | 进入该节点的条件 |
| `choices` | 选项列表 |
| `requirements` | 某个选项显示或选择条件 |
| `effects` | 选择后产生的效果 |
| `next` | 下一个节点 |
| `ending` | 可选，触发结局 |
| `causal_events` | 可选，记录因果事件 |

---

## 9. 世界状态设计

### 9.1 状态分类

| 分类 | 说明 |
|---|---|
| `scene` | 场景状态，例如门、电力、路线、火灾、封锁 |
| `characters` | 角色状态，例如生死、受伤、污染、信任 |
| `timeline` | 时间线状态，例如某事件是否提前发生，军队是否到达 |
| `clues` | 线索状态，例如是否发现证据、是否知道身份 |
| `flags` | 剧情 flag，例如是否进入过某节点 |
| `loops` | 多周目状态，例如是否完成第一周目 |

### 9.2 示例

```json
{
  "scene": {
    "lab_power": "unstable",
    "corridor_blocked": true,
    "gate_open": false
  },
  "characters": {
    "A": {
      "status": "escaped",
      "sanity": 42,
      "stamina": 8,
      "pollution": 15
    },
    "B": {
      "status": "unknown",
      "trust_A": 0
    }
  },
  "timeline": {
    "army_arrival_time": "22:40",
    "b_key_action": "default"
  },
  "clues": {
    "broken_camera": true
  },
  "flags": {
    "first_loop_finished": false
  },
  "loops": {
    "loop_index": 1,
    "memory_fragment_ch01": false
  }
}
```

---

## 10. 默认行动脚本

### 10.1 目的

由于项目采用：

```text
一个主角免费，其他主角视角收费
```

所以未解锁主角也必须在同一时间线中行动。否则免费主角线中的事件无法成立。

### 10.2 默认行动格式

```yaml
chapter: ch01
pov: B

default_actions:
  - id: b_default_001
    time: "22:10"
    writes:
      timeline.b_entered_area: true

  - id: b_default_002
    time: "22:18"
    writes:
      timeline.b_key_action: "default"
      timeline.army_alert_level: "high"
      scene.lab_status: "unstable"
```

### 10.3 覆盖规则

```text
如果玩家未解锁该视角：
    使用默认行动

如果玩家解锁但未游玩该视角：
    使用默认行动

如果玩家在该视角做出选择：
    玩家选择覆盖默认行动

如果多周目重新开始：
    根据继承规则保留部分已知因果信息
```

---

## 11. 因果图系统

### 11.1 作用

因果图是项目的核心特色，用于展示：

- 某事件为什么发生
- 某坏结局由哪些选择导致
- 哪个未知事件影响了当前路线
- 付费视角解锁后补全了哪些真相
- 哪些节点可以被重新改写

### 11.2 因果图数据结构

```ts
type CausalGraph = {
  nodes: CausalGraphNode[];
  edges: CausalGraphEdge[];
};

type CausalGraphNode = {
  id: string;
  title: string;
  chapterId: string;
  time: string;
  pov: string;
  known: boolean;
  type: "choice" | "event" | "state_change" | "ending" | "unknown";
  unlockBy?: string;
};

type CausalGraphEdge = {
  from: string;
  to: string;
  reason: string;
};
```

### 11.3 展示规则

免费视角：

```text
未知事件
  ↓
场景状态变化
  ↓
主角遭遇危险
```

付费视角解锁后：

```text
具体角色行动
  ↓
具体世界状态变化
  ↓
其他主角路线改变
  ↓
新的结局可能
```

---

## 12. 后端架构

后端采用：

```text
C# / .NET LTS
ASP.NET Core Web API
EF Core
PostgreSQL
```

后端主要职责：

- 用户登录
- 微信 openid 绑定
- 云存档
- 付费权益
- 订单校验
- 广告奖励
- 内容版本
- 公告
- 远程开关
- 数据埋点
- 后台管理

---

## 13. 后端模块设计

| 模块 | 职责 |
|---|---|
| `UserService` | 创建用户、微信登录、游客登录、账号绑定、获取用户基础信息 |
| `SaveService` | 上传云存档、下载云存档、存档版本校验、存档冲突处理、存档迁移 |
| `EntitlementService` | 查询用户权益、发放视角/章节/整季通行证权益、校验权益是否有效 |
| `OrderService` | 创建订单、接收支付回调、校验订单状态、补单、发放权益、记录异常订单 |
| `AdRewardService` | 记录广告观看、发放提示奖励、限制广告频率、防止重复领取 |
| `ContentVersionService` | 返回剧情版本、资源版本、章节开放状态、灰度发布、远程开关 |
| `TelemetryService` | 选择分布、坏结局触发率、章节完成率、付费转化、广告触发点、玩家卡点 |
| `AdminService` | 公告、商品配置、远程开关、内容管理 |

---

## 14. 数据库表设计

### 14.1 核心表

| 表名 | 用途 |
|---|---|
| `users` | 用户基础信息 |
| `user_saves` | 云存档 |
| `user_entitlements` | 用户权益 |
| `orders` | 订单 |
| `ad_rewards` | 广告奖励记录 |
| `content_versions` | 内容版本 |
| `event_logs` | 埋点事件 |
| `ending_records` | 结局解锁记录 |
| `clue_records` | 线索解锁记录 |

### 14.2 users

```text
id
openid
nickname
avatar_url
created_at
updated_at
last_login_at
status
```

### 14.3 user_saves

```text
id
user_id
slot
content_version
save_json
created_at
updated_at
```

### 14.4 user_entitlements

```text
id
user_id
entitlement_type
entitlement_key
source
order_id
created_at
expires_at
```

示例：

```text
entitlement_type = pov
entitlement_key = B

entitlement_type = chapter
entitlement_key = ch03

entitlement_type = season_pass
entitlement_key = season_01
```

### 14.5 orders

```text
id
user_id
product_id
platform
platform_order_id
status
amount
currency
created_at
paid_at
raw_callback
```

### 14.6 ad_rewards

```text
id
user_id
ad_scene
reward_type
reward_key
claimed
created_at
claimed_at
```

### 14.7 content_versions

```text
id
content_version
resource_version
min_client_version
status
release_note
created_at
published_at
```

### 14.8 event_logs

```text
id
user_id
event_name
event_json
client_version
content_version
created_at
```

### 14.9 ending_records

```text
id
user_id
ending_id
chapter_id
loop_index
unlocked_at
```

### 14.10 clue_records

```text
id
user_id
clue_id
chapter_id
unlocked_at
```

---

## 15. 后端 API 初稿

### 15.1 登录

```http
POST /api/auth/login
```

请求：

```json
{
  "platform": "wechat",
  "code": "wx_login_code"
}
```

响应：

```json
{
  "userId": "u_001",
  "token": "jwt_token",
  "isNewUser": false
}
```

### 15.2 获取权益

```http
GET /api/entitlements
```

响应：

```json
{
  "entitlements": [
    {
      "type": "pov",
      "key": "B"
    },
    {
      "type": "chapter",
      "key": "ch03"
    }
  ]
}
```

### 15.3 上传存档

```http
POST /api/saves/{slot}
```

请求：

```json
{
  "contentVersion": "story_0.1.0",
  "saveData": {}
}
```

### 15.4 下载存档

```http
GET /api/saves/{slot}
```

### 15.5 创建订单

```http
POST /api/orders
```

请求：

```json
{
  "productId": "pov_b_unlock",
  "platform": "wechat"
}
```

### 15.6 广告奖励

```http
POST /api/ad-rewards/claim
```

请求：

```json
{
  "adScene": "choice_hint",
  "nodeId": "ch01_a_008"
}
```

### 15.7 内容版本

```http
GET /api/content/version
```

响应：

```json
{
  "contentVersion": "story_0.1.0",
  "resourceVersion": "res_0.1.0",
  "availableChapters": ["ch00", "ch01", "ch02"],
  "maintenance": false
}
```

---

## 16. 资源加载策略

小游戏包体需要严格控制。资源必须分层。

| 层级 | 内容 |
|---|---|
| 主包 | 剧情引擎、基础 UI、平台适配层、登录/广告/支付基础代码、序章和第一章必要资源 |
| 远程资源 | 后续章节背景、角色头像、音频、像素插图、付费视角资源 |
| 分包 | 章节资源包、角色视角资源包、大型演出资源 |

原则：

```text
不要把所有章节和所有角色资源一次性打进主包。
首包只保留启动、基础 UI、引擎和首章必要资源。
后续章节和付费视角尽量远程化或分包化。
```

---

## 17. StoryTool 工具链

StoryTool 是 C# CLI 工具，用于内容生产和构建。

### 17.1 命令设计

```bash
StoryTool validate ./content
StoryTool build ./content ./dist/story-data
StoryTool graph ./content/ch01 ./dist/graphs/ch01.json
StoryTool check-unreachable ./content
StoryTool check-entitlements ./content
```

### 17.2 校验内容

必须校验：

- 节点 ID 是否重复
- `next` 指向是否存在
- `conditions` 中变量是否存在
- `effects` 写入变量是否合法
- 付费节点是否被免费路径错误访问
- 隐藏节点是否有解锁条件
- 坏结局是否可达
- 主角默认行动脚本是否完整
- 因果事件是否引用合法
- 同一章节是否存在死路

### 17.3 构建输出

输出给客户端的数据：

```text
dist/story-data/
  manifest.json
  chapters/
    ch00.json
    ch01.json
    ch02.json
  characters.json
  variables.json
  products.json
```

---

## 18. Codex 协作规范

仓库必须保留：

```text
AGENTS.md
docs/
content/
```

`AGENTS.md` 负责告诉 Codex：

- 项目类型
- 技术栈
- 目录结构
- 代码风格
- 剧情节点格式
- 禁止硬编码剧情
- 新增内容必须通过 StoryTool 校验
- 付费权益不能只存在客户端
- 所有剧情变量必须先定义 schema

建议写入规则：

```text
如果生成剧情内容：
    优先生成 YAML。
    必须使用已定义变量。
    不得临时创造未登记变量。
    必须保证 next 节点存在。
    必须标明 paid / hidden。
    必须记录关键因果事件。

如果生成客户端代码：
    使用 TypeScript。
    不得直接依赖微信 API。
    必须通过 PlatformAdapter 调用平台能力。

如果生成后端代码：
    使用 C#。
    使用 ASP.NET Core Web API。
    使用 EF Core。
    权益判断以后端为准。
```

---

## 19. MVP 开发范围

第一阶段不追求完整商业化，只验证核心技术闭环。

### 19.1 客户端 MVP

必须实现：

- 加载剧情 JSON
- 显示剧情文本
- 显示选项
- 判断条件
- 执行 effects
- 跳转节点
- 写入 worldState
- 记录 choiceHistory
- 触发坏结局
- 本地存档
- 基础因果事件记录

### 19.2 剧情 MVP

必须包含：

- 1 个免费主角视角
- 1 个付费视角的锁定与解锁模拟
- 1 个默认行动脚本
- 1 条跨主角因果链
- 2-3 个坏结局
- 1 个阶段结局

### 19.3 后端 MVP

必须实现：

- 用户登录
- 云存档
- 权益查询
- 模拟发放权益
- 内容版本查询
- 基础埋点

支付和广告可以先用 Mock。

### 19.4 StoryTool MVP

必须实现：

- YAML 读取
- 节点 ID 校验
- `next` 指向校验
- 变量 schema 校验
- YAML 转 JSON

---

## 20. 不做事项

第一阶段明确不做：

- 复杂战斗系统
- 大地图自由探索
- 抽卡系统
- 多人联网
- 复杂装备系统
- 实时 PVP
- 复杂后台 CMS
- 全平台同时适配
- 完整支付链路
- 复杂动画演出

---

## 21. 关键技术风险

### 21.1 分支爆炸

风险：

```text
多主角 + 多周目 + 因果链容易导致剧情分支不可控。
```

控制方式：

- 每章最多 3 个强因果节点
- 每章最多 1 个角色生死级变量
- 每章结尾必须收束到 2-3 个大状态

### 21.2 状态变量混乱

风险：

```text
变量命名混乱会导致剧情条件难以维护。
```

控制方式：

- 所有变量必须先登记到 schema
- StoryTool 校验未登记变量
- 禁止剧情节点临时创造变量

### 21.3 付费路径破坏体验

风险：

```text
免费玩家觉得剧情残缺。
```

控制方式：

- 免费主角线必须完整
- 付费视角提供解释、改写、隐藏结局，而不是补齐主线必需内容

### 21.4 存档兼容

风险：

```text
连载更新后旧存档无法读取。
```

控制方式：

- 存档必须带 `contentVersion`
- 后端和客户端都要预留存档迁移机制

---

## 22. 后续文档拆分

本技术架构文档之后，需要继续拆分以下文档：

| 文档 | 说明 |
|---|---|
| `05_story_node_schema.md` | 剧情节点数据结构 |
| `06_world_state_schema.md` | 世界状态变量规范 |
| `07_causal_graph_rules.md` | 因果链规则 |
| `08_commercialization.md` | 商业化与权益模型 |
| `09_backend_api.md` | 后端接口设计 |
| `10_storytool_usage.md` | 剧情工具链使用说明 |
| `11_mvp_plan.md` | MVP 开发计划 |

---

## 23. 当前拍板方案

采用：

- Cocos Creator 3.x + TypeScript
- C# / .NET 后端
- ASP.NET Core Web API
- EF Core
- PostgreSQL
- Markdown 文档
- YAML 剧情源文件
- JSON 客户端运行数据
- C# StoryTool 工具链
- 微信小游戏优先

不采用：

- Rust 后端
- Unity 客户端
- 纯普通小程序页面
- 纯客户端单机存档
- 代码硬编码剧情
- 一开始全平台适配

---

## 24. 最终总结

本项目技术架构的核心是：

```text
用 Cocos + TypeScript 实现轻量小游戏客户端。
用 C#/.NET 实现后端、云存档、权益、订单、广告奖励和内容版本。
用 Markdown/YAML/JSON 管理剧情内容。
用 StoryTool 保证剧情数据质量。
用 WorldState 统一管理多主角共享世界状态。
用 TimelineRunner 支持未解锁角色的默认行动。
用 CausalGraphManager 展示和记录跨主角因果链。
```

一句话定义：

```text
Noctilink 是一个数据驱动的多主角因果链文字冒险小游戏架构。
核心不是写死剧情，而是通过剧情节点、世界状态、默认时间线和因果图系统，
支撑免费视角、付费视角、多周目和连载式章节更新。
```
