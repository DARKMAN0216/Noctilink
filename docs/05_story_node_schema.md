# Noctilink 剧情节点数据结构设计 v0.1

> 建议仓库路径：`docs/05_story_node_schema.md`  
> 项目名：Noctilink / 夜链  
> 当前阶段：v0.1 MVP  
> 当前范围：序章 + 第一章，A 单视角，暂不考虑商业化、广告、支付、云存档和后端权益。

---

## 1. 文档目的

本文档定义 Noctilink 的剧情节点数据结构，用于支撑 v0.1 MVP 阶段的剧情生产、剧情校验、客户端剧情执行和后续 Codex 辅助生成内容。

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

本文档重点解决：

```text
剧情节点怎么写
选项怎么写
条件怎么判断
属性怎么变化
世界状态怎么读写
结局怎么触发
闭合结局和主线推进结局怎么区分
StoryTool 应该校验什么
客户端 StoryEngine 应该如何执行节点
```

---

## 2. 当前已确认的设计前提

### 2.1 MVP 内容范围

v0.1 MVP 不追求完整游戏，只验证核心玩法是否成立。

当前范围：

```text
序章 + 第一章
A 单视角可玩
属性判定
剧情选择
世界状态读写
章节闭合结局
主线推进结局
结局图鉴
本地存档
基础剧情数据校验
```

暂不实现：

```text
B/C 可玩视角
商业化
广告提示
真实支付
云存档
完整后端
复杂因果图 UI
多章节连锁分支继承
```

### 2.2 章节结局规则

Noctilink 不采用“所有结局都进入下一章”的结构。

每章允许多个结局，但结局分为两类：

```text
章节闭合结局 closed：
当前路线在本章内结束。
进入结局图鉴。
可以提供线索、档案、提示或世界观信息。
不解锁下一章。
不写入主线锚点状态。

主线推进结局 canon：
当前路线抵达后续章节所需状态。
进入结局图鉴。
解锁下一章。
写入 canon_state 作为后续章节继承基础。
```

原则：

```text
每章必须有且只有一个 canon 结局。
closed 结局不等于坏结局。
closed 结局可以是退场、误解、污染、幸存、牺牲等。
后续章节只继承 canon_state，而不是继承本章所有过程变量。
```

---

## 3. 核心设计原则

### 3.1 剧情数据驱动

剧情内容不写死在 TypeScript 代码里。

客户端只负责：

```text
读取剧情 JSON
显示文本
显示选项
判断条件
执行效果
跳转节点
触发结局
保存进度
```

剧情内容由 YAML 编写，经过 StoryTool 校验和构建后转换为 JSON。

### 3.2 条件和效果必须结构化

不推荐在 YAML 中直接写复杂脚本表达式。

不推荐：

```yaml
condition: "A.sanity > 20 && world.scene.door_open == true"
```

推荐：

```yaml
conditions:
  all:
    - var: attributes.A.sanity
      op: ">="
      value: 20
    - var: world.scene.door_open
      op: "=="
      value: true
```

原因：

```text
方便 StoryTool 校验变量是否存在
方便客户端安全执行
方便 Codex 稳定生成
方便后续做可视化剧情编辑器
```

### 3.3 当前 MVP 不处理商业化字段

v0.1 阶段暂不设计：

```text
paid
entitlement
shop
ad_hint
order
unlock_by_purchase
```

这些字段后续可以扩展，但当前 schema 不包含商业化逻辑。

---

## 4. 文件组织结构

推荐剧情内容目录：

```text
content/
  chapters/
    ch00_prologue/
      chapter.yml
      nodes_a.yml
      endings.yml

    ch01/
      chapter.yml
      nodes_a.yml
      endings.yml

  variables/
    world_state_schema.yml
    attributes_schema.yml
    condition_ops.yml

  characters/
    protagonist_a.yml
```

当前 MVP 只有 A 视角，因此只需要：

```text
nodes_a.yml
```

未来多视角扩展时再增加：

```text
nodes_b.yml
nodes_c.yml
```

---

## 5. chapter.yml 结构

每个章节需要一个章节配置文件。

示例：

```yaml
id: ch01
title: 第一章：雨夜异响
order: 1
pov_scope:
  - A

entry_node: ch01_a_001

summary: |
  A 在雨夜中接触到城市异常的第一个真实痕迹。
  本章用于验证属性判定、世界状态、闭合结局和主线推进结局。

unlock_rules:
  type: default
  available_from_start: true

next_chapter:
  id: ch02
  unlock_by_ending: ch01_a_canon_001

mvp_notes:
  playable: true
  commercial_features: false
  cloud_save: false
```

