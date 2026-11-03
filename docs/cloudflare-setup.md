# Cloudflare Pages 与域名绑定清单

## 1. 创建 Pages 项目

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. 选择 `liuyuliangbox/Gaming-Community`
3. 构建设置：
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `/`
4. Variables：`NODE_VERSION` = `22`
5. Save and Deploy，得到 `*.pages.dev` 预览域名

## 2. 绑定 game.aridjaya.eu.org

1. Pages 项目 → Custom domains → Set up a custom domain
2. 输入 `game.aridjaya.eu.org`
3. 若域名已在同一 Cloudflare 账号，DNS 记录通常自动添加
4. 否则手动添加：

```text
Type: CNAME
Name: game
Target: <project-name>.pages.dev
Proxy: Proxied（橙色云）
```

## 3. bbs 子域跳转 Discussions

使用 **Redirect Rules**（Rules → Redirect Rules）：

- If：Hostname equals `bbs.aridjaya.eu.org`
- Then：Dynamic redirect → `https://github.com/liuyuliangbox/Gaming-Community/discussions`
- Status：301

并为 `bbs` 添加一条占位 DNS（例如 CNAME 到 Pages 或 AAAA `100::`，按 Cloudflare 对 Redirect 的要求），确保请求先进入 Cloudflare 再被重定向。

## 4. 验证

- https://game.aridjaya.eu.org/
- https://game.aridjaya.eu.org/logs/
- https://bbs.aridjaya.eu.org/ → Discussions
