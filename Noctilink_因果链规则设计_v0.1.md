# Noctilink 因果链规则设计 v0.1

## 1. 文档目的

本文档定义 Noctilink v0.1 MVP 阶段的因果链系统规则。

Noctilink 的核心体验不是普通“选择分支”，而是：

```text
玩家的选择会改变属性、线索、世界状态和结局走向。
不同结局不是随机发生，而是由一组可追溯的因果节点导致。
```

在 v0.1 MVP 阶段，本系统主要服务于：

```text
记录关键选择
记录关键世界状态变化
解释闭合结局产生原因
记录主线推进结局的关键路径
为后续多视角因果链系统预留结构
```

当前 MVP 范围：

```text
序章 + 第一章
仅 A 视角可玩
存在属性判定
存在世界状态变化
存在多个章节闭合结局
存在 1 个主线推进结局
暂不考虑商业化、广告、支付、后端权益
暂不实现复杂多视角因果图
```

---

## 2. 因果链系统定位

因果链系统不是单纯的剧情流程图。

它记录的是：

```text
某个结果为什么发生
哪些选择导致了当前状态
哪些状态触发了闭合结局
哪些条件共同导向主线推进结局
```

示例：

```text
玩家没有检查短信
↓
没有获得关键线索
↓
最终误以为异常是幻觉
↓
进入误解类闭合结局
```

或者：

```text
玩家发现 23:17 重复出现
↓
污染值达到可感知区间
↓
在最终节点选择继续确认异常
↓
获得 core_signal
↓
进入主线推进结局
```

---

## 3. v0.1 因果链目标

v0.1 不追求完整复杂图谱，只实现最小可用因果记录。

目标是：

```text
让玩家知道自己为什么进入某个结局
让开发者能检查剧情分支是否合理
让后续多视角扩展时有因果数据基础
```

v0.1 需要实现：

```text
关键选择记录
关键线索记录
关键属性阈值记录
关键世界状态记录
结局触发原因记录
主线推进路径记录
```

v0.1 暂不实现：

```text
完整可交互因果图
复杂多主角因果图
跨章节因果重算
图形化编辑器
商业化视角解锁补全
```

---

## 4. 核心概念

### 4.1 因果事件 CausalEvent

因果事件是因果链系统中的最小记录单位。

它表示：

```text
某个选择、状态变化、线索获得、属性变化、判定结果或结局触发。
```

示例：

```yaml
- type: causal.record
  id: cause_ch01_check_message
  title: A 检查了无发件人短信
  visibility: known
  category: clue
  writes:
    - clues.no_sender_message
```

### 4.2 因果节点 CausalNode

因果节点是展示在因果回看界面中的节点。

它可以来自：

```text
玩家选择
线索获得
关键状态变化
属性阈值判定
路由判断
结局触发
未知原因
```

### 4.3 因果边 CausalEdge

因果边表示两个因果节点之间的关系。

例如：

```text
发现短信 → 解锁隐藏选项
污染值过高 → 进入污染闭合结局
没有获得核心线索 → 进入误解闭合结局
```

### 4.4 因果路径 CausalPath

因果路径是从关键选择到结局的一条链路。

例如：

```text
检查短信
↓
发现 23:17
↓
等待异常显现
↓
确认异常真实存在
↓
主线推进结局
```

闭合结局和主线推进结局都可以生成因果路径。

---

## 5. 因果记录类型

v0.1 支持以下因果记录类型：

```text
choice
clue
attribute
world_state
route
ending
unknown
```

### 5.1 choice：选择事件

表示玩家做出了某个关键选择。

示例：

```yaml
- type: causal.record
  id: cause_ch01_choice_check_message
  title: A 重新检查了短信
  category: choice
  visibility: known
  source:
    node: ch01_a_001
    choice: check_message
  writes:
    - clues.no_sender_message
```

适用场景：

```text
影响后续路线的选择
影响结局的选择
改变关键世界状态的选择
获得关键线索的选择
```

不建议每个普通选择都记录为因果事件，否则因果图会过于混乱。

### 5.2 clue：线索事件

表示玩家获得了重要线索。

示例：

```yaml
- type: causal.record
  id: cause_ch01_clue_repeated_2317
  title: A 发现 23:17 重复出现
  category: clue
  visibility: known
  writes:
    - clues.repeated_time_2317
```

适用场景：

```text
获得普通线索
获得主线线索
获得解锁隐藏选项的线索
获得结局图鉴提示线索
```