字段说明：

| 字段 | 说明 |
|---|---|
| id | 章节 ID |
| title | 章节标题 |
| order | 章节顺序 |
| pov_scope | 本章包含哪些视角，MVP 只写 A |
| entry_node | 章节入口节点 |
| summary | 章节简介 |
| unlock_rules | 章节解锁规则 |
| next_chapter | 下一章解锁规则 |
| mvp_notes | MVP 阶段备注 |

---

## 6. 剧情节点基本结构

剧情节点存放在：

```text
content/chapters/ch01/nodes_a.yml
```

基础示例：

```yaml
nodes:
  - id: ch01_a_001
    chapter: ch01
    pov: A
    node_kind: story
    time: "22:10"
    title: 走廊尽头

    text: |
      你站在走廊尽头。
      灯管闪烁了三次，空气里有一股像是烧焦塑料的味道。

    enter_conditions:
      all: []

    on_enter:
      effects: []

    choices:
      - id: inspect_corridor
        text: 观察走廊
        requirements:
          all:
            - var: attributes.A.insight
              op: ">="
              value: 2
        effects:
          - type: attribute.add
            target: attributes.A.sanity
            value: -1
          - type: attribute.add
            target: attributes.A.insight
            value: 1
          - type: world.set
            target: world.scene.a_found_camera
            value: true
          - type: clue.add
            target: clues.broken_camera
        next: ch01_a_002

      - id: leave_immediately
        text: 立刻离开
        requirements:
          all: []
        effects:
          - type: attribute.add
            target: attributes.A.stamina
            value: -1
          - type: world.set
            target: world.timeline.a_left_corridor_early
            value: true
        next: ch01_a_003
```

---

## 7. 节点字段说明

| 字段 | 必填 | 说明 |
|---|---:|---|
| id | 是 | 节点唯一 ID |
| chapter | 是 | 所属章节 |
| pov | 是 | 当前主角视角，MVP 固定为 A |
| node_kind | 是 | 节点类型 |
| time | 建议 | 当前时间线时间点 |
| title | 是 | 节点标题 |
| text | 是 | 剧情正文 |
| enter_conditions | 否 | 进入节点条件 |
| on_enter | 否 | 进入节点时自动执行的效果 |
| choices | 否 | 玩家可选项 |
| next | 否 | 无选择时的自动跳转 |
| ending | 否 | 触发结局 |
| tags | 否 | 辅助标签 |
| notes | 否 | 作者备注，不进入正式游戏 |

---

## 8. node_kind 节点类型

当前支持 4 类节点。

```text
story
router
ending
checkpoint
```

### 8.1 story

普通剧情节点。

用于：

```text
显示剧情正文
展示选项
执行玩家选择
跳转下一个节点
```

### 8.2 router

条件路由节点。

它可以不展示正文，或者只展示极短过渡文本，根据世界状态自动跳转。

示例：

```yaml
- id: ch01_a_route_final
  chapter: ch01
  pov: A
  node_kind: router
  title: 最终路线判定

  routes:
    - conditions:
        all:
          - var: clues.core_signal
            op: "=="
            value: true
          - var: attributes.A.sanity
            op: ">="
            value: 20
      next: ch01_a_canon_entry

    - conditions:
        all:
          - var: attributes.A.sanity
            op: "<"
            value: 20
      next: ch01_a_ending_pollution

    - conditions:
        all: []
      next: ch01_a_ending_misunderstanding
```

用途：

```text
减少复杂 if 分支
统一处理最终结局判定
让章节收束更清晰
```

### 8.3 ending

结局节点。

用于进入某个章节结局。

示例：

```yaml
- id: ch01_a_ending_retreat_node
  chapter: ch01
  pov: A
  node_kind: ending
  title: 结局：离开雨夜

  text: |
    你最终离开了那条街。
    第二天醒来时，一切似乎都恢复正常。

  ending:
    id: ch01_a_closed_002
```

### 8.4 checkpoint

检查点节点。

用于保存阶段进度，方便回溯。MVP 可以简单实现，后续再扩展。

示例：

```yaml
- id: ch01_a_checkpoint_001
  chapter: ch01
  pov: A
  node_kind: checkpoint
  title: 检查点：进入旧楼

  text: |
    你推开旧楼的门，潮湿的气味扑面而来。

  checkpoint:
    id: ch01_old_building_entry

  next: ch01_a_010
```

