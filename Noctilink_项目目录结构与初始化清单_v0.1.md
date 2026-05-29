# Noctilink 项目目录结构与初始化清单 v0.1

## 1. 文档目的

本文档用于指导 Noctilink 仓库的第一版工程初始化。

当前阶段目标不是立刻完成游戏，而是先建立一个可维护、可被 Codex 接手、可持续扩展的项目骨架。

本文件约束：

```text
仓库目录如何组织
哪些目录必须立即创建
哪些目录只是预留
哪些目录暂时不要创建
文档如何归档
剧情内容如何放置
StoryTool 如何初始化
Cocos 客户端如何规划
后续任务如何拆分
```

---

## 2. 当前项目阶段

```text
项目名：Noctilink
中文名：夜链
阶段：v0.1 MVP 工程初始化
类型：都市异常因果链文字冒险小游戏
当前可玩范围：序章 + 第一章，A 单视角
商业化：暂不考虑
后端：暂不实现
目标：先跑通数据驱动剧情原型
```

---

## 3. 当前已确定技术方向

```text
客户端：
Cocos Creator 3.x + TypeScript

剧情源文件：
YAML

运行时剧情数据：
JSON

长期设计文档：
Markdown

剧情工具链：
C# / .NET CLI 工具 StoryTool

后端：
v0.1 暂不实现，后续再考虑 C# / .NET 后端

平台：
微信小游戏优先，但 v0.1 先本地原型
```

---

## 4. 推荐仓库根目录结构

v0.1 推荐结构：

```text
noctilink/
  client/
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
  dist/
    story-data/
  scripts/
  AGENTS.md
  README.md
  .gitignore
```

说明：

| 路径 | 作用 |
|---|---|
| `client/` | Cocos Creator 客户端工程 |
| `tools/StoryTool/` | C# 剧情校验与构建工具 |
| `content/` | YAML 剧情源文件、角色、变量、结局配置 |
| `docs/` | 项目设计文档 |
| `dist/story-data/` | StoryTool 构建出的 JSON 运行数据 |
| `scripts/` | 初始化、构建、校验脚本 |
| `AGENTS.md` | Codex 项目规则 |
| `README.md` | 仓库首页说明 |
| `.gitignore` | Git 忽略规则 |

---

## 5. 当前必须创建的目录

第一阶段必须创建：

```text
docs/
content/
content/chapters/
content/chapters/ch00_prologue/
content/chapters/ch01/
content/characters/
content/variables/
content/endings/
tools/
tools/StoryTool/
scripts/
dist/
dist/story-data/
```

原因：

```text
docs/ 用于归档设计文档
content/ 用于放剧情 YAML 源文件
tools/StoryTool/ 用于后续实现校验工具
scripts/ 用于放本地构建脚本
dist/story-data/ 用于放构建产物
```

---

## 6. 当前可以暂缓创建的目录

以下目录可以暂缓：

```text
client/
```

原因：

```text
Cocos 工程最好等 StoryTool 和 content 示例结构初步稳定后再创建。
否则 Cocos 项目内资源路径可能要反复调整。
```

也可以先创建空目录占位：

```text
client/.gitkeep
```

但暂时不急着导入 Cocos Creator。

---

## 7. 当前不应创建的目录

v0.1 暂不创建：

```text
server/
payment/
ads/
shop/
multiplayer/
analytics/
liveops/
cms/
```

原因：

```text
当前不做后端
当前不做云存档
当前不做商业化
当前不做广告
当前不做支付
当前不做商城
当前不做多人功能
```

避免 Codex 或开发者过早扩展范围。

---

## 8. docs 目录规划

推荐 `docs/` 目录结构：

```text
docs/
  00_project_brief.md
  04_tech_architecture.md
  05_story_node_schema.md
  06_world_state_schema.md
  07_causal_graph_rules.md
  08_save_system.md
  09_project_structure_and_bootstrap.md
  11_mvp_scope_and_ending_rules.md
```

当前已规划文档：

| 文件 | 说明 |
|---|---|
| `00_project_brief.md` | 项目立项总结 |
| `04_tech_architecture.md` | 技术架构设计 |
| `05_story_node_schema.md` | 剧情节点数据结构 |
| `06_world_state_schema.md` | 世界状态变量设计 |
| `07_causal_graph_rules.md` | 因果链规则 |
| `08_save_system.md` | 存档系统 |
| `09_project_structure_and_bootstrap.md` | 项目目录结构与初始化清单 |
| `11_mvp_scope_and_ending_rules.md` | MVP 范围与章节结局规则 |

后续可以增加：

```text
10_storytool_design.md
12_client_prototype_plan.md
13_story_runtime_interfaces.md
14_content_authoring_guide.md
```

