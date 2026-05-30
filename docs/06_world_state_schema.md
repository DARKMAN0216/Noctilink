# Noctilink 世界状态变量设计 v0.1

## 1. 文档目的

本文档定义 Noctilink v0.1 MVP 阶段的世界状态变量体系。

本文档用于约束：

```text
属性变量怎么命名
世界状态怎么分类
线索怎么记录
结局怎么记录
哪些状态进入存档
哪些状态允许进入主线锚点
哪些状态只属于本次章节尝试
StoryTool 如何校验变量是否合法
```

Noctilink 当前 MVP 范围为：

```text
序章 + 第一章
仅 A 视角可玩
存在属性判定
存在世界状态变化
存在多个章节闭合结局
存在 1 个主线推进结局
暂不考虑商业化、广告、支付、后端权益
```

---

## 2. 核心原则

### 2.1 所有变量必须先登记

剧情节点中禁止临时创造变量。

错误示例：

```yaml
effects:
  - type: world.set
    target: world.scene.random_new_flag
    value: true
```

如果 `world.scene.random_new_flag` 没有登记到 schema，StoryTool 必须报错。

正确流程：

```text
先在 schema 中登记变量
再在剧情节点中读取或写入该变量
```

### 2.2 世界状态分层管理

Noctilink 的状态分为三类：

```text
运行状态 Runtime State
档案状态 Archive State
主线锚点 Canon State
```

三者不能混在一起。

---

## 3. 三类状态说明

### 3.1 Runtime State：运行状态

运行状态是当前一次游玩中的即时状态。

包括：

```text
当前属性
当前线索
当前场景状态
当前时间线状态
当前剧情 flag
当前节点位置
```

特点：

```text
会随着玩家选择变化
会进入本地存档
章节重玩时可以重置
闭合结局不会把全部运行状态带入下一章
```

### 3.2 Archive State：档案状态

档案状态是玩家永久收集记录。

包括：

```text
已解锁结局
已解锁档案
已发现线索图鉴
已看过的提示
已解锁的隐藏信息
```

特点：

```text
跨章节保留
跨重玩保留
闭合结局也可以写入
用于结局图鉴、线索图鉴、多周目提示
```

即使玩家进入闭合结局，该结局本身也可以进入档案。

### 3.3 Canon State：主线锚点状态

主线锚点状态是后续章节唯一可以继承的主线状态。

特点：

```text
只由 canon 结局写入
只保存下一章必须知道的最小状态
不继承所有过程变量
用于防止多结局分支爆炸
```

示例：

```yaml
canon_state:
  attributes.A.status: alive
  world.flags.ch01_canon_reached: true
  world.flags.a_knows_anomaly_exists: true
  clues.core_signal: true
```

---

## 4. 状态命名空间

v0.1 使用以下顶级命名空间：

```text
attributes
world
clues
relationships
archive
progress
```

| 命名空间 | 用途 |
|---|---|
| attributes | 角色属性 |
| world | 场景、时间线、剧情 flag |
| clues | 当前路线中获得的线索 |
| relationships | 角色关系，MVP 可少量预留 |
| archive | 永久档案状态 |
| progress | 当前章节、节点、结局进度 |

当前不使用：

```text
entitlements
orders
ads
shop
```

商业化相关命名空间 v0.1 不设计。

---

## 5. attributes 角色属性

### 5.1 命名规则

```text
attributes.{角色ID}.{属性名}
```

MVP 只有 A 视角，因此当前只定义：

```text
attributes.A.*
```

未来扩展：

```text
attributes.B.*
attributes.C.*
```

### 5.2 A 的核心属性

当前 A 角色属性：

```text
attributes.A.status
attributes.A.sanity
attributes.A.stamina
attributes.A.money
attributes.A.insight
attributes.A.pollution
```

### 5.3 attributes.A.status

```yaml
id: attributes.A.status
type: enum
default: alive
values:
  - alive
  - injured
  - unconscious
  - missing
  - dead
  - contaminated
persist: true
canon_allowed: true
description: A 的生存与剧情状态。
```