### 5.3 attribute：属性阈值事件

表示某个属性达到关键区间，影响路线或结局。

示例：

```yaml
- type: causal.record
  id: cause_ch01_pollution_visible
  title: A 的污染值达到了可感知异常的区间
  category: attribute
  visibility: known
  reads:
    - attributes.A.pollution
```

适用场景：

```text
理智过低
体力不足
洞察达到隐藏选项要求
污染值进入异常可见区间
污染值过高导致失控
```

属性阈值事件不需要每次属性变化都记录，只记录影响路线或结局的关键阈值。

### 5.4 world_state：世界状态事件

表示某个世界状态发生重要变化。

示例：

```yaml
- type: causal.record
  id: cause_ch01_power_off
  title: 旧楼电力完全中断
  category: world_state
  visibility: known
  writes:
    - world.scene.power_state
```

适用场景：

```text
门被打开
路线被阻塞
电力中断
异常阶段变化
时间抵达关键节点
A 看见城市异常层
```

### 5.5 route：路由判定事件

表示系统根据条件进入某条路线。

示例：

```yaml
- type: causal.record
  id: cause_ch01_route_misunderstanding
  title: A 缺少核心线索，进入误解路线
  category: route
  visibility: known
  reads:
    - clues.core_signal
    - attributes.A.sanity
```

适用场景：

```text
router 节点自动判定路线
最终结局前的路线收束
隐藏路线判定
闭合结局判定
主线推进结局判定
```

### 5.6 ending：结局事件

表示玩家进入某个结局。

示例：

```yaml
- type: causal.record
  id: cause_ch01_ending_misunderstanding
  title: A 进入误解类闭合结局
  category: ending
  visibility: known
  ending:
    id: ch01_a_closed_003
    type: closed
```

每个结局都必须有对应的 ending 因果事件。

### 5.7 unknown：未知因果事件

表示当前阶段玩家还不知道原因的事件。

v0.1 A 单视角中可以少量使用。

示例：

```yaml
- type: causal.record
  id: cause_ch01_unknown_signal_source
  title: 未知信号源
  category: unknown
  visibility: unknown
  writes:
    - world.timeline.anomaly_phase
```

用途：

```text
制造悬疑
为后续 B/C 视角预留解释空间
在因果回看中显示“未知原因”
```

MVP 阶段 unknown 节点不宜过多。

建议第一章最多：

```text
1-2 个 unknown 节点
```

---

## 6. 因果可见性 visibility

因果事件有三种可见性：

```text
known
unknown
hidden
```

### 6.1 known

玩家当前已经知道的因果。

示例：

```text
玩家检查短信 → 获得无发件人短信线索
```

### 6.2 unknown

玩家知道发生了结果，但不知道具体原因。

示例：

```text
未知信号源 → 异常阶段变化
```

在因果回看中可显示为：

```text
未知原因
```

### 6.3 hidden

当前完全不展示，只用于调试或后续解锁。

MVP 中不建议大量使用。

示例：

```yaml
visibility: hidden
```

用途：

```text
未来多视角解锁
后续章节揭示
开发期调试
```

---

## 7. 强因果节点与弱因果节点

为了避免因果图失控，需要区分强弱。

### 7.1 strong：强因果节点

强因果节点是会明显影响路线或结局的节点。

特点：

```text
影响结局
影响主线推进条件
影响隐藏路线
影响关键线索
影响关键世界状态
```

示例：

```text
发现 core_signal
理智低于崩溃阈值
污染值达到异常可见区间
选择继续留在异常现场
```

### 7.2 weak：弱因果节点

弱因果节点只影响局部文本、轻微属性或氛围。

特点：

```text
不直接影响结局
不影响主线推进
不需要在玩家因果图中展示
可以只进入调试记录
```

示例：

```text
少量理智变化
普通观察文本差异
一次非关键选择
```

### 7.3 MVP 规则

v0.1 玩家可见因果图只展示 strong 节点。

weak 节点可以进入调试日志，但不展示给玩家。

规则：

```text
每章 strong 因果节点建议 3-6 个。
每个结局最多展示 3 个主要原因。
每个 closed 结局至少有 1 个可解释原因。
canon 结局必须展示 2-4 个关键推进原因。
```

---

## 8. 因果事件数据结构

推荐结构：

