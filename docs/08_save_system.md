# Noctilink 存档系统设计 v0.1

## 1. 文档目的

本文档定义 Noctilink v0.1 MVP 阶段的存档系统设计，用于支撑：

```text
剧情进度保存
世界状态保存
章节重玩
结局图鉴
线索档案
主线锚点
因果事件记录
后续云存档扩展
```

当前 MVP 范围为：

```text
序章 + 第一章
仅 A 视角可玩
本地存档
无后端
无云存档
无商业化
存在 closed / canon 结局
存在结局图鉴
存在基础因果记录
```

## 2. 核心结论

v0.1 存档系统采用：

```text
本地存档为主
单用户
单主存档
可扩展多存档位
可扩展云存档
```

核心存档结构分为三层：

```text
Runtime State：当前游玩状态
Archive State：永久收集状态
Canon State：主线锚点状态
```

三者必须分开存储，避免后续章节继承闭合路线的过程变量，导致分支爆炸。

## 3. 存档系统目标

v0.1 存档系统必须支持：

```text
保存当前章节
保存当前节点
保存当前 A 属性
保存 world 状态
保存当前线索
保存选择历史
保存因果事件
保存已解锁结局
保存已解锁档案
保存主线推进结局状态
支持章节重玩
支持 closed 结局回看
支持 canon 结局解锁下一章
```

v0.1 暂不支持：

```text
云存档
多设备同步
账号登录
商业化权益
多人存档
复杂分支回滚
完整时间线重算
跨章节多结局继承
```

## 4. 存档分层设计

### 4.1 Runtime State

Runtime State 是当前一次游玩中的即时状态。

包含：

```text
当前章节
当前节点
当前视角
A 的属性
当前世界状态
当前线索
当前关系
当前选择历史
当前因果事件
```

特点：

```text
会随着玩家选择变化
进入本地存档
章节重玩时可以重置
closed 结局不会进入下一章
```

### 4.2 Archive State

Archive State 是玩家永久解锁内容。

包含：

```text
已解锁结局
已发现线索图鉴
已解锁档案条目
已看过的结局回看
已获得的提示信息
```

特点：

```text
章节重玩不会清空
closed 结局也会写入
用于结局图鉴和档案馆
```

### 4.3 Canon State

Canon State 是主线锚点状态。

包含：

```text
已完成主线推进的章节
每章 canon 结局 ID
每章 canon_state
已解锁下一章
```

特点：

```text
只由 canon 结局写入
closed 结局不得写入
后续章节只继承 canon_state
不继承所有 runtime 过程变量
```

## 5. 存档总体结构

v0.1 推荐结构：

```ts
type SaveData = {
  meta: SaveMeta;
  runtime: RuntimeState;
  archive: ArchiveState;
  canon: CanonState;
  history: HistoryState;
};
```

展开后：

```ts
type SaveData = {
  meta: {
    saveVersion: string;
    contentVersion: string;
    clientVersion: string;
    createdAt: number;
    updatedAt: number;
  };

  runtime: {
    currentChapter: string;
    currentNode: string;
    currentPov: "A" | "B" | "C";

    attributes: Record<string, unknown>;
    world: Record<string, unknown>;
    clues: Record<string, boolean>;
    relationships: Record<string, unknown>;

    progress: {
      unlockedChapters: string[];
      lastEnding: string;
    };
  };

  archive: {
    endings: Record<string, ArchiveEndingRecord>;
    clues: Record<string, ArchiveClueRecord>;
    entries: Record<string, ArchiveEntryRecord>;
  };

  canon: {
    completedChapters: Record<string, CanonChapterRecord>;
    canonState: Record<string, unknown>;
  };

  history: {
    choiceHistory: ChoiceRecord[];
    causalEvents: CausalEventRecord[];
    chapterAttempts: ChapterAttemptRecord[];
  };
};
```

## 6. meta 元信息

### 6.1 结构