说明：

```text
alive：正常存活
injured：受伤但仍可行动
unconscious：失去行动能力
missing：失踪或退场
dead：死亡
contaminated：被污染主导
```

该变量允许进入 `canon_state`，但应谨慎使用。

### 5.4 attributes.A.sanity

```yaml
id: attributes.A.sanity
type: int
default: 50
min: 0
max: 100
persist: true
canon_allowed: false
description: A 的理智值，影响异常承受能力和部分结局。
```

| 范围 | 含义 |
|---|---|
| 80-100 | 理智稳定 |
| 50-79 | 正常但受压 |
| 20-49 | 明显动摇 |
| 1-19 | 接近崩溃 |
| 0 | 理智崩溃 |

常见用法：

```yaml
- var: attributes.A.sanity
  op: ">="
  value: 20
```

不建议把具体数值写入 `canon_state`，后续章节一般只需要知道 A 是否通过主线，而不需要继承每一点理智值。

### 5.5 attributes.A.stamina

```yaml
id: attributes.A.stamina
type: int
default: 10
min: 0
max: 20
persist: true
canon_allowed: false
description: A 的体力值，影响逃跑、调查、强行动作。
```

| 范围 | 含义 |
|---|---|
| 15-20 | 状态良好 |
| 8-14 | 可以正常行动 |
| 3-7 | 明显疲惫 |
| 1-2 | 接近极限 |
| 0 | 无法继续进行高强度行动 |

常见效果：

```yaml
- type: attribute.add
  target: attributes.A.stamina
  value: -1
```

### 5.6 attributes.A.money

```yaml
id: attributes.A.money
type: int
default: 30
min: 0
max: 999
persist: true
canon_allowed: false
description: A 当前可支配金钱，用于交通、道具、信息或其他现实资源。
```

MVP 中金钱可以弱化使用，不强行做经济系统。

常见用法：

```yaml
requirements:
  all:
    - var: attributes.A.money
      op: ">="
      value: 10
```

### 5.7 attributes.A.insight

```yaml
id: attributes.A.insight
type: int
default: 2
min: 0
max: 20
persist: true
canon_allowed: false
description: A 的洞察能力，影响发现线索、识破异常和隐藏选项。
```

洞察适合用于：

```text
发现隐藏线索
识破谎言
开启观察类选项
避免误解结局
```

示例：

```yaml
requirements:
  all:
    - var: attributes.A.insight
      op: ">="
      value: 3
```

### 5.8 attributes.A.pollution

```yaml
id: attributes.A.pollution
type: int
default: 0
min: 0
max: 100
persist: true
canon_allowed: false
description: A 的污染值，影响是否能看见异常层，也影响失控风险。
```

污染值不是单纯负面属性。

| 范围 | 含义 |
|---|---|
| 0-9 | 几乎不受污染，但难以看见异常 |
| 10-29 | 轻度污染，可感知部分异常 |
| 30-59 | 中度污染，可看见隐藏信息 |
| 60-89 | 高度污染，获得特殊认知但风险变高 |
| 90-100 | 接近失控 |

污染值设计重点：

```text
污染值过低：看不到某些真相
污染值适中：可以进入主线推进路线
污染值过高：可能进入污染闭合结局
```

---

## 6. world 世界状态

`world` 用于记录剧情世界中的状态。

分为：

```text
world.scene
world.timeline
world.flags
```

### 6.1 world.scene 场景状态

用于记录当前章节内的场景变化。

命名规则：

```text
world.scene.{变量名}
```

#### 6.1.1 world.scene.current_area

```yaml
id: world.scene.current_area
type: enum
default: street
values:
  - street
  - old_building
  - corridor
  - rooftop
  - underground
  - unknown_layer
persist: true
canon_allowed: false
description: 当前所在区域。
```

#### 6.1.2 world.scene.rain_intensity

