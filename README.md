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

- **🌍 3D 地球动画** — 仪式感动画过渡到对跖点 / 3D globe animation
- **🗺️ 双点地图** — 起点与对跖点同时展示 / Both origin and antipode on map
- **📖 百科** — Wikipedia + Bing 知识卡片 / Wikipedia + Bing knowledge card
- **🖼️ 图片** — 多图展示风景、建筑、人物 / Multiple images (landscapes, people, streets)
- **📰 新闻** — Bing 新闻 + Wikipedia 文章 / Bing News + Wikipedia articles
- **🌐 中英双语** — 右上角一键切换 / Chinese/English toggle
- **📍 我的位置** — 一键定位 / One-click geolocation
- **🖥️ 桌面应用** — Electron 打包的独立客户端 / Standalone desktop app

---

## 🚀 快速开始 · Quick Start

### 本地运行 · Run Locally

```bash
cd antipode
node server.js
# 浏览器访问 / Open: http://localhost:3000
```

### 桌面应用 · Desktop App

下载最新 Release 中的 `Antipode.Finder-win-x64.zip`，解压后双击 `The Other Side of the Earth.exe` 即可运行。

从源码构建：
```bash
cd antipode
npm install
npx electron-builder --dir
# 输出在 / Antipode 输出在 release/win-unpacked/
# 输出在 / Output: release/win-unpacked/
```

### 部署到 Cloudflare · Deploy to Cloudflare

**最简单方式 / Easiest：**

`_worker.js` 是**完全自包含**的，打开全选复制全部内容，去 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers → 新建 → 粘贴 → 部署。约 92KB，无需任何配置。

**Wrangler CLI:**
```bash
cd antipode
npx wrangler login
npx wrangler deploy
```

**Pages:**
```bash
npx wrangler pages deploy ./
```

---

## 🏗️ 架构 · Architecture

| 部署方式 / Mode | 前端 / Frontend | API 代理 / Proxy |
|----------------|----------------|-----------------|
| 本地 `node server.js` | `index.html` | corsproxy.io (多级回退) |
| Electron 桌面应用 | 内建 HTTP 服务器 | corsproxy.io |
| Cloudflare Workers | `_worker.js` 内嵌 | Worker 内建 `/api/proxy` |
| Cloudflare Pages | CDN 托管 | `_worker.js` Pages Functions |

### 数据源 / Data Sources

| 模块 / Module | 主源 / Primary | 回退 / Fallback |
|---------------|---------------|-----------------|
| 📖 百科 | Wikipedia API | Bing 知识卡片 |
| 🖼️ 图片 | Wikipedia + Commons | Bing 图片搜索 |
| 📰 新闻 | Bing News RSS → HTML | Wikipedia 搜索 |
| 🗺️ 地图 | OpenStreetMap → Esri → CartoDB | 自动回退 |
| 🌐 地理编码 | Nominatim API | — |
| 🔄 图片代理 | — | corsproxy.io (国内访问) |

---

## 📁 文件结构 · File Structure

```
antipode/
├── index.html        # 主应用 / Main application
├── server.js         # Node.js 本地服务器 / Local dev server
├── _worker.js        # Cloudflare Workers (自包含 / self-contained)
├── electron.js       # Electron 主进程 / Electron main process
├── package.json      # Electron 打包配置 / Electron build config
├── wrangler.toml     # Cloudflare 配置
├── _headers          # Pages 安全头
├── _redirects        # Pages URL 重定向
└── README.md         # 说明文档 / This file
```

---

## 📜 许可 · License

MIT — 随意使用、修改、分享。

*Feel free to use, modify, and share.*
