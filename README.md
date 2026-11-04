# Gaming-Community

liuyuliangbox / **Project Turn** 社区官网仓库。

- 官网：Astro 静态站 → Cloudflare Workers + Assets（`gaming-community`）→ `game.aridjaya.eu.org`
- 论坛：CForum → `bbs.aridjaya.eu.org`
- 开发日志：构建期从论坛「官网展示」栏目同步为静态页（`/logs/`）

正式游戏名称待定（Working Title）。

## 本地开发

```bash
npm install
# 无网或跳过同步时：
# set SKIP_FORUM_SYNC=1
npm run dev
```

构建（会先 `sync:forum` 拉取 bbs 公开导出接口；失败则中断构建）：

```bash
npm run build
npm run preview
```

离线构建（使用已缓存的 `src/data/forum`）：

```bash
set SKIP_FORUM_SYNC=1
npm run build
```

一次性把旧 Markdown 日志导入论坛（需管理员密码）：

```bash
set FORUM_ADMIN_PASSWORD=...
npm run migrate:logs
```

## Cloudflare（Workers + Assets）

项目名 **`gaming-community`**（控制台里会看到 `ASSETS`，属于 Workers 静态资源，不是 Pages）。

```bash
npm run build
npx wrangler deploy
```

每日 / 手动重建：

- **双击**仓库根目录 `rebuild-site.cmd`（需已安装并登录 [GitHub CLI](https://cli.github.com/)）
- 或 CForum Actions：**Rebuild Official Site**（已配置 CF secrets）
- 或本仓库 Actions：**Build and Deploy Site**（需 `CF_API_TOKEN` + `CF_ACCOUNT_ID`）

官网导航与 `/logs/c/:id/` 栏目页均在构建期从论坛「官网展示」分类同步；分类副标题在后台勾选「官网展示」后填写。

## 内容来源

- 论坛管理后台为栏目打开「官网展示」后，下次官网构建会同步到 `/logs/`
- 默认同步源：栏目 **开发进度**（`show_on_site=1`）
- 页面运行时不直连 bbs；仅构建阶段请求 `https://bbs.aridjaya.eu.org/api/export/...`