```yaml
id: world.scene.rain_intensity
type: enum
default: normal
values:
  - none
  - light
  - normal
  - heavy
  - abnormal
persist: true
canon_allowed: false
description: 雨势状态，可用于氛围和异常条件。
```

#### 6.1.3 world.scene.power_state

```yaml
id: world.scene.power_state
type: enum
default: unstable
values:
  - normal
  - unstable
  - off
  - abnormal
persist: true
canon_allowed: false
description: 场景电力状态。
```

#### 6.1.4 world.scene.door_old_building_open

```yaml
id: world.scene.door_old_building_open
type: bool
default: false
persist: true
canon_allowed: false
description: 旧楼大门是否已经打开。
```

#### 6.1.5 world.scene.corridor_blocked

```yaml
id: world.scene.corridor_blocked
type: bool
default: false
persist: true
canon_allowed: false
description: 走廊是否被阻塞。
```

#### 6.1.6 world.scene.phone_signal_state

```yaml
id: world.scene.phone_signal_state
type: enum
default: weak
values:
  - normal
  - weak
  - none
  - abnormal
persist: true
canon_allowed: false
description: 手机信号状态。
```

#### 6.1.7 world.scene.mirror_state

```yaml
id: world.scene.mirror_state
type: enum
default: normal
values:
  - normal
  - cracked
  - no_reflection
  - delayed_reflection
persist: true
canon_allowed: false
description: 镜面异常状态。
```

### 6.2 world.timeline 时间线状态

用于记录当前章节内的重要时间线变量。

命名规则：

```text
world.timeline.{变量名}
```

#### 6.2.1 world.timeline.current_time

```yaml
id: world.timeline.current_time
type: string
default: "22:00"
persist: true
canon_allowed: false
description: 当前剧情时间，格式 HH:mm。
```

说明：

```text
current_time 主要用于展示和剧情判断。
不建议做复杂真实时间计算。
```

#### 6.2.2 world.timeline.minutes_elapsed

```yaml
id: world.timeline.minutes_elapsed
type: int
default: 0
min: 0
max: 300
persist: true
canon_allowed: false
description: 当前章节内经过的分钟数。
```

可用于控制时间耗尽结局。

#### 6.2.3 world.timeline.has_reached_2317

```yaml
id: world.timeline.has_reached_2317
type: bool
default: false
persist: true
canon_allowed: false
description: 是否抵达异常关键时间点 23:17。
```

该变量适合作为第一章主线推进节点的条件之一。

#### 6.2.4 world.timeline.anomaly_phase

```yaml
id: world.timeline.anomaly_phase
type: enum
default: dormant
values:
  - dormant
  - unstable
  - visible
  - spreading
persist: true
canon_allowed: true
description: 当前异常显现阶段。
```

该变量可进入 `canon_state`，但只建议写入抽象阶段，不继承全部过程细节。

#### 6.2.5 world.timeline.a_called_for_help

```yaml
id: world.timeline.a_called_for_help
type: bool
default: false
persist: true
canon_allowed: false
description: A 是否尝试求助。
```

#### 6.2.6 world.timeline.a_delayed_minutes

```yaml
id: world.timeline.a_delayed_minutes
type: int
default: 0
min: 0
max: 60
persist: true
canon_allowed: false
description: A 因选择导致的延误分钟数。
```

### 6.3 world.flags 剧情标记

用于记录布尔型剧情状态。

命名规则：

```text
world.flags.{变量名}
```

#### 6.3.1 world.flags.ch00_finished

```yaml
id: world.flags.ch00_finished
type: bool
default: false
persist: true
canon_allowed: true
description: 序章是否完成。
```

#### 6.3.2 world.flags.ch01_started

```yaml
id: world.flags.ch01_started
type: bool
default: false
persist: true
canon_allowed: false
description: 第一章是否已经开始。
```

#### 6.3.3 world.flags.ch01_canon_reached

```yaml
id: world.flags.ch01_canon_reached
type: bool
default: false
persist: true
canon_allowed: true
description: 第一章是否抵达主线推进结局。
```

