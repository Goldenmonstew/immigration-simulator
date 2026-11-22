# 任务 66 报告：GitHub Pages 镜像

用户在本机浏览器打不开 `wanruncong.uk`，希望有一个不含姓名的地址，选定 GitHub Pages。

## 1. 做了什么（按 commit）

- `Feat: 网站另部署到 GitHub Pages`：
  - `next.config.ts` 读 `BASE_PATH`，有值时设 `basePath` 并以 `NEXT_PUBLIC_BASE_PATH` 传给页面；
  - 新增 `apps/web/lib/asset.ts` 的 `asset()`，游戏地图、图块、精灵、声音、结局插图与 `<head>` 的 manifest、图标、Service Worker 注册路径都经它加前缀；
  - `sw.js` 从 `self.registration.scope` 取前缀，预缓存页面与静态资源按前缀；`manifest.webmanifest` 改为相对路径；
  - 新增 `.github/workflows/github-pages.yml`：main 的 CI 通过后以 `BASE_PATH=/<仓库名>` 构建并发布到 GitHub Pages；
  - 仓库已开启 Pages（Source：GitHub Actions），地址 <https://goldenmonstew.github.io/uk-immigration-simulator/>；`docs/deploy.md` 补说明。

## 2. 怎么验证的

- 不设 `BASE_PATH`（Cloudflare 用的根路径）：`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 通过（GATE EXIT 0；engine 2,892 项、policy-data 23 项、game 1,336 项、web 596 项），`npx playwright test --project=desktop` 全部 47 项通过（含离线与游戏）。
- 设 `BASE_PATH=/uk-immigration-simulator` 构建，放在本地静态服务器的同名子路径下用浏览器检查：首页链接、希腊页跳转正常；Service Worker 范围为子路径，12 个页面、manifest、图标与 50 个 `_next` 资源进入缓存；进入游戏后地图 JSON、图块、精灵与头像均 200，无 404。

## 3. 没做或没验证的

- 本机网络对 `wanruncong.uk` 的连接被重置（直连与本机代理 7893 都是），DNS 解析正常；境外 59 个节点访问返回 200。原因在本机网络一侧，未改 Cloudflare 设置。
- 中国大陆网络下 github.io 的可达性未实测（国内测速站点需要登录或人机验证）。

## 4. 发现与建议（范围外，不实现）

- 若需要更短、且同样不含姓名的地址，可另购一个中性域名绑定到 Cloudflare 或 GitHub Pages（购买须用户本人操作）。