---

## 9. content 目录规划

`content/` 是剧情源文件目录。

推荐结构：

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

  characters/
    protagonist_a.yml

  variables/
    attributes_schema.yml
    world_state_schema.yml
    condition_ops.yml

  endings/
    ending_categories.yml
```

说明：

| 路径 | 说明 |
|---|---|
| `chapters/ch00_prologue/` | 序章剧情源文件 |
| `chapters/ch01/` | 第一章剧情源文件 |
| `characters/` | 角色配置 |
| `variables/` | 属性、世界状态、条件操作符定义 |
| `endings/` | 全局结局分类或规则定义 |

---

## 10. ch00_prologue 初始文件

建议创建：

```text
content/chapters/ch00_prologue/chapter.yml
content/chapters/ch00_prologue/nodes_a.yml
content/chapters/ch00_prologue/endings.yml
```

### 10.1 chapter.yml 占位

```yaml
id: ch00_prologue
title: 序章
order: 0
pov_scope:
  - A

entry_node: ch00_a_001

summary: |
  Noctilink 的序章，用于引入都市异常氛围和 A 的初始状态。

next_chapter:
  id: ch01
  unlock_by_default: true
```

### 10.2 nodes_a.yml 占位

```yaml
nodes:
  - id: ch00_a_001
    chapter: ch00_prologue
    pov: A
    node_kind: story
    time: "21:50"
    title: 序章开始

    text: |
      这里是序章占位文本。

    choices:
      - id: continue
        text: 继续
        requirements:
          all: []
        effects:
          - type: flag.set
            target: world.flags.ch00_finished
            value: true
        next: ch00_a_ending_node

  - id: ch00_a_ending_node
    chapter: ch00_prologue
    pov: A
    node_kind: ending
    time: "22:00"
    title: 序章结束

    text: |
      序章结束，占位。

    ending:
      id: ch00_a_canon_001
```

### 10.3 endings.yml 占位

```yaml
endings:
  - id: ch00_a_canon_001
    chapter: ch00_prologue
    pov: A
    title: 序章结束
    ending_type: canon
    category: mainline
    unlock_next_chapter: true
    next_chapter: ch01

    summary: |
      A 进入第一章。

    canon_state:
      world.flags.ch00_finished: true
```

---

## 11. ch01 初始文件

建议创建：

```text
content/chapters/ch01/chapter.yml
content/chapters/ch01/nodes_a.yml
content/chapters/ch01/endings.yml
```

### 11.1 chapter.yml 占位

```yaml
id: ch01
title: 第一章
order: 1
pov_scope:
  - A

entry_node: ch01_a_001

summary: |
  第一章用于验证属性判定、世界状态、closed 结局和 canon 结局。

next_chapter:
  id: ch02
  unlock_by_ending: ch01_a_canon_001

mvp_notes:
  playable: true
  commercial_features: false
  cloud_save: false
```

### 11.2 nodes_a.yml 占位

```yaml
nodes:
  - id: ch01_a_001
    chapter: ch01
    pov: A
    node_kind: story
    time: "22:00"
    title: 第一章开始

    text: |
      这里是第一章占位文本。

    on_enter:
      effects:
        - type: flag.set
          target: world.flags.ch01_started
          value: true

    choices:
      - id: inspect
        text: 观察周围
        requirements:
          all: []
        effects:
          - type: attribute.add
            target: attributes.A.insight
            value: 1
          - type: clue.add
            target: clues.no_sender_message
        next: ch01_a_router_final

      - id: leave
        text: 离开这里
        requirements:
          all: []
        effects:
          - type: flag.set
            target: world.flags.a_tried_to_escape
            value: true
        next: ch01_a_closed_retreat_node

  - id: ch01_a_router_final
    chapter: ch01
    pov: A
    node_kind: router
    title: 第一章最终判定

    routes:
      - conditions:
          all:
            - var: clues.core_signal
              op: "=="
              value: true
        next: ch01_a_canon_node

      - conditions:
          all: []
        next: ch01_a_closed_misunderstanding_node

  - id: ch01_a_closed_retreat_node
    chapter: ch01
    pov: A
    node_kind: ending
    title: 结局：离开

    text: |
      你离开了这里。事件似乎结束了，但真相没有被确认。

    ending:
      id: ch01_a_closed_retreat

  - id: ch01_a_closed_misunderstanding_node
    chapter: ch01
    pov: A
    node_kind: ending
    title: 结局：错误的清晨

    text: |
      你以为一切只是误会。

    ending:
      id: ch01_a_closed_misunderstanding

  - id: ch01_a_canon_node
    chapter: ch01
    pov: A
    node_kind: ending
    title: 结局：雨夜之后

    text: |
      你确认了异常真实存在。

    ending:
      id: ch01_a_canon_001