```ts
type SaveMeta = {
  saveVersion: string;
  contentVersion: string;
  clientVersion: string;
  createdAt: number;
  updatedAt: number;
};
```

### 6.2 字段说明

| 字段 | 说明 |
|---|---|
| saveVersion | 存档结构版本 |
| contentVersion | 剧情内容版本 |
| clientVersion | 客户端版本 |
| createdAt | 存档创建时间 |
| updatedAt | 存档更新时间 |

示例：

```json
{
  "saveVersion": "0.1.0",
  "contentVersion": "story_0.1.0",
  "clientVersion": "client_0.1.0",
  "createdAt": 1730000000000,
  "updatedAt": 1730000500000
}
```

## 7. Runtime State 设计

### 7.1 结构

```ts
type RuntimeState = {
  currentChapter: string;
  currentNode: string;
  currentPov: "A" | "B" | "C";

  attributes: Record<string, unknown>;
  world: Record<string, unknown>;
  clues: Record<string, boolean>;
  relationships: Record<string, unknown>;

  progress: RuntimeProgress;
};
```

### 7.2 示例

```json
{
  "currentChapter": "ch01",
  "currentNode": "ch01_a_012",
  "currentPov": "A",
  "attributes": {
    "A": {
      "status": "alive",
      "sanity": 42,
      "stamina": 8,
      "money": 30,
      "insight": 3,
      "pollution": 12
    }
  },
  "world": {
    "scene": {
      "current_area": "old_building",
      "rain_intensity": "abnormal",
      "power_state": "unstable"
    },
    "timeline": {
      "current_time": "23:05",
      "minutes_elapsed": 65,
      "has_reached_2317": false,
      "anomaly_phase": "unstable"
    },
    "flags": {
      "ch01_started": true,
      "a_knows_anomaly_exists": false
    }
  },
  "clues": {
    "no_sender_message": true,
    "repeated_time_2317": true,
    "core_signal": false
  },
  "relationships": {
    "A": {
      "unknown_caller": {
        "trust": 1
      }
    }
  },
  "progress": {
    "unlockedChapters": ["ch00", "ch01"],
    "lastEnding": ""
  }
}
```

## 8. Archive State 设计

### 8.1 结构

```ts
type ArchiveState = {
  endings: Record<string, ArchiveEndingRecord>;
  clues: Record<string, ArchiveClueRecord>;
  entries: Record<string, ArchiveEntryRecord>;
};
```

### 8.2 结局档案

```ts
type ArchiveEndingRecord = {
  endingId: string;
  chapterId: string;
  pov: string;
  endingType: "closed" | "canon";
  category: string;
  unlockedAt: number;
  firstAttemptId?: string;
};
```

示例：

```json
{
  "ch01_a_closed_misunderstanding": {
    "endingId": "ch01_a_closed_misunderstanding",
    "chapterId": "ch01",
    "pov": "A",
    "endingType": "closed",
    "category": "misunderstanding",
    "unlockedAt": 1730000800000,
    "firstAttemptId": "attempt_ch01_001"
  }
}
```

### 8.3 线索档案

```ts
type ArchiveClueRecord = {
  clueId: string;
  chapterId: string;
  unlockedAt: number;
  sourceEndingId?: string;
  sourceNodeId?: string;
};
```

用途：

```text
玩家即使进入 closed 结局，也能保留曾经发现过的线索档案。
```

### 8.4 档案条目

```ts
type ArchiveEntryRecord = {
  entryId: string;
  title: string;
  unlockedAt: number;
  source: "node" | "ending" | "canon" | "system";
};
```

示例：

```json
{
  "abnormal_rain": {
    "entryId": "abnormal_rain",
    "title": "异常雨夜",
    "unlockedAt": 1730000900000,
    "source": "ending"
  }
}
```

## 9. Canon State 设计

### 9.1 结构

```ts
type CanonState = {
  completedChapters: Record<string, CanonChapterRecord>;
  canonState: Record<string, unknown>;
};
```

