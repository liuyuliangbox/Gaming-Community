# Cloudflare Pages 与域名绑定清单

## 1. 官网（Gaming-Community）

线上是 **Workers + Assets**（不是 Pages）：

- Worker 名：`gaming-community`
- 自定义域：`game.aridjaya.eu.org`
- 配置：仓库根目录 `wrangler.jsonc`（`assets.directory = ./dist`）
- 部署命令：`npm run build && npx wrangler deploy`

### 每日 / 手动重建

1. **推荐**：CForum 仓库 Actions → **Rebuild Official Site**（已有 `CF_API_TOKEN` / `CF_ACCOUNT_ID`；每天 UTC 02:00 ≈ 北京 10:00，可 `workflow_dispatch`）
2. 或本仓库 `.github/workflows/deploy.yml`：写入同名 Secrets 后同样可 cron / 手动部署

## 2. 论坛（CForum）

论坛仓库：`liuyuliangbox/CForum`  
线上 Pages 项目名：**`cforum`**（子域为 `cforum-cae.pages.dev`；另有试验项目 `cforum-cae` 可忽略）

- 生产：https://cforum-cae.pages.dev
- 自定义域：https://bbs.aridjaya.eu.org
- Worker：https://cforum.563021874.workers.dev

### 绑定 bbs.aridjaya.eu.org

1. Workers & Pages → 打开 **`cforum`**
2. Custom domains → 确认 `bbs.aridjaya.eu.org`
3. **删除**此前把 `bbs` 301 到 GitHub Discussions 的 Redirect Rule（若有）

详细步骤见 CForum 仓库 `docs/bind-bbs-domain.md`。

## 3. 验证

- https://game.aridjaya.eu.org/
- https://cforum-cae.pages.dev/ （论坛）
- https://bbs.aridjaya.eu.org/ （应等于论坛，不再跳 GitHub）
