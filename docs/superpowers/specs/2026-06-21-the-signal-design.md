# The Signal — 设计规格书

> 实时科技热点追踪网站 | Ink & Paper 纸媒美学 | Vercel 部署
> 2026-06-21

---

## 一、项目定位

**The Signal** 是一个实时科技热点聚合网站，面向技术招聘场景展示全栈开发能力。从 GitHub Trending、Hacker News、技术博客、AI 论文等数据源实时抓取热点，以报纸头版排版美学呈现。

**目标受众**：HR / 技术面试官
**核心价值**：展示前端设计感 + 后端数据工程 + Vercel 部署经验

---

## 二、视觉风格：Ink & Paper

### 设计哲学

报纸排版美学数字化 — 衬线标题、分栏布局、纸纹纹理、克制用色。像阅读一份精心排版的科技周报，而非冷冰冰的数据仪表盘。

### 设计 Token

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-paper` | `#fafaf6` | 页面背景 |
| `--color-paper-warm` | `#f5f2ea` | hover 背景暖化 |
| `--color-ink` | `#1a1a1a` | 主文字色（暖黑，非纯黑） |
| `--color-ink-light` | `#666` | 次要文字 |
| `--color-ink-muted` | `#999` | 辅助信息 |
| `--color-accent` | `#c44` | 墨红强调色 |
| `--color-divider` | `#e0ddd6` | 分割线暖灰 |
| `--color-success` | `#22c55e` | 实时指示灯 |
| `--font-serif` | `Georgia, 'Times New Roman', serif` | 标题 |
| `--font-sans` | `system-ui, -apple-system, sans-serif` | 正文 |
| `--font-mono` | `'SF Mono', 'Fira Code', monospace` | 数据/代码 |

### 纸媒专属细节

- **纸纹纹理**：SVG feTurbulence noise, opacity 0.03，叠加背景
- **分割线**：暖色系 #e0ddd6，非机械灰
- **装饰线**：左侧竖线，hover 时从透明到墨红
- **排版节奏**：不规则间距，非均匀 padding

---

## 三、技术栈

| 层 | 选型 | 理由 |
|---|------|------|
| 框架 | Next.js 14+ App Router | Vercel 原生优化、SSR/ISR、API Routes |
| 样式 | Tailwind CSS v4 | 设计 Token 管理 |
| 动画 | Framer Motion + CSS transitions | 入场动画、hover 微交互、滚动触发 |
| 后端 | Next.js API Routes | 同仓库、Serverless、无需额外部署 |
| 数据源 | Firecrawl + Tavily + Exa | 爬取 + 搜索 + 语义检索，三方互补 |
| 缓存 | Vercel KV | TTL 5min，减少 API 调用 |
| 部署 | Vercel | Hobby 计划，免费额度足够 |

---

## 四、架构图

```
Browser → Next.js SSR → Client Component
                ↓
         /api/trending → Vercel KV (cache check)
                ↓ (miss)
    Promise.allSettled([
      Firecrawl (GitHub trending),
      Tavily    (HN + Web search),
      Exa       (arXiv + papers)
    ])
                ↓
         聚合 + 去重 + 排名
                ↓
         写入 KV (TTL 5min)
                ↓
         返回 JSON → 页面渲染
```

### 为什么不需要独立后端

- Next.js API Routes 即后端，Vercel Serverless 执行
- KV 缓存后 90%+ 请求命中缓存，不走冷路径
- Hobby 额度：100GB 带宽、100 万次函数调用/月，个人展示完全够用
- 单次冷路径 `Promise.allSettled` 并行，远低于 10s 超时限制

---

## 五、页面结构

单页应用，纵向四段式：

```
┌─────────────────────────────────┐
│  NAV · THE SIGNAL · LIVE · ABOUT │  ← 置顶导航
├─────────────────────────────────┤
│                                 │
│  HERO · 头版标题                │
│  "What the Tech World is        │
│   Reading Today"                │
│  实时数据指示灯 · 信号数统计     │
│                                 │
├─────────────────────────────────┤
│  TRENDING · 趋势信号流          │
│  ┌─ Lead Story (大卡片) ────┐  │
│  ├─ Signal #2 ──────────────┤  │
│  ├─ Signal #3 ──────────────┤  │
│  ├─ Signal #4 ──────────────┤  │
│  └─ Signal #5 ──────────────┘  │
│  [加载更多]                     │
├─────────────────────────────────┤
│  SOURCES · 数据源仪表盘         │
│  GitHub  │  HN  │  arXiv  │ ... │
│  迷你柱状图 / 标签分布          │
├─────────────────────────────────┤
│  FOOTER · 关于 · API · 隐私     │
│  "Real-time tech intelligence.  │
│   No noise. Just signal."      │
└─────────────────────────────────┘
```

---

## 六、组件树

| 组件 | 职责 | 纸媒特色 |
|------|------|---------|
| `Nav` | 置顶导航 + LIVE 指示 | 底部细线分割 |
| `Hero` | 头版标题 + 实时状态 | 衬线大标题、装饰竖线、日期戳 |
| `LiveIndicator` | 实时指示灯 | 绿点呼吸动画 2s loop |
| `SignalCard` | 单条趋势新闻 | 分类标签、来源链接、阅读时间估算 |
| `SignalList` | 信号流列表容器 | stagger 入场、行间暖色分割线 |
| `SourceBreakdown` | 数据源分布图 | 双栏排版、迷你柱状图 |
| `ScrollProgress` | 阅读进度条 | 顶部细线，scroll-driven (CSS) |
| `RefreshToast` | 新数据到达通知 | 顶部滑入，3s 自动消失 |
| `Footer` | 关于 / 数据源 / 隐私 | 衬线标题、简洁链接 |