---

## 9. 选项结构

每个选项结构如下：

```yaml
- id: inspect_phone
  text: 检查手机里的未接来电

  requirements:
    all:
      - var: attributes.A.sanity
        op: ">="
        value: 10

  effects:
    - type: clue.add
      target: clues.unknown_call
    - type: attribute.add
      target: attributes.A.sanity
      value: -2

  next: ch01_a_006
```

字段说明：

| 字段 | 必填 | 说明 |
|---|---:|---|
| id | 是 | 当前节点内唯一的选项 ID |
| text | 是 | 玩家看到的选项文本 |
| requirements | 否 | 选项显示或选择条件 |
| effects | 否 | 选择后执行的效果 |
| next | 否 | 跳转节点 |
| ending | 否 | 直接触发结局 |
| hint | 否 | 开发期提示，不一定显示给玩家 |

---

## 10. 条件结构

条件统一使用：

```yaml
conditions:
  all:
    - var: attributes.A.sanity
      op: ">="
      value: 20
```

支持三种组合：

```text
all：全部满足
any：任意满足
not：取反
```

示例：

```yaml
requirements:
  all:
    - var: attributes.A.insight
      op: ">="
      value: 3
    - any:
        - var: clues.broken_camera
          op: "=="
          value: true
        - var: world.scene.camera_destroyed
          op: "=="
          value: true
    - not:
        var: world.flags.a_panicked
        op: "=="
        value: true
```

---

## 11. 条件操作符

当前 MVP 支持以下操作符：

| 操作符 | 说明 |
|---|---|
| `==` | 等于 |
| `!=` | 不等于 |
| `>` | 大于 |
| `>=` | 大于等于 |
| `<` | 小于 |
| `<=` | 小于等于 |
| `exists` | 变量存在 |
| `not_exists` | 变量不存在 |
| `in` | 值在数组中 |
| `not_in` | 值不在数组中 |

示例：

```yaml
- var: attributes.A.pollution
  op: ">="
  value: 30
```

```yaml
- var: clues.core_signal
  op: "exists"
```

```yaml
- var: world.scene.current_area
  op: "in"
  value:
    - old_station
    - sealed_lab
```

---

## 12. 效果结构

效果统一使用数组结构：

```yaml
effects:
  - type: attribute.add
    target: attributes.A.sanity
    value: -2

  - type: world.set
    target: world.scene.door_open
    value: true
```

---

## 13. 效果类型

### 13.1 attribute.set

设置属性值。

```yaml
- type: attribute.set
  target: attributes.A.sanity
  value: 30
```

### 13.2 attribute.add

属性增减。

```yaml
- type: attribute.add
  target: attributes.A.stamina
  value: -1
```

### 13.3 world.set

设置世界状态。

```yaml
- type: world.set
  target: world.scene.corridor_blocked
  value: true
```

### 13.4 world.add

数值型世界状态增减。

```yaml
- type: world.add
  target: world.timeline.delay_minutes
  value: 5
```

### 13.5 clue.add

添加线索。

```yaml
- type: clue.add
  target: clues.broken_camera
```

### 13.6 clue.remove

移除线索。

```yaml
- type: clue.remove
  target: clues.false_report
```

### 13.7 flag.set

设置普通剧情标记。

```yaml
- type: flag.set
  target: world.flags.a_saw_shadow
  value: true
```

### 13.8 relationship.add

关系值变化。虽然 MVP 只有 A 视角，但可以先保留关系字段。

```yaml
- type: relationship.add
  target: relationships.A.mysterious_woman.trust
  value: 1
```

### 13.9 causal.record

记录因果事件。MVP 可先记录基础因果事件，因果图 UI 后续再完善。

```yaml
- type: causal.record
  id: cause_ch01_a_found_camera
  title: A 发现损坏的监控
  visibility: known
  writes:
    - clues.broken_camera
    - world.scene.a_found_camera
```

### 13.10 ending.unlock

解锁结局。通常在 ending 节点中使用。

```yaml
- type: ending.unlock
  target: endings.ch01_a_closed_001
```

### 13.11 chapter.unlock

解锁章节。只能由主线推进结局触发。

```yaml
- type: chapter.unlock
  target: chapters.ch02
```

MVP 中建议不要在普通节点直接使用 `chapter.unlock`，只允许在主线推进结局的 `canon_state` 或 ending effect 中使用。

