# 任务 17：游戏剧情按角色拆包（负责：Codex gpt-6.2-astra；Fable 验收）

## 背景

- 用户 2026-11-17 指定本任务由 Codex 6.2 实现。这是 `AGENTS.md`"Codex 只审核"的例外，只限本任务。你的沙箱不能写 `.git`：不要 `git add` / `commit` / `push`，改完由 Fable 提交。
- 正式站游戏页 Lighthouse 性能分 84，LCP 4.5 s。LCP 是欢迎页的小镇横幅：静态 HTML 里只有"加载中"，横幅要等游戏脚本下载执行完才出现。见 `docs/research/2026-11-16-mobile-performance.md`。
- 这个脚本（main 上 `pnpm --filter web build` 后 `apps/web/out/_next/static/chunks/` 里最大的非 Phaser 包，约 811 KB 原始、311 KB gzip -9）同时装着全部游戏逻辑和四个角色的全部剧情。
- 四个角色：`skilled-worker`（含 `skilled-worker-additions.ts`）、`graduate`（含 `graduate-flatmate.ts`）、`family-partner`、`hong-kong-bno`，源文件合计约 320 KB，都在 `packages/game/src/characters/`。`game.ts` 第 66 行把四个角色静态放进 `characters` 数组，`characterOf()` 从里面取 `events`、`achievements`、`startDate`、`timeline` 等。

## 目标

欢迎页和选角色画面不下载任何角色的剧情；选定角色（开新游戏或继续存档）时，才下载这一个角色的剧情。

## 必读

`AGENTS.md`；`packages/game/src/game.ts`、`index.ts`、`types.ts`、`characters/*`；`apps/web/app/game/` 下用到 `characters` 的文件（`game-client.tsx`、`character-select.tsx`、`session.ts`、`hud.tsx`、`ending.tsx`）；`apps/e2e/tests/game.spec.ts`、`helpers.ts`。

## 要做

1. `packages/game`：
   - 角色剧情（`events`、`achievements` 等大段文本）移到按角色动态 `import()` 的模块。
   - 选角色画面要用的元数据（id、name、intro、sprite 等）留在主包。
   - `game.ts` 及主包里的其他模块不再静态 import 任何角色剧情模块。
   - 提供一个异步加载入口（例如 `loadCharacter(id)`），加载后现有游戏函数照旧同步工作。没加载就调用要直接抛错，不要静默降级。
   - `game.ts` 用到的 graduate 路线逻辑（薪资检查、episode 等）可以留在主包，只把剧情移走。
2. `apps/web/app/game`：开新游戏、继续存档、刷新页面恢复存档这三种情况，都先等所选角色加载完再进入小镇。加载期间沿用现有的"加载中"提示。
3. 只搬动，不改内容：
   - 文案、数值、事件 id 都不改；
   - 存档格式不改：localStorage key 与结构不变，旧存档照常能继续；
   - 选角色画面的样子与顺序不变。
4. 测试：
   - 现有测试全部通过。game 包测试如果需要先加载角色，用最简单的方式，例如 vitest setup 文件。
   - 新加一条测试：角色没加载就调用会抛错；加载后可以开新游戏。
   - 不改 e2e 的断言。如果因为异步加载必须加等待，在报告里写明改了哪里。

## 不做

- `family.ts`、`npcs.ts`、`town-dialogue.ts` 里按角色区分的内容不拆。认为值得拆的，写进报告的建议。
- 不改 Phaser 的加载方式，不加依赖，不改构建配置，不加打包分析工具或自定义校验脚本。

## 验收

Fable 会逐项复核。

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 通过。
- 构建后检查 `apps/web/out`：
  - 打开 `/game` 后、选角色之前会加载的脚本里，搜不到任何一个角色的剧情文本；
  - 每个角色的剧情各在独立的 chunk 里。

  证明方法：每个角色文件取几句独特的文本，grep `apps/web/out/_next/static/chunks/*.js`。报告里列出拆分前后主游戏包的大小（原始与 `gzip -9`），以及每个角色 chunk 的大小。
- 能跑 `pnpm e2e` 就跑；沙箱拦住浏览器就在报告里说明。你的沙箱没有可用的浏览器，不必截图。以下由 Fable 做：四个角色开新游戏、继续存档、刷新恢复、手机宽度走查、e2e 和 Lighthouse。

## 报告

按 `AGENTS.md` 四段写入 `docs/tasks/reports/17-story-split.md`。"做了什么"里按你建议的 commit 分组列出文件（例如 game 包一组、web 客户端一组）。