### 9.2 CanonChapterRecord

```ts
type CanonChapterRecord = {
  chapterId: string;
  canonEndingId: string;
  completedAt: number;
  unlocks: string[];
  canonStateKeys: string[];
};
```

示例：

```json
{
  "ch01": {
    "chapterId": "ch01",
    "canonEndingId": "ch01_a_canon_001",
    "completedAt": 1730001200000,
    "unlocks": ["ch02"],
    "canonStateKeys": [
      "attributes.A.status",
      "world.flags.ch01_canon_reached",
      "world.flags.a_knows_anomaly_exists",
      "world.flags.a_saw_unknown_layer",
      "clues.core_signal"
    ]
  }
}
```

### 9.3 canonState

`canonState` 保存后续章节可继承的主线锚点变量。

示例：

```json
{
  "attributes.A.status": "alive",
  "world.flags.ch01_canon_reached": true,
  "world.flags.a_knows_anomaly_exists": true,
  "world.flags.a_saw_unknown_layer": true,
  "world.timeline.anomaly_phase": "visible",
  "clues.core_signal": true
}
```

规则：

```text
只有 canon_allowed = true 的变量允许写入 canonState。
closed 结局不得写入 canonState。
后续章节只继承 canonState，不继承整个 runtime。
```

## 10. History State 设计

### 10.1 结构

```ts
type HistoryState = {
  choiceHistory: ChoiceRecord[];
  causalEvents: CausalEventRecord[];
  chapterAttempts: ChapterAttemptRecord[];
};
```

## 11. ChoiceRecord 选择历史

### 11.1 结构

```ts
type ChoiceRecord = {
  id: string;
  attemptId: string;
  chapterId: string;
  nodeId: string;
  choiceId: string;
  pov: string;
  time: string;
  effects: string[];
  createdAt: number;
};
```

### 11.2 示例

```json
{
  "id": "choice_001",
  "attemptId": "attempt_ch01_001",
  "chapterId": "ch01",
  "nodeId": "ch01_a_001",
  "choiceId": "check_message",
  "pov": "A",
  "time": "22:05",
  "effects": [
    "clues.no_sender_message",
    "attributes.A.sanity"
  ],
  "createdAt": 1730000100000
}
```

用途：

```text
回看选择
调试剧情
分析结局原因
后续支持章节回溯
```

## 12. CausalEventRecord 因果事件历史

### 12.1 结构

```ts
type CausalEventRecord = {
  id: string;
  attemptId: string;
  chapterId: string;
  pov: string;
  category: string;
  strength: "strong" | "weak";
  visibility: "known" | "unknown" | "hidden";
  title: string;
  sourceNodeId?: string;
  sourceChoiceId?: string;
  reads?: string[];
  writes?: string[];
  createdAt: number;
};
```

### 12.2 示例

```json
{
  "id": "cause_ch01_check_message",
  "attemptId": "attempt_ch01_001",
  "chapterId": "ch01",
  "pov": "A",
  "category": "choice",
  "strength": "strong",
  "visibility": "known",
  "title": "A 检查了无发件人短信",
  "sourceNodeId": "ch01_a_001",
  "sourceChoiceId": "check_message",
  "writes": ["clues.no_sender_message"],
  "createdAt": 1730000110000
}
```

## 13. ChapterAttemptRecord 章节尝试记录

### 13.1 为什么需要 attempt

玩家可能多次重玩第一章。如果不区分 attempt，选择历史和因果记录会混杂在一起。

v0.1 可以实现轻量 attempt。

### 13.2 结构

```ts
type ChapterAttemptRecord = {
  attemptId: string;
  chapterId: string;
  pov: string;
  startedAt: number;
  endedAt?: number;
  endingId?: string;
  endingType?: "closed" | "canon";
  isCanon: boolean;
};
```

### 13.3 示例