```

### 11.3 endings.yml 占位

```yaml
endings:
  - id: ch01_a_closed_retreat
    chapter: ch01
    pov: A
    title: 离开
    ending_type: closed
    category: retreat
    unlock_next_chapter: false

    summary: |
      A 离开了异常现场，路线闭合。

    ending_review:
      title: 你抵达该结局的主要原因
      causes:
        - cause_ch01_left_early
      hint: |
        也许应该先确认异常是否真实存在。

  - id: ch01_a_closed_misunderstanding
    chapter: ch01
    pov: A
    title: 错误的清晨
    ending_type: closed
    category: misunderstanding
    unlock_next_chapter: false

    summary: |
      A 误以为事件已经结束。

    ending_review:
      title: 你抵达该结局的主要原因
      causes:
        - cause_ch01_no_core_signal
      hint: |
        你缺少进入主线所需的核心线索。

  - id: ch01_a_canon_001
    chapter: ch01
    pov: A
    title: 雨夜之后
    ending_type: canon
    category: mainline
    unlock_next_chapter: true
    next_chapter: ch02

    summary: |
      A 确认异常真实存在，第二章解锁。

    canon_state:
      attributes.A.status: alive
      world.flags.ch01_canon_reached: true
      world.flags.a_knows_anomaly_exists: true
      clues.core_signal: true

    ending_review:
      title: 主线推进路径
      causes:
        - cause_ch01_core_signal
      hint: |
        你获得了进入下一章所需的核心线索。

    canon_path:
      - cause_ch01_core_signal
```

注意：

```text
上述内容只是工程占位，不是正式剧情。
```

---

## 12. variables 目录规划

建议创建：

```text
content/variables/attributes_schema.yml
content/variables/world_state_schema.yml
content/variables/condition_ops.yml
```

### 12.1 attributes_schema.yml 占位

```yaml
variables:
  - id: attributes.A.status
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

  - id: attributes.A.sanity
    type: int
    default: 50
    min: 0
    max: 100
    persist: true
    canon_allowed: false
    description: A 的理智值。

  - id: attributes.A.stamina
    type: int
    default: 10
    min: 0
    max: 20
    persist: true
    canon_allowed: false
    description: A 的体力值。

  - id: attributes.A.money
    type: int
    default: 30
    min: 0
    max: 999
    persist: true
    canon_allowed: false
    description: A 的金钱。

  - id: attributes.A.insight
    type: int
    default: 2
    min: 0
    max: 20
    persist: true
    canon_allowed: false
    description: A 的洞察值。

  - id: attributes.A.pollution
    type: int
    default: 0
    min: 0
    max: 100
    persist: true
    canon_allowed: false
    description: A 的污染值。
```

### 12.2 condition_ops.yml 占位

```yaml
operators:
  - "=="
  - "!="
  - ">"
  - ">="
  - "<"
  - "<="
  - "exists"
  - "not_exists"
  - "in"
  - "not_in"
```

---

## 13. characters 目录规划

建议创建：

```text
content/characters/protagonist_a.yml
```

占位：

```yaml
id: A
name: A
role: protagonist
pov: true

summary: |
  v0.1 MVP 的唯一可玩主角。
  真实姓名与完整人设后续再定。

initial_attributes:
  status: alive
  sanity: 50
  stamina: 10
  money: 30
  insight: 2
  pollution: 0
```

---

## 14. tools/StoryTool 初始化规划

StoryTool 使用 C# / .NET CLI。

推荐目录：

```text
tools/
  StoryTool/
    StoryTool.sln
    src/
      StoryTool/
        Program.cs
        Commands/
        Validators/
        Builders/
        Schemas/
    tests/
      StoryTool.Tests/
```

推荐命令：

```bash
dotnet new sln -n StoryTool
dotnet new console -n StoryTool -o src/StoryTool
dotnet sln add src/StoryTool/StoryTool.csproj
dotnet new xunit -n StoryTool.Tests -o tests/StoryTool.Tests
dotnet sln add tests/StoryTool.Tests/StoryTool.Tests.csproj
```

v0.1 StoryTool 最小目标：

```text
读取 YAML
校验节点 ID 是否重复
校验 next 指向是否存在
校验变量是否登记
校验 closed / canon 结局规则
构建 JSON 到 dist/story-data/
```

---

## 15. scripts 目录规划

建议创建：

```text
scripts/
  validate-content.ps1
  build-story-data.ps1
```

如果使用 Bash，也可以增加：

```text
scripts/
  validate-content.sh
  build-story-data.sh