```yaml
id: cause_ch01_check_message
chapter: ch01
pov: A
time: "22:05"
category: choice
strength: strong
visibility: known

title: A 检查了无发件人短信

source:
  node: ch01_a_001
  choice: check_message

reads: []
writes:
  - clues.no_sender_message

depends_on: []

leads_to:
  - cause_ch01_clue_repeated_2317

display:
  show_in_graph: true
  show_in_ending_review: true
```

字段说明：

| 字段 | 必填 | 说明 |
|---|---:|---|
| id | 是 | 因果事件唯一 ID |
| chapter | 是 | 所属章节 |
| pov | 是 | 所属视角，MVP 固定为 A |
| time | 否 | 时间线时间 |
| category | 是 | 因果类型 |
| strength | 是 | strong / weak |
| visibility | 是 | known / unknown / hidden |
| title | 是 | 显示标题 |
| source | 否 | 来源节点和选择 |
| reads | 否 | 读取的变量 |
| writes | 否 | 写入的变量 |
| depends_on | 否 | 前置因果事件 |
| leads_to | 否 | 后续因果事件 |
| display | 否 | 展示规则 |

---

## 9. 在剧情节点中记录因果事件

剧情节点可以通过 effect 记录因果事件。

示例：

```yaml
effects:
  - type: causal.record
    id: cause_ch01_check_message
    chapter: ch01
    pov: A
    time: "22:05"
    category: choice
    strength: strong
    visibility: known
    title: A 检查了无发件人短信
    source:
      node: ch01_a_001
      choice: check_message
    writes:
      - clues.no_sender_message
    display:
      show_in_graph: true
      show_in_ending_review: true
```

简写形式也可以允许：

```yaml
- type: causal.record
  id: cause_ch01_check_message
  title: A 检查了无发件人短信
  category: choice
  strength: strong
  visibility: known
  writes:
    - clues.no_sender_message
```

StoryTool 构建时补全：

```text
chapter
pov
source.node
source.choice
```

---

## 10. 结局原因记录

每个结局需要定义原因回看。

在 `endings.yml` 中增加：

```yaml
ending_review:
  title: 你抵达该结局的主要原因
  causes:
    - cause_ch01_no_core_signal
    - cause_ch01_denied_anomaly
  hint: |
    也许应该在离开之前确认异常是否真的存在。
```

示例：

```yaml
endings:
  - id: ch01_a_closed_misunderstanding
    chapter: ch01
    pov: A
    title: 错误的清晨
    ending_type: closed
    category: misunderstanding
    unlock_next_chapter: false

    ending_review:
      title: 你抵达该结局的主要原因
      causes:
        - cause_ch01_no_core_signal
        - cause_ch01_denied_anomaly
      hint: |
        你过早接受了正常解释，也没有获得足够证据。
```

---

## 11. closed 结局因果规则

闭合结局必须能解释为什么无法进入下一章。

closed 结局原因通常包括：

```text
缺少核心线索
属性低于要求
属性过高导致失控
选择了退场路线
相信了错误解释
错过关键时间点
A 没有确认异常真实存在
```

每个 closed 结局必须满足：

```text
至少有 1 个 ending_review cause
必须有 hint_for_replay 或 ending_review.hint
不得解锁下一章
不得写入 canon_state
```

示例：

```yaml
ending_review:
  causes:
    - cause_ch01_missed_2317
  hint: |
    你错过了 23:17 这个关键时间点。
```

---

## 12. canon 结局因果规则

主线推进结局必须记录关键推进路径。

canon 结局原因通常包括：

```text
获得核心线索
确认异常真实存在
污染值处于可感知但未失控区间
理智没有崩溃
在最终节点选择继续调查
```

canon 结局必须满足：

```text
至少有 2 个 ending_review causes
必须包含 canon_path
必须写入 canon_state
必须解锁下一章
```

示例：

```yaml
endings:
  - id: ch01_a_canon_001
    ending_type: canon
    category: mainline
    unlock_next_chapter: true
    next_chapter: ch02

    ending_review:
      title: 主线推进路径
      causes:
        - cause_ch01_clue_repeated_2317
        - cause_ch01_pollution_visible
        - cause_ch01_observed_unknown_layer
      hint: |
        你确认了异常真实存在，因此可以进入下一章。

    canon_path:
      - cause_ch01_check_message
      - cause_ch01_clue_repeated_2317
      - cause_ch01_waited_until_2317
      - cause_ch01_observed_unknown_layer
```

---

## 13. 路由节点与因果记录

router 节点应该负责记录路线判定。