```json
{
  "attemptId": "attempt_ch01_001",
  "chapterId": "ch01",
  "pov": "A",
  "startedAt": 1730000000000,
  "endedAt": 1730001200000,
  "endingId": "ch01_a_closed_misunderstanding",
  "endingType": "closed",
  "isCanon": false
}
```

## 14. 存档触发时机

### 14.1 进入节点后自动保存

触发时机：

```text
StoryEngine.enterNode 完成后
```

保存内容：

```text
currentChapter
currentNode
currentPov
runtime 状态
```

### 14.2 玩家选择后自动保存

触发时机：

```text
StoryEngine.choose 执行 effects 后
```

保存内容：

```text
属性变化
worldState
clues
relationships
choiceHistory
causalEvents
```

### 14.3 触发结局后自动保存

触发时机：

```text
进入 ending 节点并执行 ending.unlock 后
```

保存内容：

```text
archive.endings
progress.lastEnding
chapterAttempt
endingReview
如果是 canon，则写入 canonState 并解锁下一章
```

### 14.4 手动保存

MVP 可以不做手动保存。

如果做，建议只提供：

```text
继续游戏
重新开始章节
查看结局图鉴
```

## 15. 存档位设计

v0.1 推荐：

```text
1 个主存档
1 个自动存档
可选 1 个调试存档
```

本地 key 建议：

```text
noctilink.save.main
noctilink.save.autosave
noctilink.save.debug
```

正式 MVP 可以只使用：

```text
noctilink.save.main
```

## 16. 本地存储实现

Cocos 客户端可以通过本地存储保存 JSON 字符串。

建议封装为：

```ts
interface SaveProvider {
  load(slot: string): Promise<SaveData | null>;
  save(slot: string, data: SaveData): Promise<void>;
  delete(slot: string): Promise<void>;
  exists(slot: string): Promise<boolean>;
}
```

本地实现：

```ts
class LocalSaveProvider implements SaveProvider {
  async load(slot: string): Promise<SaveData | null> {
    const raw = localStorage.getItem(slot);
    if (!raw) return null;
    return JSON.parse(raw) as SaveData;
  }

  async save(slot: string, data: SaveData): Promise<void> {
    localStorage.setItem(slot, JSON.stringify(data));
  }

  async delete(slot: string): Promise<void> {
    localStorage.removeItem(slot);
  }

  async exists(slot: string): Promise<boolean> {
    return localStorage.getItem(slot) !== null;
  }
}
```

实际项目中应通过 Cocos 平台 API 或封装层调用，不要在业务代码到处直接操作 `localStorage`。

## 17. SaveManager 设计

### 17.1 职责

```text
初始化新存档
读取存档
写入存档
删除存档
自动保存
应用 runtime 变更
写入 archive
写入 canon
处理章节重玩
处理存档版本
```

### 17.2 接口草案

```ts
class SaveManager {
  async initNewGame(): Promise<SaveData>;

  async loadMainSave(): Promise<SaveData | null>;

  async saveMain(data: SaveData): Promise<void>;

  async autoSave(): Promise<void>;

  async deleteMainSave(): Promise<void>;

  unlockEnding(endingId: string, endingType: "closed" | "canon"): void;

  unlockArchiveClue(clueId: string, source?: string): void;

  unlockArchiveEntry(entryId: string, title: string): void;

  applyCanonEnding(chapterId: string, endingId: string, canonState: Record<string, unknown>, unlocks: string[]): void;

  startChapterAttempt(chapterId: string, pov: string): string;

  finishChapterAttempt(attemptId: string, endingId: string, endingType: "closed" | "canon"): void;
}
```

## 18. 新游戏初始化流程

```text
创建 SaveData
写入 meta
写入默认 runtime
写入空 archive
写入空 canon
写入空 history
设置 currentChapter = ch00
设置 currentNode = ch00_a_001
解锁 ch00 和 ch01
保存 main
```

示例初始进度：