该变量必须由第一章 canon 结局写入。

#### 6.3.4 world.flags.a_knows_anomaly_exists

```yaml
id: world.flags.a_knows_anomaly_exists
type: bool
default: false
persist: true
canon_allowed: true
description: A 是否确认异常真实存在。
```

这是第二章很可能需要继承的关键信息。

#### 6.3.5 world.flags.a_tried_to_escape

```yaml
id: world.flags.a_tried_to_escape
type: bool
default: false
persist: true
canon_allowed: false
description: A 是否尝试直接逃离异常现场。
```

#### 6.3.6 world.flags.a_saw_unknown_layer

```yaml
id: world.flags.a_saw_unknown_layer
type: bool
default: false
persist: true
canon_allowed: true
description: A 是否看见城市异常层。
```

可进入主线锚点。

#### 6.3.7 world.flags.a_denied_anomaly

```yaml
id: world.flags.a_denied_anomaly
type: bool
default: false
persist: true
canon_allowed: false
description: A 是否主动否认异常存在。
```

适合进入误解结局判断，不建议继承到下一章。

---

## 7. clues 线索状态

### 7.1 命名规则

```text
clues.{线索ID}
```

线索状态使用布尔值。

示例：

```yaml
id: clues.no_sender_message
type: bool
default: false
persist: true
canon_allowed: false
description: 是否发现无发件人短信。
```

### 7.2 MVP 基础线索

#### 7.2.1 clues.no_sender_message

```yaml
id: clues.no_sender_message
type: bool
default: false
persist: true
canon_allowed: false
description: A 是否检查过无发件人短信。
```

#### 7.2.2 clues.repeated_time_2317

```yaml
id: clues.repeated_time_2317
type: bool
default: false
persist: true
canon_allowed: true
description: A 是否发现 23:17 重复出现。
```

适合进入主线锚点。

#### 7.2.3 clues.broken_camera

```yaml
id: clues.broken_camera
type: bool
default: false
persist: true
canon_allowed: false
description: A 是否发现损坏的监控设备。
```

#### 7.2.4 clues.abnormal_rain

```yaml
id: clues.abnormal_rain
type: bool
default: false
persist: true
canon_allowed: false
description: A 是否意识到雨势异常。
```

#### 7.2.5 clues.distorted_reflection

```yaml
id: clues.distorted_reflection
type: bool
default: false
persist: true
canon_allowed: false
description: A 是否发现镜中倒影异常。
```

#### 7.2.6 clues.core_signal

```yaml
id: clues.core_signal
type: bool
default: false
persist: true
canon_allowed: true
description: 第一章主线推进所需的核心线索。
```

`clues.core_signal` 是第一章 canon 结局的重要条件之一。

### 7.3 线索设计规则

线索分为两类：

```text
普通线索
主线线索
```

普通线索用于：

```text
解锁隐藏选项
避免闭合结局
补全档案
提供重玩提示
```

主线线索用于：

```text
进入 canon 结局
写入 canon_state
解锁下一章
```

建议第一章只设置 1 个核心主线线索：

```text
clues.core_signal
```

避免主线条件过于复杂。

---

## 8. relationships 关系状态

MVP 只有 A 视角，关系系统可以先轻量预留。

命名规则：

```text
relationships.{角色ID}.{对象ID}.{关系名}
```

示例：

```text
relationships.A.mysterious_woman.trust
```

### 8.1 relationships.A.mysterious_woman.trust

```yaml
id: relationships.A.mysterious_woman.trust
type: int
default: 0
min: -10
max: 10
persist: true
canon_allowed: false
description: A 对神秘女性或关键 NPC 的信任关系。
```

### 8.2 relationships.A.unknown_caller.trust

```yaml
id: relationships.A.unknown_caller.trust
type: int
default: 0
min: -10
max: 10
persist: true
canon_allowed: false
description: A 对未知来电者的信任程度。
```

MVP 中关系系统不必复杂使用，只保留少数关键 NPC 即可。