```

PowerShell 示例：

```powershell
dotnet run --project tools/StoryTool/src/StoryTool -- validate ./content
```

```powershell
dotnet run --project tools/StoryTool/src/StoryTool -- build ./content ./dist/story-data
```

---

## 16. dist 目录规划

`dist/` 用于存放构建产物。

推荐：

```text
dist/
  story-data/
    manifest.json
    chapters/
      ch00_prologue.json
      ch01.json
    variables.json
    characters.json
```

注意：

```text
dist/story-data/ 是构建输出。
可以选择提交，也可以选择忽略。
MVP 阶段为了调试方便，可以先提交生成后的 JSON。
后续如果构建稳定，可改为不提交 dist。
```

---

## 17. .gitignore 建议

推荐 `.gitignore`：

```gitignore
# Node / Cocos
node_modules/
temp/
library/
local/
build/
profiles/
*.log

# Cocos generated
client/temp/
client/library/
client/local/
client/build/
client/profiles/

# .NET
bin/
obj/
.vs/
*.user
*.suo

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Dist policy
# MVP 阶段可暂时提交 dist/story-data
# 如果后续不想提交构建产物，再打开下面规则
# dist/
```

---

## 18. 初始化命令清单

### 18.1 创建目录

PowerShell：

```powershell
mkdir client
mkdir tools
mkdir tools/StoryTool
mkdir content
mkdir content/chapters
mkdir content/chapters/ch00_prologue
mkdir content/chapters/ch01
mkdir content/characters
mkdir content/variables
mkdir content/endings
mkdir docs
mkdir dist
mkdir dist/story-data
mkdir scripts
```

Bash：

```bash
mkdir -p client
mkdir -p tools/StoryTool
mkdir -p content/chapters/ch00_prologue
mkdir -p content/chapters/ch01
mkdir -p content/characters
mkdir -p content/variables
mkdir -p content/endings
mkdir -p docs
mkdir -p dist/story-data
mkdir -p scripts
```

---

### 18.2 初始化 StoryTool

```bash
cd tools/StoryTool

dotnet new sln -n StoryTool
dotnet new console -n StoryTool -o src/StoryTool
dotnet sln add src/StoryTool/StoryTool.csproj

dotnet new xunit -n StoryTool.Tests -o tests/StoryTool.Tests
dotnet sln add tests/StoryTool.Tests/StoryTool.Tests.csproj
```

---

## 19. 第一阶段验收标准

仓库初始化完成后，应满足：

```text
README.md 存在
AGENTS.md 存在
docs/ 存在且包含核心设计文档
content/ 目录结构存在
ch00 / ch01 占位 YAML 存在
variables schema 占位存在
StoryTool 目录存在
scripts 目录存在
.gitignore 存在
```

如果 StoryTool 已初始化，还应满足：

```text
dotnet build tools/StoryTool/StoryTool.sln 可以通过
```

---

## 20. Codex 任务入口

仓库初始化后，可以把下面任务交给 Codex：

```text
任务 1：
根据 docs/05_story_node_schema.md 和 docs/06_world_state_schema.md，
实现 StoryTool 的 YAML 读取和基础 schema 校验。

任务 2：
根据 content/chapters/ch00_prologue 和 content/chapters/ch01 的示例文件，
实现 StoryTool build，将 YAML 转换为 dist/story-data JSON。

任务 3：
根据 docs/08_save_system.md，
实现 TypeScript 的 SaveData 类型定义和 SaveManager 接口草案。

任务 4：
根据 docs/05_story_node_schema.md，
实现 TypeScript 的 StoryNode、StoryChoice、Condition、Effect 类型定义。
```

---

## 21. 当前不做事项

初始化阶段不做：

```text
正式剧情正文
正式角色名
正式世界观细节
正式美术资源
Cocos UI 完整实现
云存档
支付
广告
后端
B/C 可玩视角
复杂因果图 UI
```

---

## 22. 当前拍板版本

v0.1 工程初始化规则如下：

```text
先建立 docs / content / tools / scripts / dist 的项目骨架。
先用 YAML 占位文件验证数据结构。
先做 StoryTool。
Cocos 客户端等数据结构稳定后再创建正式工程。
不提前加入 server、payment、ads、shop。
所有后续生成内容必须遵守 AGENTS.md。
```

---

## 23. 下一步

本文件完成后，下一步建议生成：

```text
docs/10_storytool_design.md
```

也就是 **StoryTool 工具链设计文档**。

该文档需要定义：

```text
StoryTool 命令
输入输出目录
YAML 解析规则
校验规则
错误码
构建 JSON 格式
测试用例
第一版实现任务
```