```json
{
  "progress": {
    "unlockedChapters": ["ch00", "ch01"],
    "lastEnding": ""
  }
}
```

## 19. 章节开始流程

当玩家开始第一章：

```text
创建 chapterAttempt
设置 currentChapter = ch01
设置 currentNode = ch01_a_001
设置 currentPov = A
根据章节初始状态重置 runtime 局部变量
保留 archive
保留 canon
保存
```

## 20. 章节重玩规则

章节重玩时：

```text
runtime 状态重置为章节初始状态
archive 状态保留
canon 状态保留
choiceHistory 追加新的 attemptId
causalEvents 追加新的 attemptId
progress.lastEnding 不清空，可在触发新结局后覆盖
```

对于第一章：

```text
可以重新尝试获得不同 closed 结局
可以重新尝试 canon 结局
已解锁的结局不会丢失
已解锁的档案不会丢失
```

## 21. closed 结局保存流程

触发 closed 结局时：

```text
写入 archive.endings
写入 progress.lastEnding
写入 chapterAttempt.endingId
写入 chapterAttempt.endingType = closed
写入 chapterAttempt.isCanon = false
写入 endingReview
不写入 canonState
不解锁下一章
保存
```

伪代码：

```ts
function applyClosedEnding(ending: EndingDefinition): void {
  save.archive.endings[ending.id] = {
    endingId: ending.id,
    chapterId: ending.chapter,
    pov: ending.pov,
    endingType: "closed",
    category: ending.category,
    unlockedAt: Date.now(),
    firstAttemptId: currentAttemptId,
  };

  save.runtime.progress.lastEnding = ending.id;

  finishChapterAttempt(currentAttemptId, ending.id, "closed");

  saveMain(save);
}
```

## 22. canon 结局保存流程

触发 canon 结局时：

```text
写入 archive.endings
写入 progress.lastEnding
写入 canon.completedChapters
写入 canon.canonState
解锁下一章
写入 chapterAttempt.endingType = canon
写入 chapterAttempt.isCanon = true
保存
```

伪代码：

```ts
function applyCanonEnding(ending: EndingDefinition): void {
  save.archive.endings[ending.id] = {
    endingId: ending.id,
    chapterId: ending.chapter,
    pov: ending.pov,
    endingType: "canon",
    category: ending.category,
    unlockedAt: Date.now(),
    firstAttemptId: currentAttemptId,
  };

  save.canon.completedChapters[ending.chapter] = {
    chapterId: ending.chapter,
    canonEndingId: ending.id,
    completedAt: Date.now(),
    unlocks: [ending.nextChapter],
    canonStateKeys: Object.keys(ending.canonState),
  };

  for (const [key, value] of Object.entries(ending.canonState)) {
    save.canon.canonState[key] = value;
  }

  if (ending.nextChapter) {
    addUnlockedChapter(ending.nextChapter);
  }

  save.runtime.progress.lastEnding = ending.id;

  finishChapterAttempt(currentAttemptId, ending.id, "canon");

  saveMain(save);
}
```

## 23. 结局图鉴读取规则

结局图鉴读取：

```text
archive.endings
```

展示内容来自：

```text
endings.yml 定义
+
archive 中的解锁状态
```

显示规则：

```text
未解锁：显示 ??? 或隐藏
已解锁：显示标题、类型、简介、回看原因
canon 结局：额外显示“主线推进”
closed 结局：显示“路线闭合”
```

不要在玩家 UI 上直接写“假结局”。

## 24. 线索档案读取规则

线索有两种状态：

```text
clues.*：当前路线是否拥有
archive.clues.*：玩家是否曾经发现
```

例如：

```json
{
  "clues": {
    "core_signal": false
  },
  "archive": {
    "clues": {
      "core_signal": true
    }
  }
}
```

含义：

```text
当前路线没有 core_signal。
但玩家曾经在别的尝试中发现过它。
```

这可以用于后续提示和多周目。

## 25. 存档版本兼容