---

## 9. archive 档案状态

archive 记录玩家永久解锁内容。

与 `world` 不同，archive 不表示当前路线状态，而是玩家账号或本地存档中的长期收集记录。

命名空间：

```text
archive.endings
archive.clues
archive.entries
```

### 9.1 archive.endings

记录已解锁结局。

结构建议：

```json
{
  "archive": {
    "endings": {
      "ch01_a_closed_001": true,
      "ch01_a_closed_002": true,
      "ch01_a_canon_001": true
    }
  }
}
```

变量 schema 可抽象为：

```yaml
id: archive.endings.*
type: bool
default: false
persist: true
canon_allowed: false
description: 已解锁结局图鉴。
```

### 9.2 archive.clues

记录已永久收录的线索图鉴。

注意：

```text
clues.* 表示当前路线中是否拥有该线索。
archive.clues.* 表示玩家是否曾经发现过该线索。
```

示例：

```json
{
  "clues": {
    "core_signal": true
  },
  "archive": {
    "clues": {
      "core_signal": true
    }
  }
}
```

### 9.3 archive.entries

记录档案条目。

示例：

```yaml
id: archive.entries.abnormal_rain
type: bool
default: false
persist: true
canon_allowed: false
description: 是否解锁“异常雨夜”档案条目。
```

档案条目可以由闭合结局解锁。

---

## 10. progress 进度状态

progress 用于记录当前进度。

### 10.1 progress.current_chapter

```yaml
id: progress.current_chapter
type: string
default: ch00
persist: true
canon_allowed: false
description: 当前章节 ID。
```

### 10.2 progress.current_node

```yaml
id: progress.current_node
type: string
default: ch00_a_001
persist: true
canon_allowed: false
description: 当前剧情节点 ID。
```

### 10.3 progress.current_pov

```yaml
id: progress.current_pov
type: enum
default: A
values:
  - A
  - B
  - C
persist: true
canon_allowed: false
description: 当前视角。MVP 固定为 A。
```

### 10.4 progress.unlocked_chapters

```yaml
id: progress.unlocked_chapters
type: string_array
default:
  - ch00
  - ch01
persist: true
canon_allowed: false
description: 已解锁章节列表。
```

MVP 阶段：

```text
序章和第一章可默认解锁。
第二章只有第一章 canon 结局后解锁。
```

### 10.5 progress.last_ending

```yaml
id: progress.last_ending
type: string
default: ""
persist: true
canon_allowed: false
description: 最近一次触发的结局 ID。
```

---

## 11. loops 多周目状态

虽然 MVP 不强制做复杂多周目，但需要预留基础字段。

命名空间建议放在：

```text
world.loops
```

### 11.1 world.loops.loop_index

```yaml
id: world.loops.loop_index
type: int
default: 1
min: 1
max: 99
persist: true
canon_allowed: false
description: 当前周目次数。
```

### 11.2 world.loops.ch01_replayed

```yaml
id: world.loops.ch01_replayed
type: bool
default: false
persist: true
canon_allowed: false
description: 第一章是否被重新游玩过。
```

### 11.3 world.loops.memory_fragment_ch01

```yaml
id: world.loops.memory_fragment_ch01
type: bool
default: false
persist: true
canon_allowed: false
description: 是否获得第一章记忆碎片。
```

MVP 阶段可暂不启用复杂逻辑。

---

## 12. 变量 schema 标准格式

所有变量定义建议采用统一格式。

```yaml
- id: attributes.A.sanity
  type: int
  default: 50
  min: 0
  max: 100
  persist: true
  canon_allowed: false
  description: A 的理智值。
```

| 字段 | 必填 | 说明 |
|---|---:|---|
| id | 是 | 变量完整路径 |
| type | 是 | 变量类型 |
| default | 是 | 默认值 |
| min | 否 | 数值最小值 |
| max | 否 | 数值最大值 |
| values | 否 | enum 允许值 |
| persist | 是 | 是否进入存档 |
| canon_allowed | 是 | 是否允许写入 canon_state |
| description | 是 | 变量说明 |

