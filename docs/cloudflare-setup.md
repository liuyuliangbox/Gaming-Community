# Cloudflare Pages 与域名绑定清单

## 1. 官网（Gaming-Community）

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. 选择 `liuyuliangbox/Gaming-Community`
3. 构建设置：
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `/`
4. Variables：`NODE_VERSION` = `22`
5. 自定义域：`game.aridjaya.eu.org`

## 2. 论坛（CForum）

论坛仓库：`liuyuliangbox/CForum`  
线上 Pages 项目名：**`cforum-cae`**（`cforum.pages.dev` 名可能已被占用，勿绑错项目）

- 预览：https://cforum-cae.pages.dev
- Worker：https://cforum.563021874.workers.dev

### 绑定 bbs.aridjaya.eu.org

1. Workers & Pages → 打开 **`cforum-cae`**
2. Custom domains → 添加 `bbs.aridjaya.eu.org`
3. **删除**此前把 `bbs` 301 到 GitHub Discussions 的 Redirect Rule（若有）

详细步骤见 CForum 仓库 `docs/bind-bbs-domain.md`。

## 3. 验证

- https://game.aridjaya.eu.org/
- https://cforum-cae.pages.dev/ （论坛）
- https://bbs.aridjaya.eu.org/ （绑定后应等于论坛，不再跳 GitHub）
