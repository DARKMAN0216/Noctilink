# Noctilink / 夜链

**Noctilink**（中文名：**夜链**）是一款都市异常题材的多视角因果链文字冒险小游戏。

项目当前处于 **v0.1 MVP 规划与原型阶段**，目标不是立刻制作完整商业化游戏，而是先验证核心玩法是否成立：

> 玩家通过剧情选择、属性判定、线索收集和世界状态变化，逐步抵达章节结局。  
> 每章允许多个章节闭合结局，但只有一个主线推进结局可以解锁下一章。

---

## 1. 项目定位

```text
类型：
都市异常题材 · 文字冒险 · 因果链叙事 · 像素风 UI 小游戏

当前 MVP：
序章 + 第一章
仅 A 视角可玩
属性判定
世界状态变化
多个章节闭合结局
一个主线推进结局
结局图鉴
本地存档
基础因果记录
```

Noctilink 不是传统 RPG，也不是单纯电子小说。

它的核心是：

```text
剧情选择
属性判定
世界状态
结局回看
因果记录
主线锚点
章节重玩
```

---

## 2. 当前 v0.1 MVP 范围

### 2.1 包含内容

```text
序章
第一章
A 单视角剧情
属性系统
世界状态系统
线索系统
closed / canon 结局规则
结局图鉴
本地存档
基础因果事件记录
StoryTool 数据校验
Cocos 剧情播放器原型
```

### 2.2 暂不包含内容

```text
商业化
广告
支付
商城
云存档
用户账号
完整后端
B / C 可玩视角
复杂多视角因果图
复杂战斗系统
大地图自由探索
抽卡系统
多人联网
```

---

## 3. 核心规则

### 3.1 结局规则

每章允许多个结局，但分为两类：

```text
closed：
章节闭合结局。
进入结局图鉴，但不解锁下一章。

canon：
主线推进结局。
进入结局图鉴，写入 canon_state，并解锁下一章。
```

规则：

```text
每章必须有且只有一个 canon 结局。
closed 结局不得解锁下一章。
canon 结局必须写入 canon_state。
后续章节只继承 canon_state，不继承所有 Runtime State。
```

---

### 3.2 状态规则

状态分为三层：

```text
Runtime State：
当前游玩状态。

Archive State：
永久收集状态，例如已解锁结局、线索图鉴、档案条目。

Canon State：
主线锚点状态，只由 canon 结局写入。
```

---

### 3.3 剧情数据规则

剧情不得硬编码在 TypeScript 代码中。

```text
开发期剧情源文件：YAML
运行时剧情数据：JSON
项目设定与长期上下文：Markdown
```

剧情节点、条件、效果、结局、线索、世界变量必须由数据驱动。

---

## 4. 技术栈

```text
客户端：
Cocos Creator 3.x + TypeScript

内容数据：
Markdown + YAML + JSON

工具链：
C# StoryTool

后端：
v0.1 暂不实现
后续预留 C# / .NET + ASP.NET Core + EF Core + PostgreSQL

目标平台：
微信小游戏优先
```

---

## 5. 推荐仓库结构

```text
noctilink/
  client/
    assets/
    scripts/
      story/
      save/
      platform/
      ui/
      resources/

  tools/
    StoryTool/

  content/
    chapters/
      ch00_prologue/
      ch01/
    characters/
    variables/
    endings/

  docs/
    00_project_brief.md
    04_tech_architecture.md
    05_story_node_schema.md
    06_world_state_schema.md
    07_causal_graph_rules.md
    08_save_system.md
    11_mvp_scope_and_ending_rules.md

  AGENTS.md
  README.md
```

v0.1 暂不强制创建 `server/` 目录。  
后续需要云存档、账号或商业化时再加入。

---

## 6. 文档索引

核心文档建议放在 `docs/` 目录。

| 文档 | 说明 |
|---|---|
| `00_project_brief.md` | 项目总览 |
| `04_tech_architecture.md` | 技术架构设计 |
| `05_story_node_schema.md` | 剧情节点数据结构 |
| `06_world_state_schema.md` | 世界状态变量设计 |
| `07_causal_graph_rules.md` | 因果链规则设计 |
| `08_save_system.md` | 存档系统设计 |
| `11_mvp_scope_and_ending_rules.md` | MVP 范围与章节结局规则 |