---

## 13. 变量类型

当前支持：

```text
bool
int
float
string
enum
string_array
```

MVP 优先使用：

```text
bool
int
string
enum
string_array
```

不建议 v0.1 使用复杂对象类型作为剧情变量。

---

## 14. 默认初始状态

MVP 初始状态建议如下：

```json
{
  "attributes": {
    "A": {
      "status": "alive",
      "sanity": 50,
      "stamina": 10,
      "money": 30,
      "insight": 2,
      "pollution": 0
    }
  },
  "world": {
    "scene": {
      "current_area": "street",
      "rain_intensity": "normal",
      "power_state": "unstable",
      "door_old_building_open": false,
      "corridor_blocked": false,
      "phone_signal_state": "weak",
      "mirror_state": "normal"
    },
    "timeline": {
      "current_time": "22:00",
      "minutes_elapsed": 0,
      "has_reached_2317": false,
      "anomaly_phase": "dormant",
      "a_called_for_help": false,
      "a_delayed_minutes": 0
    },
    "flags": {
      "ch00_finished": false,
      "ch01_started": false,
      "ch01_canon_reached": false,
      "a_knows_anomaly_exists": false,
      "a_tried_to_escape": false,
      "a_saw_unknown_layer": false,
      "a_denied_anomaly": false
    },
    "loops": {
      "loop_index": 1,
      "ch01_replayed": false,
      "memory_fragment_ch01": false
    }
  },
  "clues": {
    "no_sender_message": false,
    "repeated_time_2317": false,
    "broken_camera": false,
    "abnormal_rain": false,
    "distorted_reflection": false,
    "core_signal": false
  },
  "relationships": {
    "A": {
      "mysterious_woman": {
        "trust": 0
      },
      "unknown_caller": {
        "trust": 0
      }
    }
  },
  "archive": {
    "endings": {},
    "clues": {},
    "entries": {}
  },
  "progress": {
    "current_chapter": "ch00",
    "current_node": "ch00_a_001",
    "current_pov": "A",
    "unlocked_chapters": ["ch00", "ch01"],
    "last_ending": ""
  }
}
```

---

## 15. 结局后的状态处理

### 15.1 closed 结局

闭合结局触发后：

```text
写入 archive.endings
可写入 archive.clues
可写入 archive.entries
可写入 progress.last_ending
不写入 canon_state
不解锁下一章
不把完整 Runtime State 带入下一章
```

示例：

```yaml
ending_type: closed
unlock_next_chapter: false
rewards:
  archive_entries:
    - abnormal_rain
```

### 15.2 canon 结局

主线推进结局触发后：

```text
写入 archive.endings
写入 canon_state
解锁下一章
更新 progress.unlocked_chapters
可写入主线线索
```

示例：

```yaml
ending_type: canon
unlock_next_chapter: true
next_chapter: ch02

canon_state:
  attributes.A.status: alive
  world.flags.ch01_canon_reached: true
  world.flags.a_knows_anomaly_exists: true
  world.flags.a_saw_unknown_layer: true
  world.timeline.anomaly_phase: visible
  clues.core_signal: true
```

---

## 16. canon_state 白名单规则

只有 `canon_allowed: true` 的变量允许写入 `canon_state`。

当前允许进入 canon_state 的变量建议为：

```text
attributes.A.status
world.flags.ch00_finished
world.flags.ch01_canon_reached
world.flags.a_knows_anomaly_exists
world.flags.a_saw_unknown_layer
world.timeline.anomaly_phase
clues.repeated_time_2317
clues.core_signal
```

不建议进入 canon_state 的变量：

```text
attributes.A.sanity
attributes.A.stamina
attributes.A.money
attributes.A.insight
attributes.A.pollution
world.scene.current_area
world.timeline.minutes_elapsed
relationships.*
```

原因：

```text
这些变量属于过程状态。
继承它们会增加后续章节复杂度。
```

