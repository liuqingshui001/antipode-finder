# 🌍 地球的另一边 · Antipode Finder

> 本项目的代码由 **AI 生成**，使用 [WorkBuddy](https://www.codebuddy.cn) 作为开发辅助工具。
>
> *This project's code is **AI-generated**, developed with [WorkBuddy](https://www.codebuddy.cn) as the coding assistant.*

---

## 📖 自述 · About

**中文**

有一天下班路上，脑海中突然蹦出个想法：地球另一边是哪里？那里的人们在做什么？

于是，就有了这个项目。输入一个地点，找到它正对面的对跖点（Antipode），看看地球另一边是什么样子。

---

**English**

One day on my way home from work, a thought suddenly popped into my head: What's on the other side of the Earth? What are the people there doing?

And so this project was born. Enter any location, find its antipode — the point directly opposite on the globe — and see what's on the other side of the Earth.

---

## ✨ 功能 · Features

- **🌍 3D 地球动画** — 搜索时地球旋转到对应位置，仪式感动画过渡 / 3D globe animation with cinematic transitions
- **🗺️ 双点地图** — 起点与对跖点同时展示 / Both origin and antipode shown on the map
- **📖 百科** — 自动显示对跖点的维基百科/必应知识卡片 / Auto-fetch Wikipedia/Bing knowledge card
- **🖼️ 图片** — 多图展示风景、建筑、人物等 / Multiple images: landscapes, architecture, people
- **📰 新闻** — 必应新闻搜索相关资讯 / Bing News for latest articles
- **📍 我的位置** — 一键定位当前位置 / One-click geolocation
- **🎯 实时预览** — 输入时地球实时旋转到对应位置 / Real-time globe rotation while typing

---

## 🚀 快速开始 · Quick Start

### 本地运行 · Run Locally

```bash
cd antipode
node server.js
# 浏览器访问 / Open browser: http://localhost:3000
```

### 部署到 Cloudflare · Deploy to Cloudflare

**最简单方式 — 复制粘贴 · Easiest — Copy & Paste:**

`_worker.js` 是**完全自包含**的，打开文件全选复制全部内容，然后：

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. 点击 **创建应用程序** → **Worker**
3. 删掉默认代码，粘贴 `_worker.js` 全文
4. 点击 **部署**，立即生效

无需任何配置，Worker 自身包含完整的 HTML + API 代理（约 92KB，远低于 1MB 限制）。

**Wrangler CLI 部署 · Wrangler CLI deploy:**

```bash
cd antipode
npx wrangler login
npx wrangler deploy
```

**Pages 部署 · Pages deploy:**

```bash
cd antipode
npx wrangler pages deploy ./
```
或者通过 Cloudflare Dashboard 连接 Git 仓库部署。

---

## 🏗️ 架构 · Architecture

| 部署方式 / Mode | 静态文件 / Static | API 代理 / API Proxy |
|----------------|-------------------|---------------------|
| 本地 `node server.js` | `index.html` | corsproxy.io |
| Cloudflare Workers | `_worker.js` 内建 | Worker 内建 `/api/proxy` |
| Cloudflare Pages | CDN 托管 | `_worker.js` via Pages Functions |

部署到 Cloudflare 后，所有 API 请求通过 Worker 内建代理，无需 corsproxy.io：

*When deployed on Cloudflare, all API requests go through the Worker's built-in proxy:*
- `/api/proxy?url=https://nominatim.openstreetmap.org/...`
- `/api/proxy?url=https://en.wikipedia.org/w/api.php?...`

### 数据源 / Data Sources

| 模块 / Module | 主源 / Primary | 备用 / Fallback |
|---------------|---------------|-----------------|
| 📖 百科 | Wikipedia API | Bing 知识卡片 |
| 🖼️ 图片 | Wikipedia pageimages + Commons | Bing 图片搜索 |
| 📰 新闻 | Bing News RSS | — |
| 🗺️ 地图 | OpenStreetMap → Esri → CartoDB | 自动回退 |
| 🌐 地理编码 | Nominatim API | corsproxy.io |

---

## 📁 文件结构 · File Structure

```
antipode/
├── index.html        # 主应用（HTML + CSS + JS）/ Main application
├── server.js         # Node.js 本地开发服务器 / Local dev server
├── _worker.js        # Cloudflare Workers / Pages Functions
├── wrangler.toml     # Workers 配置 / Workers config
├── _headers          # Pages 安全头 / Pages security headers
├── _redirects        # Pages URL 重定向 / Pages redirects
└── README.md         # 说明文档 / This file
```

---

## 📜 许可 · License

MIT — 随意使用、修改、分享。

*Feel free to use, modify, and share.*