---

## 14. 结局数据结构

结局统一写在：

```text
content/chapters/ch01/endings.yml
```

示例：

```yaml
endings:
  - id: ch01_a_closed_001
    chapter: ch01
    pov: A
    title: 离开雨夜
    ending_type: closed
    category: retreat

    unlock_next_chapter: false

    summary: |
      A 离开了异常现场，短暂保住了安全，
      但也失去了接触真相的机会。

    archive:
      reveal:
        - 城市异常并不会因为逃离而消失。
      hint_for_replay: |
        也许应该在离开之前确认异常的来源。

    rewards:
      clues:
        - archive_abnormal_rain

  - id: ch01_a_canon_001
    chapter: ch01
    pov: A
    title: 雨夜之后
    ending_type: canon
    category: mainline

    unlock_next_chapter: true
    next_chapter: ch02

    summary: |
      A 没有逃避异常，而是获得了足以进入下一章的关键线索。

    canon_state:
      attributes.A.status: alive
      world.flags.ch01_canon_reached: true
      world.flags.a_knows_anomaly_exists: true
      clues.core_signal: true

    archive:
      reveal:
        - A 第一次确认异常真实存在。
        - 城市中存在某种隐藏信号。
```

---

## 15. ending_type 结局类型

只允许两种：

```text
closed
canon
```

### 15.1 closed

章节闭合结局。

特点：

```text
进入结局图鉴
不解锁下一章
不写入主线锚点
可提供线索、提示、档案信息
```

### 15.2 canon

主线推进结局。

特点：

```text
进入结局图鉴
解锁下一章
写入 canon_state
作为后续章节的继承基础
```

每章原则上只允许一个 canon 结局。

StoryTool 必须校验：

```text
每个章节必须有且只有一个 canon 结局
canon 结局必须 unlock_next_chapter = true
closed 结局不得 unlock_next_chapter = true
```

---

## 16. category 结局分类

`category` 用于细分结局展示。

当前支持：

```text
bad
retreat
misunderstanding
pollution
sacrifice
survival
mainline
```

| category | 说明 |
|---|---|
| bad | 明确失败、死亡、崩溃、被捕等 |
| retreat | 角色主动或被动退出事件核心 |
| misunderstanding | 误解真相，以错误答案结束 |
| pollution | 因污染影响进入闭合状态 |
| sacrifice | 牺牲某种重要代价换来闭合结果 |
| survival | 活下来但没有进入主线 |
| mainline | 主线推进结局 |

---

## 17. 主线锚点 canon_state

`canon_state` 只允许出现在 `ending_type: canon` 的结局中。

作用：

```text
定义下一章可以继承的最小主线状态
避免后续章节继承所有支线变量
防止多结局分支爆炸
```

示例：

```yaml
canon_state:
  attributes.A.status: alive
  world.flags.ch01_canon_reached: true
  world.flags.a_knows_anomaly_exists: true
  clues.core_signal: true
```

重要规则：

```text
canon_state 只保存后续章节必须知道的状态。
不要把本章所有过程变量都写进去。
```

---

## 18. 跳转规则

每个普通剧情节点必须满足以下条件之一：

```text
有 choices
有 next
有 ending
node_kind = router
```

不允许出现死节点。

合法示例 1：有选项

```yaml
choices:
  - id: go_left
    text: 向左走
    next: ch01_a_002
```

合法示例 2：自动跳转

```yaml
next: ch01_a_005
```

合法示例 3：结局节点

```yaml
ending:
  id: ch01_a_closed_001
```

---

## 19. 属性判定规则

属性判定可以用于：

```text
显示选项
隐藏选项
进入节点
决定路由
触发结局
```

推荐用法：

```yaml
requirements:
  all:
    - var: attributes.A.insight
      op: ">="
      value: 3
```

不推荐过度使用硬性属性门槛。

更好的设计是：

```text
属性高：获得更安全或更清晰的路线
属性低：仍可推进，但更容易进入闭合结局
```

示例：

```yaml
- id: force_door
  text: 强行撞门
  effects:
    - type: attribute.add
      target: attributes.A.stamina
      value: -2
    - type: world.set
      target: world.scene.door_open
      value: true
  next: ch01_a_012

- id: inspect_lock
  text: 检查门锁
  requirements:
    all:
      - var: attributes.A.insight
        op: ">="
        value: 3
  effects:
    - type: clue.add
      target: clues.old_lock_mark
  next: ch01_a_013
```