---

## 17. StoryTool 校验规则

StoryTool 必须校验以下内容。

### 17.1 变量是否存在

剧情节点中所有引用的变量必须登记在 schema 中。

包括：

```text
conditions.var
effects.target
canon_state key
router 条件变量
```

### 17.2 类型是否匹配

示例：

```text
bool 变量只能写 true / false
int 变量只能写整数
enum 变量只能写 values 中存在的值
string_array 变量只能写字符串数组
```

错误示例：

```yaml
- type: world.set
  target: world.scene.door_old_building_open
  value: "yes"
```

原因：

```text
door_old_building_open 是 bool，不能写字符串。
```

### 17.3 数值范围是否越界

示例：

```yaml
- type: attribute.set
  target: attributes.A.sanity
  value: 120
```

如果 `attributes.A.sanity.max = 100`，StoryTool 应报错。

对于 `attribute.add`，运行时也需要 clamp：

```text
最终值不得小于 min
最终值不得大于 max
```

### 17.4 enum 值是否合法

示例：

```yaml
- type: world.set
  target: world.timeline.anomaly_phase
  value: "chaos"
```

如果 `chaos` 不在 enum values 中，StoryTool 应报错。

### 17.5 canon_state 是否越权

如果某个变量 `canon_allowed: false`，则不得写入 `canon_state`。

错误示例：

```yaml
canon_state:
  attributes.A.sanity: 43
```

原因：

```text
sanity 是过程属性，不允许成为主线锚点。
```

### 17.6 商业化变量禁止出现

v0.1 禁止出现：

```text
entitlements.*
orders.*
ads.*
shop.*
paid.*
```

出现这些变量时 StoryTool 应警告或报错。

---

## 18. Effect 与变量类型关系

| effect.type | 允许目标类型 |
|---|---|
| attribute.set | attributes 下的 int / enum / string |
| attribute.add | attributes 下的 int / float |
| world.set | world 下任意已登记变量 |
| world.add | world 下 int / float |
| clue.add | clues 下 bool |
| clue.remove | clues 下 bool |
| flag.set | world.flags 下 bool |
| relationship.add | relationships 下 int |
| causal.record | 不直接修改变量 |
| ending.unlock | archive.endings |
| chapter.unlock | progress.unlocked_chapters |

---

## 19. 存档结构建议

MVP 本地存档至少包含：

```ts
type SaveData = {
  version: string;
  contentVersion: string;

  runtime: {
    attributes: Record<string, unknown>;
    world: Record<string, unknown>;
    clues: Record<string, boolean>;
    relationships: Record<string, unknown>;
    progress: Record<string, unknown>;
  };

  archive: {
    endings: Record<string, boolean>;
    clues: Record<string, boolean>;
    entries: Record<string, boolean>;
  };

  choiceHistory: ChoiceRecord[];
  causalEvents: CausalEvent[];

  canon: {
    completedChapters: Record<string, string>;
    canonState: Record<string, unknown>;
  };

  updatedAt: number;
};
```

说明：

```text
runtime：当前章节尝试中的状态
archive：永久收集记录
canon：主线推进状态
choiceHistory：选择历史
causalEvents：因果事件记录
```

---

## 20. 章节重玩状态处理

当玩家重玩某章节时：

```text
runtime 状态可以按章节初始状态重置
archive 状态保留
canon 状态保留，除非玩家重新达成 canon 结局并选择覆盖
choiceHistory 可追加或分 attempt 记录
```

建议增加 attempt 概念：

```ts
type ChapterAttempt = {
  attemptId: string;
  chapterId: string;
  startedAt: number;
  endedAt?: number;
  endingId?: string;
  isCanon: boolean;
};
```

MVP 可以先简化，不强制实现复杂 attempt 管理。

---

## 21. 示例：闭合结局写入状态