示例：

```yaml
- id: ch01_a_final_router
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
          - var: attributes.A.pollution
            op: ">="
            value: 10
          - var: attributes.A.pollution
            op: "<="
            value: 70
      effects:
        - type: causal.record
          id: cause_ch01_route_canon
          title: A 满足主线推进条件
          category: route
          strength: strong
          visibility: known
          reads:
            - clues.core_signal
            - attributes.A.sanity
            - attributes.A.pollution
      next: ch01_a_canon_node

    - conditions:
        all:
          - var: attributes.A.pollution
            op: ">"
            value: 70
      effects:
        - type: causal.record
          id: cause_ch01_route_pollution
          title: A 的污染值过高，进入污染闭合路线
          category: route
          strength: strong
          visibility: known
          reads:
            - attributes.A.pollution
      next: ch01_a_ending_pollution_node

    - conditions:
        all: []
      effects:
        - type: causal.record
          id: cause_ch01_route_misunderstanding
          title: A 缺少足够证据，进入误解闭合路线
          category: route
          strength: strong
          visibility: known
          reads:
            - clues.core_signal
      next: ch01_a_ending_misunderstanding_node
```

规则：

```text
所有最终结局路由都应记录 route 因果事件。
```

---

## 14. 属性阈值因果规则

属性变化不必全部记录，但以下情况必须记录：

```text
理智降到关键阈值以下
体力降到关键阈值以下
污染进入可感知区间
污染进入失控区间
洞察达到关键选项要求
```

建议阈值：

```text
sanity < 20：接近崩溃
stamina <= 0：无法继续行动
pollution >= 10：开始感知异常
pollution >= 70：高危污染
insight >= 3：能发现隐藏线索
```

示例：

```yaml
- type: causal.record
  id: cause_ch01_pollution_high
  title: A 的污染值进入高危区间
  category: attribute
  strength: strong
  visibility: known
  reads:
    - attributes.A.pollution
```

---

## 15. 主线推进条件建议

v0.1 第一章主线推进结局建议由以下条件构成：

```text
获得 clues.core_signal
attributes.A.sanity >= 20
attributes.A.pollution >= 10
attributes.A.pollution <= 70
world.flags.a_saw_unknown_layer = true
```

对应含义：

```text
A 获得核心信号线索
A 没有理智崩溃
A 被污染到能看见异常
A 还没有被污染彻底吞没
A 看见了城市异常层
```

该规则不是最终剧情锁死，但可作为 MVP 默认设计。

---

## 16. 闭合结局原因类型

v0.1 建议支持以下闭合结局原因类型。

### 16.1 缺少线索

```text
缺少 clues.core_signal
缺少 clues.repeated_time_2317
没有检查关键物件
```

因果提示：

```text
你没有获得足够证据，因此无法确认异常真实存在。
```

### 16.2 过早退场

```text
world.flags.a_tried_to_escape = true
A 离开异常现场
A 主动停止调查
```

因果提示：

```text
你保住了安全，但也失去了接触真相的机会。
```

### 16.3 理智崩溃

```text
attributes.A.sanity < 20
```

因果提示：

```text
你看见了太多无法解释的东西，却没有足够证据稳定认知。
```

### 16.4 污染失控

```text
attributes.A.pollution > 70
```

因果提示：

```text
你接近了真相，但污染先一步改写了你。
```

### 16.5 误解真相

```text
world.flags.a_denied_anomaly = true
clues.core_signal = false
```

因果提示：

```text
你选择了一个看似合理的解释，但它无法解释所有异常。
```

---

## 17. 因果图展示规则

v0.1 因果图可以简化为“结局回看”。

不需要完整可拖拽图形 UI。

结局回看展示内容：

```text
结局名称
结局类型
是否解锁下一章
主要原因 1
主要原因 2
主要原因 3
重玩提示
```

示例 UI 文案：

```text
你抵达了结局：错误的清晨

这条路线已经闭合。
主要原因：
1. 你没有获得核心线索。
2. 你过早接受了正常解释。
3. 你错过了 23:17 的异常显现。

提示：
也许应该在离开之前确认短信中的时间。
```

主线推进结局展示：

```text
你抵达了主线推进结局：雨夜之后

关键路径：
1. 你发现 23:17 重复出现。
2. 你获得了核心信号线索。
3. 你在污染失控前看见了城市异常层。

第二章已解锁。
```

---

## 18. 因果记录与存档