---

## 20. 隐藏选项规则

隐藏选项可以由以下条件解锁：

```text
属性达到要求
拥有线索
世界状态满足
曾经获得某个闭合结局
多周目条件
```

示例：

```yaml
- id: mention_signal
  text: 提到那个重复出现的信号
  requirements:
    all:
      - var: clues.core_signal
        op: "=="
        value: true
  effects:
    - type: world.set
      target: world.flags.a_mentioned_signal
      value: true
  next: ch01_a_hidden_001
```

MVP 阶段可以使用隐藏选项，但不强制做复杂多周目隐藏节点。

---

## 21. 选择历史记录

客户端需要记录每次选择。

结构建议：

```ts
type ChoiceRecord = {
  chapterId: string;
  nodeId: string;
  choiceId: string;
  pov: string;
  time: string;
  effects: string[];
  createdAt: number;
};
```

用途：

```text
存档
回溯
结局原因分析
后续因果图
调试剧情
```

---

## 22. 完整节点示例

```yaml
nodes:
  - id: ch01_a_001
    chapter: ch01
    pov: A
    node_kind: story
    time: "22:10"
    title: 雨夜中的旧楼

    text: |
      雨已经下了整整七天。
      你站在旧楼门口，手机屏幕上显示着一条没有发件人的短信。

      “不要在 23:17 之后相信这座城市。”

    enter_conditions:
      all: []

    on_enter:
      effects:
        - type: flag.set
          target: world.flags.ch01_started
          value: true

    choices:
      - id: check_message
        text: 重新检查短信
        requirements:
          all: []
        effects:
          - type: attribute.add
            target: attributes.A.sanity
            value: -1
          - type: clue.add
            target: clues.no_sender_message
          - type: causal.record
            id: cause_ch01_message_checked
            title: A 检查了无发件人短信
            visibility: known
            writes:
              - clues.no_sender_message
        next: ch01_a_002

      - id: enter_building
        text: 直接进入旧楼
        requirements:
          all: []
        effects:
          - type: attribute.add
            target: attributes.A.stamina
            value: -1
          - type: world.set
            target: world.scene.a_entered_old_building
            value: true
        next: ch01_a_003
```

---

## 23. 完整结局节点示例

```yaml
nodes:
  - id: ch01_a_ending_misunderstanding_node
    chapter: ch01
    pov: A
    node_kind: ending
    time: "23:05"
    title: 结局：错误的清晨

    text: |
      你最终相信，这一切只是连续失眠造成的错觉。
      第二天清晨，雨停了。

      但你发现手机里多出了一张照片。
      照片上，你站在昨晚从未去过的地方。

    on_enter:
      effects:
        - type: ending.unlock
          target: endings.ch01_a_closed_003
        - type: clue.add
          target: clues.photo_from_unknown_place

    ending:
      id: ch01_a_closed_003
```

对应 `endings.yml`：

```yaml
endings:
  - id: ch01_a_closed_003
    chapter: ch01
    pov: A
    title: 错误的清晨
    ending_type: closed
    category: misunderstanding
    unlock_next_chapter: false

    summary: |
      A 以为事件已经结束，但异常留下了无法解释的证据。

    archive:
      reveal:
        - 异常可以篡改人的记忆或位置认知。
      hint_for_replay: |
        也许不该太早相信“正常解释”。

    rewards:
      clues:
        - photo_from_unknown_place
```

---

## 24. 主线推进结局示例

```yaml
nodes:
  - id: ch01_a_canon_node
    chapter: ch01
    pov: A
    node_kind: ending
    time: "23:17"
    title: 结局：雨夜之后

    text: |
      你没有离开。
      当电子钟跳到 23:17 时，整条街的灯同时熄灭。

      你终于看见了那座城市的另一层轮廓。

    on_enter:
      effects:
        - type: ending.unlock
          target: endings.ch01_a_canon_001
        - type: chapter.unlock
          target: chapters.ch02

    ending:
      id: ch01_a_canon_001
```

对应 `endings.yml`：

```yaml
endings:
  - id: ch01_a_canon_001
    chapter: ch01
    pov: A
    title: 雨夜之后
    ending_type: canon
    category: mainline

    unlock_next_chapter: true
    next_chapter: ch02

    summary: |
      A 确认异常真实存在，并获得进入下一章所需的关键线索。

    canon_state:
      attributes.A.status: alive
      world.flags.ch01_canon_reached: true
      world.flags.a_knows_anomaly_exists: true
      clues.core_signal: true

    archive:
      reveal:
        - 城市存在无法被常规认知捕捉的异常层。
        - 23:17 是异常显现的重要时间点。
```

