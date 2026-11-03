# Gaming-Community

liuyuliangbox / **Project Turn** 社区官网与讨论区仓库。

- 官网：Astro 静态站 → Cloudflare Pages → `game.aridjaya.eu.org`
- 论坛：GitHub Discussions（可选 `bbs.aridjaya.eu.org` 301 跳转）
- 评论：Giscus（基于 Discussions）

正式游戏名称待定（Working Title）。

## 本地开发

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
npm run preview
```

## Cloudflare Pages

1. 连接本仓库到 [Cloudflare Pages](https://dash.cloudflare.com/)
2. 构建设置：
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
3. 自定义域：添加 `game.aridjaya.eu.org`，按提示在 DNS 增加 CNAME

## 域名 DNS（aridjaya.eu.org）

| 类型 | 名称 | 目标 |
|------|------|------|
| CNAME | `game` | `<your-project>.pages.dev`（Cloudflare 控制台会给出） |
| 批量重定向 / 动态重定向 | `bbs.aridjaya.eu.org` | `https://github.com/liuyuliangbox/Gaming-Community/discussions` |

`bbs` 不要指望伪装成自建论坛；用 Cloudflare Redirect Rules 做 301 即可。

## 启用 GitHub Discussions

1. 仓库 **Settings → General → Features → Discussions**
2. 建议分类：
   - 开发进度
   - 玩法建议
   - Bug / 体验反馈
   - 美术与氛围
   - 闲聊 / 招募测试
   - 评论（给 Giscus 用）
3. 置顶一篇「社区导航」：官网、日志、规则、反馈模板
4. 打开 [giscus.app](https://giscus.app/zh-CN)，选本仓库与「评论」分类，把 `repoId` / `categoryId` 填进 `src/consts.ts` 的 `GISCUS`

## 内容

开发日志在 `src/content/logs/`，新增 Markdown 即可。