存档中需要保存：

```text
causalEvents
endingReview
canonPath
```

推荐结构：

```ts
type CausalEventRecord = {
  id: string;
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

type EndingReviewRecord = {
  endingId: string;
  chapterId: string;
  endingType: "closed" | "canon";
  causes: string[];
  hint?: string;
};

type CanonPathRecord = {
  chapterId: string;
  endingId: string;
  causes: string[];
};
```

---

## 19. 因果事件去重规则

同一个因果事件不应重复记录多次。

规则：

```text
同一次章节尝试中，相同 id 的 causalEvent 只记录一次。
如果重玩章节，则进入新的 attempt。
如果 MVP 暂不实现 attempt，则覆盖或追加都可以，但需要避免 UI 重复展示。
```

推荐 v0.1 简化：

```text
同一存档中 causalEvents 按 id 去重。
后续版本再增加 attemptId。
```

---

## 20. StoryTool 校验规则

StoryTool 必须校验以下内容。

### 20.1 因果事件 ID 唯一

```text
causal.record.id 不得重复。
```

命名建议：

```text
cause_{chapter}_{描述}
```

示例：

```text
cause_ch01_check_message
cause_ch01_pollution_high
cause_ch01_route_canon
```

### 20.2 category 合法

只允许：

```text
choice
clue
attribute
world_state
route
ending
unknown
```

### 20.3 visibility 合法

只允许：

```text
known
unknown
hidden
```

### 20.4 strength 合法

只允许：

```text
strong
weak
```

### 20.5 reads / writes 变量必须存在

所有 `reads` 和 `writes` 中引用的变量必须存在于世界状态 schema。

错误示例：

```yaml
writes:
  - world.scene.undefined_state
```

如果变量未登记，StoryTool 必须报错。

### 20.6 ending_review causes 必须存在

`ending_review.causes` 中引用的因果事件必须存在。

错误示例：

```yaml
ending_review:
  causes:
    - cause_ch01_not_exist
```

### 20.7 canon_path 必须存在且只用于 canon 结局

规则：

```text
closed 结局不得定义 canon_path。
canon 结局必须定义 canon_path。
canon_path 中引用的因果事件必须存在。
```

### 20.8 closed 结局必须可解释

每个 closed 结局必须有：

```text
ending_review.causes
ending_review.hint
```

### 20.9 最终 router 必须记录 route 因果

如果某个 router 节点通向结局节点，则每条 route 应记录一个 `category: route` 的因果事件。

---

## 21. v0.1 禁止项

当前因果链规则不支持：

```text
复杂多主角因果回放
跨章节因果重算
玩家手动编辑时间线
图形化因果编辑器
付费视角解锁后补全因果
广告提示替代因果提示
云端因果分析
```

这些内容后续版本再设计。

---

## 22. 后续多视角扩展预留

未来开放 B/C 视角后，因果图可以扩展为：

```text
A 视角看到的结果
B 视角造成的原因
C 视角揭示的隐藏规则
```

未来需要新增：

```text
cross_pov: true
source_pov
affected_pov
default_action
overridden_by_player
revealed_by_pov
```

示例：

```yaml
- type: causal.record
  id: cause_ch01_b_action_affects_a
  category: world_state
  strength: strong
  visibility: unknown
  source_pov: B
  affected_pov:
    - A
  revealed_by_pov: B
```

v0.1 暂不实现。

---

## 23. 当前拍板版本

v0.1 因果链规则确认如下：

```text
因果链系统用于记录关键选择、线索、属性阈值、世界状态、路由和结局。
v0.1 只做 A 单视角因果记录。
v0.1 不做复杂多视角因果图。
玩家端优先做结局回看，而不是完整图形化因果图。
每个 closed 结局必须能解释原因。
每个 canon 结局必须记录主线推进路径。
每章 strong 因果节点建议 3-6 个。
每个结局最多展示 3 个主要原因。
所有因果事件必须可被 StoryTool 校验。
```

---

## 24. 下一步

本文件完成后，下一步应继续生成：

```text
docs/08_save_system.md
```

该文档需要定义：

```text
本地存档结构
Runtime State 保存方式
Archive State 保存方式
Canon State 保存方式
结局图鉴保存方式
重玩章节时的状态重置规则
是否需要 attemptId
如何为后续云存档预留
```

也可以先做：

```text
docs/11_ch01_timeline.md
```

如果希望尽快进入剧情设计，则优先做第一章时间线。