---

## 七、API 设计

### 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/trending` | GET | 主数据端点。读 KV 缓存，miss 时抓取聚合 |
| `/api/trending?refresh=REFRESH_TOKEN` | GET | 强制刷新缓存 |
| `/api/sources` | GET | 各数据源健康状态（成功/超时/错误） |

### 数据聚合逻辑

1. `Promise.allSettled` 并行请求 Firecrawl、Tavily、Exa
2. 各源返回统一 Schema：`{ title, url, source, score, timestamp, summary? }`
3. 去重：URL 标准化 + Levenshtein 标题相似度 > 0.85 视为同一条
4. 排名：综合 score × 时间衰减因子
5. 取 Top 20 写入 KV，TTL 5 分钟
6. 返回前 5-10 条给前端（按需加载更多）

### 错误处理

- 单个源超时/失败 → 忽略，继续聚合其他源
- 全部源失败且无缓存 → 返回 503 + 降级提示
- 全部源失败但有缓存 → 返回过期缓存 + warning 标记
- API Routes 超时保护 → `AbortController` + 8s timeout per source

### 环境变量

```env
FIRECRAWL_API_KEY=fc-xxx
TAVILY_API_KEY=tvly-xxx
EXA_API_KEY=xxx
KV_URL=redis://xxx
KV_REST_API_URL=https://xxx
KV_REST_API_TOKEN=xxx
REFRESH_TOKEN=random-secret
```

---

## 八、动效与交互方案

### 原则

克制、细腻、触感。不用大范围位移或形变。尊重 `prefers-reduced-motion`。

### 页面入场序列（0→2s）

| 时间 | 元素 | 动效 |
|------|------|------|
| 0ms | 页面背景 | 纸纹瞬间到位 |
| 200ms | Nav | 下滑 + 底部分割线延展 |
| 400ms | Hero 标题 | 逐词淡入，stagger 100ms |
| 600ms | 装饰竖线 | 从顶生长至底 |
| 800ms | 副标题 + 统计数字 | fade-in |
| 1000ms | SignalCard[] | stagger 入场：translateY(20→0) + opacity(0→1) |
| 1600ms | SourceBreakdown | fade-in |
| 2000ms | Footer | 入场完毕 |

### 组件微交互

| 组件 | 触发 | 动效 | 时长 |
|------|------|------|------|
| SignalCard | hover | 左侧墨红线显现、背景暖化、标题加深 | 200ms |
| SignalCard | click | 整行微缩 scale 0.995 | 150ms |
| CategoryTag | hover | 下划线 0→100% 延展 | 250ms |
| LiveIndicator | 持续 | 绿点 opacity 呼吸 (1→0.4→1) | 2s loop |
| ScrollProgress | 滚动 | 顶部进度条跟随 | scroll-driven (CSS) |
| RefreshToast | 新数据 | 顶部滑入 → 3s 自动滑出 | 300ms in, 400ms out |
| SkeletonCard | 加载 | 纸色 shimmer | 1.5s loop |
| SourceBar | hover | 高度微增 5%、数值浮现 | 200ms |

### 技术分工

- **Framer Motion**：staggerChildren、useScroll+useTransform、AnimatePresence
- **CSS**：hover 伪类、scroll-driven 进度条、prefers-reduced-motion 适配
- **仅动画属性**：transform、opacity（禁止 height/width/margin 动画）

---

## 九、数据源覆盖

| 数据源 | 工具 | 抓取内容 |
|--------|------|---------|
| GitHub Trending | Firecrawl 爬取 | 每日/每周热门仓库 |
| Hacker News | Tavily 搜索 + Firecrawl | 首页热门 + 高评论文章 |
| 技术博客 | Tavily + Exa | 工程博客、技术新闻 |
| AI 论文 | Exa 语义搜索 | arXiv CS.AI / CS.CL 最新论文 |

---

## 十、非功能需求

### 性能

- FCP < 1.5s（SSR + 缓存命中）
- LCP < 2.5s
- 动画 60fps（transform/opacity only）
- CLS = 0（骨架屏占位 + 显式尺寸）

### 安全

- API Keys 仅服务端读取，不暴露客户端
- Refresh 端点需要 token 校验
- CSP 头配置（部署时）
- `.env.local` 已加入 `.gitignore`

### 可访问性

- 语义化 HTML（`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`）
- 所有交互元素可键盘访问
- `prefers-reduced-motion` 禁用入场动画
- 颜色对比度满足 WCAG AA

---

## 十一、文件结构

```
the-signal/
├── app/
│   ├── layout.tsx          # 根布局，元数据，字体
│   ├── page.tsx            # 首页 SSR
│   ├── loading.tsx         # 加载骨架屏
│   ├── error.tsx           # 错误边界
│   ├── not-found.tsx       # 404
│   └── api/
│       ├── trending/
│       │   └── route.ts    # GET /api/trending
│       └── sources/
│           └── route.ts    # GET /api/sources
├── components/
│   ├── nav.tsx
│   ├── hero.tsx
│   ├── live-indicator.tsx
│   ├── signal-card.tsx
│   ├── signal-list.tsx
│   ├── source-breakdown.tsx
│   ├── scroll-progress.tsx
│   ├── refresh-toast.tsx
│   └── footer.tsx
├── lib/
│   ├── aggregator.ts       # 数据聚合 + 排名
│   ├── sources.ts          # Firecrawl, Tavily, Exa 客户端
│   ├── cache.ts            # Vercel KV 封装
│   ├── dedup.ts            # URL 标准化 + 标题去重
│   └── types.ts            # 共享类型定义
├── styles/
│   └── tokens.css          # 设计 Token CSS 变量
├── .env.example            # 环境变量模板
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```