```yaml
- id: ch01_a_ending_retreat_node
  node_kind: ending
  on_enter:
    effects:
      - type: ending.unlock
        target: endings.ch01_a_closed_retreat
      - type: clue.add
        target: clues.abnormal_rain
      - type: world.set
        target: progress.last_ending
        value: ch01_a_closed_retreat
  ending:
    id: ch01_a_closed_retreat
```

对应规则：

```text
结局进入 archive.endings
线索可以进入当前 clues
线索也可作为奖励进入 archive.clues
不解锁 ch02
```

---

## 22. 示例：主线推进结局写入状态

```yaml
endings:
  - id: ch01_a_canon_001
    ending_type: canon
    unlock_next_chapter: true
    next_chapter: ch02

    canon_state:
      attributes.A.status: alive
      world.flags.ch01_canon_reached: true
      world.flags.a_knows_anomaly_exists: true
      world.flags.a_saw_unknown_layer: true
      world.timeline.anomaly_phase: visible
      clues.core_signal: true
```

StoryTool 必须校验：

```text
所有 canon_state 变量存在
所有 canon_state 变量 canon_allowed = true
next_chapter 存在
unlock_next_chapter = true
该章节没有第二个 canon 结局
```

---

## 23. 当前变量清单汇总

### 23.1 attributes

```text
attributes.A.status
attributes.A.sanity
attributes.A.stamina
attributes.A.money
attributes.A.insight
attributes.A.pollution
```

### 23.2 world.scene

```text
world.scene.current_area
world.scene.rain_intensity
world.scene.power_state
world.scene.door_old_building_open
world.scene.corridor_blocked
world.scene.phone_signal_state
world.scene.mirror_state
```

### 23.3 world.timeline

```text
world.timeline.current_time
world.timeline.minutes_elapsed
world.timeline.has_reached_2317
world.timeline.anomaly_phase
world.timeline.a_called_for_help
world.timeline.a_delayed_minutes
```

### 23.4 world.flags

```text
world.flags.ch00_finished
world.flags.ch01_started
world.flags.ch01_canon_reached
world.flags.a_knows_anomaly_exists
world.flags.a_tried_to_escape
world.flags.a_saw_unknown_layer
world.flags.a_denied_anomaly
```

### 23.5 clues

```text
clues.no_sender_message
clues.repeated_time_2317
clues.broken_camera
clues.abnormal_rain
clues.distorted_reflection
clues.core_signal
```

### 23.6 relationships

```text
relationships.A.mysterious_woman.trust
relationships.A.unknown_caller.trust
```

### 23.7 archive

```text
archive.endings.*
archive.clues.*
archive.entries.*
```

### 23.8 progress

```text
progress.current_chapter
progress.current_node
progress.current_pov
progress.unlocked_chapters
progress.last_ending
```

### 23.9 loops

```text
world.loops.loop_index
world.loops.ch01_replayed
world.loops.memory_fragment_ch01
```

---

## 24. v0.1 禁止项

当前世界状态 schema 不包含：

```text
付费权益变量
广告变量
订单变量
商城变量
多人状态
复杂背包系统
复杂装备系统
战斗状态
B/C 视角属性
```

如果后续要加入这些内容，必须先更新本文档。

---

## 25. 当前拍板版本

v0.1 世界状态规则确认如下：

```text
所有变量必须先登记到 schema。
剧情节点不得临时创造变量。
状态分为 Runtime State、Archive State、Canon State。
closed 结局只写入档案，不解锁下一章。
canon 结局写入 canon_state 并解锁下一章。
只有 canon_allowed = true 的变量可进入 canon_state。
第一章只允许一个 canon 结局。
MVP 只定义 A 的属性和第一章所需状态。
商业化相关状态暂不设计。
```

---

## 26. 下一步

本文件完成后，下一步应继续生成：

```text
docs/07_causal_graph_rules.md
```

该文档需要定义：

```text
什么是因果节点
因果节点什么时候记录
闭合结局如何反推原因
主线推进结局如何记录关键路径
哪些因果信息在 MVP 中展示
哪些因果信息只用于调试
后续多视角如何扩展因果图
```