仓库根目录应保留：

```text
AGENTS.md
```

它用于约束 Codex 或其他 AI 代码生成工具的行为。

---

## 7. 内容生产流程

推荐流程：

```text
编写 Markdown 设计文档
↓
编写 YAML 剧情源文件
↓
StoryTool 校验剧情数据
↓
StoryTool 构建 JSON 运行数据
↓
Cocos 客户端加载 JSON
↓
StoryEngine 执行剧情
```

示意：

```text
content/chapters/ch01/nodes_a.yml
        ↓
tools/StoryTool validate
        ↓
dist/story-data/ch01.json
        ↓
client StoryEngine
```

---

## 8. 剧情节点示例

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
        next: ch01_a_002
```

---

## 9. 结局示例

```yaml
endings:
  - id: ch01_a_closed_misunderstanding
    chapter: ch01
    pov: A
    title: 错误的清晨
    ending_type: closed
    category: misunderstanding
    unlock_next_chapter: false

  - id: ch01_a_canon_001
    chapter: ch01
    pov: A
    title: 雨夜之后
    ending_type: canon
    category: mainline
    unlock_next_chapter: true
    next_chapter: ch02

    canon_state:
      attributes.A.status: alive
      world.flags.ch01_canon_reached: true
      world.flags.a_knows_anomaly_exists: true
      world.flags.a_saw_unknown_layer: true
      clues.core_signal: true
```

---

## 10. StoryTool 目标

`StoryTool` 是 C# CLI 工具，用于检查和构建剧情数据。

计划命令：

```bash
StoryTool validate ./content
StoryTool build ./content ./dist/story-data
StoryTool graph ./content/ch01 ./dist/graphs/ch01.json
StoryTool check-unreachable ./content
```

v0.1 最小功能：

```text
读取 YAML
校验节点 ID
校验 next 指向
校验变量是否存在
校验 effects 类型
校验 closed / canon 结局规则
构建 JSON
```

---

## 11. 客户端核心模块

计划模块：

```text
StoryEngine
WorldStateStore
ConditionEvaluator
EffectApplier
CausalGraphManager
SaveManager
ResourceManager
PlatformAdapter
```

v0.1 优先实现：

```text
StoryEngine
WorldStateStore
ConditionEvaluator
EffectApplier
SaveManager
```

因果图系统 v0.1 可先简化为“结局回看”，不做完整图形化 UI。

---

## 12. 当前开发顺序建议

```text
1. 初始化仓库结构
2. 放入 docs 和 AGENTS.md
3. 创建 content 示例目录
4. 编写最小 ch00 / ch01 YAML 示例
5. 实现 StoryTool validate
6. 实现 StoryTool build
7. 创建 Cocos 客户端原型
8. 实现 StoryEngine
9. 实现 WorldStateStore
10. 实现 SaveManager
11. 跑通第一条 closed 结局
12. 跑通第一条 canon 结局
```

---

## 13. 对 Codex 的重要约束

Codex 修改本项目时必须遵守 `AGENTS.md`。

关键规则包括：

```text
不得硬编码剧情。
不得临时创造未登记变量。
不得让 closed 结局解锁下一章。
不得把商业化、广告、支付提前加入 v0.1。
不得擅自引入 B/C 可玩视角。
新增剧情节点必须符合 story_node_schema。
新增变量必须先登记到 world_state_schema。
```

---

## 14. 当前状态

```text
项目阶段：
规划完成，准备进入工程初始化。

已确定：
项目名 Noctilink / 夜链
v0.1 MVP 范围
技术架构
剧情节点数据结构
世界状态变量体系
因果链规则
存档系统
AGENTS.md

下一步：
初始化仓库结构，准备 StoryTool 和 Cocos 客户端原型。
```

---

## 15. License

当前未定。

建议在正式公开前确认：

```text
代码许可证
美术素材许可证
剧情文本版权归属
第三方库许可证
```

---

## 16. Project Summary

```text
Noctilink is an urban anomaly narrative game built around structured story nodes, world-state changes, replayable closed endings, a single canon progression path per chapter, and a data-driven narrative engine.
```