---

## 25. StoryEngine 执行流程

客户端执行流程：

```text
加载章节 JSON
↓
读取 entry_node
↓
进入节点
↓
检查 enter_conditions
↓
执行 on_enter.effects
↓
显示 text
↓
计算可用 choices
↓
玩家选择
↓
检查 requirements
↓
执行 effects
↓
记录 choiceHistory
↓
写入 worldState
↓
记录 causalEvents
↓
跳转 next / router / ending
↓
如果 ending_type = canon，则解锁下一章
```

---

## 26. StoryTool 校验规则

StoryTool 必须校验以下内容。

### 26.1 节点 ID 校验

```text
同一项目内节点 ID 不得重复。
节点 ID 必须符合命名规则。
```

命名规则：

```text
ch{章节编号}_{视角}_{序号}
```

示例：

```text
ch01_a_001
ch01_a_ending_001
ch01_a_router_final
```

### 26.2 next 指向校验

```text
所有 next 必须指向存在的节点。
不得指向其他章节节点，除非明确是章节跳转规则。
```

### 26.3 变量校验

```text
conditions 中引用的变量必须存在于 world_state_schema 或 attributes_schema。
effects 中写入的变量必须存在于 schema。
禁止临时创造未登记变量。
```

### 26.4 结局校验

```text
ending.id 必须存在于 endings.yml。
每个章节必须有且只有一个 canon 结局。
closed 结局不得 unlock_next_chapter。
canon 结局必须 unlock_next_chapter。
canon 结局必须包含 canon_state。
```

### 26.5 死路校验

```text
普通 story 节点必须至少有 choices / next / ending / router 之一。
不得存在不可达节点，除非标记 hidden。
```

### 26.6 效果校验

```text
effect.type 必须在允许列表中。
effect.target 必须合法。
effect.value 类型必须匹配变量定义。
attribute.add 只能用于数值变量。
world.set 的值必须匹配变量类型。
```

---

## 27. 当前 MVP 禁止项

当前剧情节点 schema 不支持：

```text
付费节点
广告提示
商品解锁
云存档权益
多人互动
实时战斗
脚本表达式
任意 JS 执行
动态下载脚本
```

如果后续需要扩展，必须先更新 schema 文档和 StoryTool 校验规则。

---

## 28. 后续扩展预留

未来多视角阶段可以增加：

```text
pov: B
pov: C
default_actions.yml
cross_pov_effects
causal_graph_unlock
loop_requirements
```

未来商业化阶段可以增加：

```yaml
access:
  type: free | purchase | chapter_pass
```

但 v0.1 不实现这些字段。

---

## 29. 当前拍板版本

v0.1 剧情节点 schema 确认如下：

```text
剧情源文件使用 YAML。
运行时数据使用 JSON。
条件使用结构化条件对象。
效果使用结构化 effect 数组。
结局单独写入 endings.yml。
结局分为 closed 和 canon。
每章必须有且只有一个 canon 结局。
只有 canon 结局解锁下一章。
closed 结局进入图鉴但不推进章节。
所有变量必须先登记到 schema。
StoryTool 必须校验节点、变量、跳转和结局。
```

---

## 30. 待补充项

当前文档不强制你补充信息即可使用。

后续如果要进一步细化，可以补充：

```text
A 的正式角色名
序章与第一章正式标题
第一章计划结局数量
第一章核心属性判定点
第一章主线推进结局条件
第一章 closed 结局分类
是否要在 MVP 中启用隐藏选项
是否要在 MVP 中启用 checkpoint 回溯
```

这些内容不影响本 schema 文档生成，但会影响下一步的 `world_state_schema` 和第一章时间线设计。

---

## 31. 下一步

本文件完成后，下一步应继续生成：

```text
docs/06_world_state_schema.md
```

该文档需要定义：

```text
attributes.A.sanity
attributes.A.stamina
attributes.A.money
attributes.A.insight
attributes.A.pollution

world.scene.*
world.timeline.*
world.flags.*
clues.*
relationships.*
loops.*
```

并约束每个变量的：

```text
类型
默认值
取值范围
是否可被剧情节点修改
是否进入存档
是否进入 canon_state
是否允许跨章节继承
```