v0.1 必须预留版本字段：

```text
saveVersion
contentVersion
clientVersion
```

后续剧情内容更新后可能出现：

```text
节点 ID 改名
变量新增
变量删除
结局 ID 变更
章节重构
```

MVP 阶段不做复杂迁移，但至少要检测版本不匹配。

规则：

```text
如果 saveVersion 不兼容：
    提示存档版本过旧
    可选择重置 runtime
    archive 尽量保留

如果 contentVersion 不兼容：
    尝试继续
    如果 currentNode 不存在，则回到章节入口
```

## 26. 存档迁移预留

未来可增加：

```ts
interface SaveMigration {
  fromVersion: string;
  toVersion: string;
  migrate(save: SaveData): SaveData;
}
```

迁移示例：

```ts
class Migration_010_to_011 implements SaveMigration {
  fromVersion = "0.1.0";
  toVersion = "0.1.1";

  migrate(save: SaveData): SaveData {
    if (!save.runtime.world.flags) {
      save.runtime.world.flags = {};
    }
    return save;
  }
}
```

## 27. 存档校验规则

SaveManager 读取存档后应校验：

```text
meta 是否存在
runtime.currentChapter 是否存在
runtime.currentNode 是否存在于当前内容
runtime.currentPov 是否合法
attributes 是否符合 schema
world 是否符合 schema
clues 是否符合 schema
archive 是否为对象
canonState 中变量是否 canon_allowed
unlockedChapters 是否包含 ch00/ch01
```

如果校验失败：

```text
优先尝试修复
无法修复则回到章节入口
严重损坏则提示重开
```

## 28. 存档安全与防篡改

v0.1 本地单机阶段不做强防篡改。

可以做轻量校验：

```text
JSON parse 失败处理
schema 校验
关键字段补默认值
```

未来如加入云存档和商业化，再考虑：

```text
签名
哈希校验
服务端校验
异常存档检测
```

当前阶段不应把重点放在本地 JSON 防篡改上。

## 29. 存档与 StoryEngine 的关系

StoryEngine 不应直接操作底层存储。

正确调用链：

```text
StoryEngine
↓
WorldStateStore
↓
SaveManager
↓
SaveProvider
```

职责划分：

| 模块 | 职责 |
|---|---|
| StoryEngine | 执行剧情 |
| WorldStateStore | 管理当前状态 |
| SaveManager | 组装和维护存档 |
| SaveProvider | 负责实际读写 |

## 30. 存档与 WorldStateStore 的关系

WorldStateStore 保存运行时状态。

SaveManager 在保存时从 WorldStateStore 读取：

```text
attributes
world
clues
relationships
progress
```

加载存档时，SaveManager 将 runtime 注入 WorldStateStore。

流程：

```text
读取 SaveData
↓
校验 SaveData
↓
提取 runtime
↓
WorldStateStore.load(runtime)
↓
StoryEngine 进入 currentNode
```

## 31. 存档与结局系统的关系

结局系统触发后：

```text
EndingManager 读取 endings.yml
↓
判断 ending_type
↓
closed：写 archive
↓
canon：写 archive + canon + unlockedChapters
↓
SaveManager 保存
```

推荐模块：

```ts
class EndingManager {
  applyEnding(endingId: string): Promise<void>;
}
```

## 32. 存档与因果系统的关系

CausalGraphManager 记录因果事件。

SaveManager 保存：

```text
history.causalEvents
```

结局回看读取：

```text
ending_review.causes
+
history.causalEvents
```

如果某个 `ending_review cause` 未在当前 attempt 中出现：

```text
可显示为“未知原因”
或作为 StoryTool 校验警告
```

MVP 建议 StoryTool 强制校验 closed / canon 结局引用的因果事件存在于设计数据中。

## 33. 本地存档 JSON 示例

```json
{
  "meta": {
    "saveVersion": "0.1.0",
    "contentVersion": "story_0.1.0",
    "clientVersion": "client_0.1.0",
    "createdAt": 1730000000000,
    "updatedAt": 1730001200000
  },
  "runtime": {
    "currentChapter": "ch01",
    "currentNode": "ch01_a_canon_node",
    "currentPov": "A",
    "attributes": {
      "A": {
        "status": "alive",
        "sanity": 36,
        "stamina": 6,
        "money": 30,
        "insight": 4,
        "pollution": 28
      }
    },
    "world": {
      "scene": {
        "current_area": "unknown_layer",
        "rain_intensity": "abnormal",
        "power_state": "off"
      },
      "timeline": {
        "current_time": "23:17",
        "minutes_elapsed": 77,
        "has_reached_2317": true,
        "anomaly_phase": "visible"
      },
      "flags": {
        "ch01_started": true,
        "ch01_canon_reached": true,
        "a_knows_anomaly_exists": true,
        "a_saw_unknown_layer": true
      }
    },
    "clues": {
      "no_sender_message": true,
      "repeated_time_2317": true,
      "core_signal": true
    },
    "relationships": {},
    "progress": {
      "unlockedChapters": ["ch00", "ch01", "ch02"],
      "lastEnding": "ch01_a_canon_001"
    }
  },
  "archive": {
    "endings": {
      "ch01_a_canon_001": {
        "endingId": "ch01_a_canon_001",
        "chapterId": "ch01",
        "pov": "A",
        "endingType": "canon",
        "category": "mainline",
        "unlockedAt": 1730001200000,
        "firstAttemptId": "attempt_ch01_002"
      }
    },
    "clues": {
      "core_signal": {
        "clueId": "core_signal",
        "chapterId": "ch01",
        "unlockedAt": 1730001100000,
        "sourceNodeId": "ch01_a_020"
      }
    },
    "entries": {}
  },
  "canon": {
    "completedChapters": {
      "ch01": {
        "chapterId": "ch01",
        "canonEndingId": "ch01_a_canon_001",
        "completedAt": 1730001200000,
        "unlocks": ["ch02"],
        "canonStateKeys": [
          "attributes.A.status",
          "world.flags.ch01_canon_reached",
          "world.flags.a_knows_anomaly_exists",
          "world.flags.a_saw_unknown_layer",
          "world.timeline.anomaly_phase",
          "clues.core_signal"
        ]
      }
    },
    "canonState": {
      "attributes.A.status": "alive",
      "world.flags.ch01_canon_reached": true,
      "world.flags.a_knows_anomaly_exists": true,
      "world.flags.a_saw_unknown_layer": true,
      "world.timeline.anomaly_phase": "visible",
      "clues.core_signal": true
    }
  },
  "history": {
    "choiceHistory": [],
    "causalEvents": [],
    "chapterAttempts": []
  }
}
```

## 34. v0.1 禁止项

当前存档系统不支持：

```text
云存档
用户账号
后端同步
付费权益
广告奖励
多用户
复杂存档槽
完整时间线重算
跨章节 closed 结局继承
玩家自由回滚任意节点
```

如果后续需要新增，必须先更新本文档。

## 35. 当前拍板版本

v0.1 存档系统确认如下：

```text
使用本地存档。
默认单主存档。
存档分为 Runtime、Archive、Canon、History。
closed 结局只写 Archive，不写 Canon。
canon 结局写 Archive + Canon，并解锁下一章。
结局图鉴读取 Archive。
后续章节读取 Canon State。
Runtime 可在章节重玩时重置。
Archive 和 Canon 跨重玩保留。
存档必须包含 saveVersion 和 contentVersion。
```

## 36. 下一步

本文件完成后，下一步建议生成：

```text
docs/09_storytool_design.md
```

也就是 **StoryTool 工具链设计文档**。

该文档应定义：

```text
StoryTool 命令
YAML 校验规则
剧情节点构建流程
变量 schema 校验
结局校验
因果事件校验
输出 JSON 包结构
```
