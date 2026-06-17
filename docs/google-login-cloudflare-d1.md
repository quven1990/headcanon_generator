# Cloudflare Workers + D1 实现 Google 登录 — 完整操作文档

> 本文档描述如何在 **Cloudflare Workers** 上实现 **Google OAuth 登录**，并将用户与会话数据存储在 **Cloudflare D1**（SQLite）中。  
> 不依赖 Supabase、Vercel Auth 或第三方 BaaS。  
> 适用于 Headcanon Forge 这类部署在 Cloudflare Workers（OpenNext）上的 Next.js 应用。

---

## 目录

1. [架构总览](#1-架构总览)
2. [数据存在哪里](#2-数据存在哪里)
3. [前置条件](#3-前置条件)
4. [第一步：Google Cloud 配置 OAuth](#4-第一步google-cloud-配置-oauth)
5. [第二步：创建 D1 数据库](#5-第二步创建-d1-数据库)
6. [第三步：设计 D1 表结构](#6-第三步设计-d1-表结构)
7. [第四步：Wrangler 绑定 D1](#7-第四步wrangler-绑定-d1)
8. [第五步：OAuth 登录流程（代码逻辑）](#8-第五步oauth-登录流程代码逻辑)
9. [第六步：Session 与 Cookie](#9-第六步session-与-cookie)
10. [第七步：与 Next.js / OpenNext 集成](#10-第七步与-nextjs--opennext-集成)
11. [第八步：Cloudflare 环境变量清单](#11-第八步cloudflare-环境变量清单)
12. [第九步：本地开发与部署](#12-第九步本地开发与部署)
13. [第十步：生产环境检查清单](#13-第十步生产环境检查清单)
14. [安全注意事项](#14-安全注意事项)
15. [常见问题](#15-常见问题)
16. [附录：完整 SQL 初始化脚本](#16-附录完整-sql-初始化脚本)

---

## 1. 架构总览

```
┌─────────────┐     HTTPS      ┌──────────────────────────────────────┐
│   用户浏览器  │ ────────────► │  Cloudflare Workers (Next.js/OpenNext) │
└─────────────┘                │  ┌────────────────────────────────┐  │
       ▲                       │  │ /api/auth/google      发起登录  │  │
       │ Cookie (Session)       │  │ /api/auth/callback    回调处理  │  │
       │                       │  │ /api/auth/logout      退出      │  │
       │                       │  │ /api/auth/me          当前用户  │  │
       │                       │  └────────────────────────────────┘  │
       │                       │              │                         │
       │                       │              ▼                         │
       │                       │  ┌────────────────────────────────┐  │
       │                       │  │ Cloudflare D1 (SQLite)          │  │
       │                       │  │  users / sessions / ...         │  │
       │                       │  └────────────────────────────────┘  │
       └───────────────────────│                                      │
                               └──────────────────────────────────────┘
                                          │
                    OAuth 授权码交换       │
                                          ▼
                               ┌─────────────────────┐
                               │ accounts.google.com │
                               │ (Google OAuth 2.0)  │
                               └─────────────────────┘
```

**三个角色分工：**

| 组件 | 做什么 | 存什么 |
|------|--------|--------|
| **Google OAuth** | 验证「这是哪个 Google 用户」 | Google 侧用户资料（你不直接存库） |
| **Cloudflare Worker** | 处理登录跳转、换 Token、写 Session | 不持久化用户库 |
| **Cloudflare D1** | 持久化存储 | 用户记录、Session、业务数据 |

**Cloudflare 本身不提供「Google 登录按钮」**，需要你在 Worker 里实现 OAuth 2.0 标准流程。

---

## 2. 数据存在哪里

### 2.1 D1 数据库（持久化，核心）

| 表名 | 用途 | 典型字段 |
|------|------|----------|
| `users` | Google 用户主档 | `id`, `google_sub`, `email`, `name`, `avatar_url`, `created_at` |
| `sessions` | 登录会话 | `id`, `user_id`, `token_hash`, `expires_at`, `created_at` |
| `headcanon_generations` | 业务数据（示例） | `id`, `user_id`, `input_data`, `output`, `created_at` |

用户每次用 Google 登录成功后：

1. 用 Google 返回的 `sub`（唯一 ID）在 `users` 表 **查找或创建** 用户
2. 在 `sessions` 表 **插入** 一条会话记录
3. 浏览器 Cookie 里只存 **Session ID**（或随机 token），不存 Google access_token

### 2.2 浏览器 Cookie（临时凭证）

| 内容 | 说明 |
|------|------|
| `session` Cookie | 随机 UUID 或 signed token，对应 D1 `sessions` 表一行 |
| 属性 | `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=30天` |

### 2.3 不存什么

- ❌ 不在 D1 存 Google `access_token` / `refresh_token`（除非你要调 Google API）
- ❌ 不在 Cloudflare KV/R2 存用户主数据（D1 即可）
- ❌ 不在前端 localStorage 存 Session（用 HttpOnly Cookie 更安全）

### 2.4 Google Cloud 项目

只存 **OAuth Client ID / Client Secret**（放在 Worker 环境变量 Secret 里），不存用户数据。

---

## 3. 前置条件

- Cloudflare 账号，Workers Paid 计划（推荐，D1 免费额度够用）
- 站点已部署在 Cloudflare Workers（OpenNext）
- 域名已绑定（如 `https://www.headcanonforge.com`）
- Google 账号（用于 Google Cloud Console）
- 本地已安装：`pnpm`, `wrangler`（项目里已有）

---

## 4. 第一步：Google Cloud 配置 OAuth

### 4.1 创建 / 选择 GCP 项目

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 顶部项目选择器 → **新建项目**（或选已有项目）
3. 记下 **项目 ID**

### 4.2 配置 OAuth 同意屏幕

路径：

```
Google Cloud Console
→ APIs & Services
→ OAuth consent screen
```

| 配置项 | 建议值 |
|--------|--------|
| User type | **External**（对外用户） |
| App name | Headcanon Forge |
| User support email | 你的邮箱 |
| Developer contact | 你的邮箱 |
| Authorized domains | `headcanonforge.com` |

发布状态：

- 测试阶段：可保持 **Testing**，把测试用户邮箱加进 Test users
- 上线：提交 **Verification**（用户量大时需要）

### 4.3 创建 OAuth 2.0 客户端

路径：

```
APIs & Services → Credentials → Create Credentials → OAuth client ID
```

| 配置项 | 值 |
|--------|-----|
| Application type | **Web application** |
| Name | Headcanon Forge Web |

**Authorized JavaScript origins（可选，部分流程需要）：**

```
https://www.headcanonforge.com
https://headcanonforge.com
http://localhost:8787
http://localhost:3000
```

**Authorized redirect URIs（必填，必须精确匹配）：**

```
https://www.headcanonforge.com/api/auth/callback/google
https://headcanon-generator.quven2014.workers.dev/api/auth/callback/google
http://localhost:8787/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

> 回调路径 `/api/auth/callback/google` 是本文档约定，实现时可改名，但 **Google Console 与代码必须一致**。

创建后保存：

- **Client ID** → 环境变量 `GOOGLE_CLIENT_ID`
- **Client Secret** → 环境变量 `GOOGLE_CLIENT_SECRET`（Secret，勿提交 Git）

---

## 5. 第二步：创建 D1 数据库

### 5.1 命令行创建

在项目根目录执行：

```bash
# 创建 D1 数据库
npx wrangler d1 create headcanon-auth

# 输出示例：
# ✅ Successfully created DB 'headcanon-auth'
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

记下 `database_id`，下一步写入 `wrangler.jsonc`。

### 5.2 Cloudflare Dashboard 创建（可选）

路径：

```
Cloudflare Dashboard
→ Storage & Databases
→ D1 SQL Database
→ Create database
→ 名称：headcanon-auth
```

---

## 6. 第三步：设计 D1 表结构

### 6.1 ER 关系

```
users (1) ──────< (N) sessions
  │
  └────────────< (N) headcanon_generations
```

### 6.2 表说明

#### `users` — Google 用户

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | TEXT PK | 应用内 UUID，`crypto.randomUUID()` |
| `google_sub` | TEXT UNIQUE | Google 用户唯一 ID（`sub` 字段） |
| `email` | TEXT | 邮箱 |
| `name` | TEXT | 显示名 |
| `avatar_url` | TEXT | 头像 URL |
| `created_at` | TEXT | ISO8601 时间 |
| `updated_at` | TEXT | 最后更新 |

#### `sessions` — 登录会话

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | TEXT PK | Session token（随机 UUID，Cookie 里存的值） |
| `user_id` | TEXT FK | 关联 `users.id` |
| `expires_at` | TEXT | 过期时间 ISO8601 |
| `created_at` | TEXT | 创建时间 |
| `user_agent` | TEXT | 可选，审计用 |
| `ip_address` | TEXT | 可选，审计用 |

#### `headcanon_generations` — 业务表示例

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | INTEGER PK AUTO | 自增 ID |
| `user_id` | TEXT FK | 谁生成的 |
| `type` | TEXT | character / relationship |
| `input_data` | TEXT | JSON 字符串 |
| `output_data` | TEXT | JSON 字符串 |
| `created_at` | TEXT | 创建时间 |

### 6.3 初始化 SQL 文件

创建 `migrations/0001_init.sql`（见 [附录](#16-附录完整-sql-初始化脚本)）。

### 6.4 执行迁移

```bash
# 本地开发库
npx wrangler d1 execute headcanon-auth --local --file=./migrations/0001_init.sql

# 远程生产库
npx wrangler d1 execute headcanon-auth --remote --file=./migrations/0001_init.sql
```

验证：

```bash
npx wrangler d1 execute headcanon-auth --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 7. 第四步：Wrangler 绑定 D1

编辑项目根目录 `wrangler.jsonc`，增加 `d1_databases`：

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "headcanon-generator",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-06-16",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "headcanon-auth",
      "database_id": "你的-database-id"
    }
  ],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

| 字段 | 含义 |
|------|------|
| `binding` | 代码里通过 `env.DB` 访问 |
| `database_name` | `wrangler d1 create` 时的名称 |
| `database_id` | 创建时返回的 UUID |

TypeScript 类型（可选）：

```bash
npx wrangler types
```

生成 `cloudflare-env.d.ts`，其中包含：

```typescript
interface CloudflareEnv {
  DB: D1Database
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  SESSION_SECRET: string
}
```

---

## 8. 第五步：OAuth 登录流程（代码逻辑）

Google OAuth 2.0 使用 **Authorization Code Flow + PKCE**（推荐，更安全）。

### 8.1 路由设计

| 路由 | 方法 | 作用 |
|------|------|------|
| `/api/auth/google` | GET | 跳转 Google 授权页 |
| `/api/auth/callback/google` | GET | Google 回调，写 D1，设 Cookie |
| `/api/auth/logout` | POST | 删 Session，清 Cookie |
| `/api/auth/me` | GET | 返回当前登录用户 JSON |

### 8.2 流程时序

```
用户点击「Sign in with Google」
        │
        ▼
GET /api/auth/google
  1. 生成 state（防 CSRF，随机字符串）
  2. 生成 code_verifier + code_challenge（PKCE）
  3. 把 state、code_verifier 写入短期 Cookie（或 KV，10 分钟过期）
  4. 302 重定向到 Google：
     https://accounts.google.com/o/oauth2/v2/auth
       ?client_id=...
       &redirect_uri=https://www.headcanonforge.com/api/auth/callback/google
       &response_type=code
       &scope=openid email profile
       &state=...
       &code_challenge=...
       &code_challenge_method=S256
        │
        ▼
用户在 Google 页面授权
        │
        ▼
GET /api/auth/callback/google?code=xxx&state=xxx
  1. 校验 state 与 Cookie 中一致
  2. 用 code + code_verifier POST 到 Google Token 端点换 access_token
  3. 用 access_token GET Google UserInfo：
     https://openidconnect.googleapis.com/v1/userinfo
  4. 得到：sub, email, name, picture
  5. D1：INSERT OR users ON CONFLICT(google_sub) UPDATE ...
  6. D1：INSERT INTO sessions (id, user_id, expires_at, ...)
  7. Set-Cookie: session=<session_id>; HttpOnly; Secure; SameSite=Lax
  8. 302 重定向到首页 /
        │
        ▼
后续请求带 Cookie
  → 从 D1 sessions 查 session_id
  → JOIN users 得到当前用户
  → API 鉴权通过
```

### 8.3 Google Token 端点

```
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

code=...
&client_id=...
&client_secret=...
&redirect_uri=...
&grant_type=authorization_code
&code_verifier=...
```

### 8.4 用户信息端点

```
GET https://openidconnect.googleapis.com/v1/userinfo
Authorization: Bearer <access_token>
```

返回示例：

```json
{
  "sub": "1056...",
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

### 8.5 D1 写入伪代码

```typescript
// 1. Upsert 用户
await env.DB.prepare(`
  INSERT INTO users (id, google_sub, email, name, avatar_url, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  ON CONFLICT(google_sub) DO UPDATE SET
    email = excluded.email,
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    updated_at = datetime('now')
`).bind(userId, sub, email, name, picture).run()

// 2. 创建 Session
const sessionId = crypto.randomUUID()
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

await env.DB.prepare(`
  INSERT INTO sessions (id, user_id, expires_at, created_at)
  VALUES (?, ?, ?, datetime('now'))
`).bind(sessionId, userId, expiresAt).run()

// 3. 设置 Cookie
response.headers.set('Set-Cookie', buildSessionCookie(sessionId))
```

---

## 9. 第六步：Session 与 Cookie

### 9.1 Cookie 规范

```typescript
function buildSessionCookie(sessionId: string, maxAgeSec = 60 * 60 * 24 * 30) {
  return [
    `session=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ].join('; ')
}
```

### 9.2 读取当前用户（每个需登录的 API）

```typescript
async function getCurrentUser(request: Request, env: Env): Promise<User | null> {
  const cookie = parseCookie(request.headers.get('Cookie') || '')
  const sessionId = cookie['session']
  if (!sessionId) return null

  const row = await env.DB.prepare(`
    SELECT u.id, u.email, u.name, u.avatar_url
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
      AND datetime(s.expires_at) > datetime('now')
  `).bind(sessionId).first()

  return row ?? null
}
```

### 9.3 退出登录

```typescript
// POST /api/auth/logout
const sessionId = parseCookie(request.headers.get('Cookie') || '')['session']
if (sessionId) {
  await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
}
// Set-Cookie: session=; Max-Age=0
```

### 9.4 定期清理过期 Session（可选）

Cloudflare Cron Trigger 或手动：

```sql
DELETE FROM sessions WHERE datetime(expires_at) < datetime('now');
```

---

## 10. 第七步：与 Next.js / OpenNext 集成

你的项目使用 **OpenNext + Cloudflare Workers**，D1 binding 在 Worker 运行时可用。

### 10.1 获取 D1 的方式（OpenNext）

OpenNext Cloudflare 通过 `getCloudflareContext()` 获取 `env`：

```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare"

export async function GET(request: Request) {
  const { env } = await getCloudflareContext()
  const db = env.DB  // D1 binding
  // ...
}
```

在 **Route Handler**（`app/api/auth/.../route.ts`）里写上述逻辑。

### 10.2 目录结构建议

```
app/
  api/
    auth/
      google/
        route.ts          # 发起 OAuth
      callback/
        google/
          route.ts          # OAuth 回调
      logout/
        route.ts
      me/
        route.ts
lib/
  auth/
    google-oauth.ts         # 拼 URL、换 token、拉 userinfo
    session.ts              # Cookie 读写、getCurrentUser
    pkce.ts                 # PKCE 工具
migrations/
  0001_init.sql
```

### 10.3 前端登录按钮

```tsx
<a href="/api/auth/google">Sign in with Google</a>
// 或
<button onClick={() => { window.location.href = '/api/auth/google' }}>
  Sign in with Google
</button>
```

不再需要 Supabase client。

### 10.4 需登录的 API 改造

原 Supabase `getUser()` 改为：

```typescript
const user = await getCurrentUser(request, env)
if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
// 用 user.id 写入 headcanon_generations
```

### 10.5 Middleware（可选）

在 `middleware.ts` 里**不要**做 D1 查询（Edge middleware 访问 D1 有限制）。  
鉴权放在 **API Route** 或 **Server Component** 里做。

---

## 11. 第八步：Cloudflare 环境变量清单

### 11.1 Cloudflare Dashboard

路径：

```
Workers & Pages → headcanon-generator → Settings → Variables and Secrets
```

| 变量名 | 类型 | 示例 / 说明 |
|--------|------|--------------|
| `GOOGLE_CLIENT_ID` | Plain text | `123456789-xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | **Encrypt (Secret)** | Google Console 里的 Client Secret |
| `SESSION_SECRET` | **Encrypt (Secret)** | 随机 32+ 字节，用于签名 state（可选） |
| `NEXT_PUBLIC_SITE_URL` | Plain text | `https://www.headcanonforge.com` |
| `OAUTH_REDIRECT_URI` | Plain text | `https://www.headcanonforge.com/api/auth/callback/google` |

D1 **不需要**单独环境变量，通过 `wrangler.jsonc` 的 `d1_databases` binding 注入。

### 11.2 GitHub Actions Secrets（构建用）

| Secret | 是否需要 |
|--------|----------|
| `CLOUDFLARE_API_TOKEN` | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ |
| `NEXT_PUBLIC_SITE_URL` | ✅ |
| `GOOGLE_CLIENT_ID` | 仅当构建期需要（通常运行时即可） |

### 11.3 本地开发 `.dev.vars`

项目根目录创建 `.dev.vars`（已在 `.gitignore`）：

```env
GOOGLE_CLIENT_ID=你的-client-id
GOOGLE_CLIENT_SECRET=你的-client-secret
SESSION_SECRET=本地随机字符串至少32字符
NEXT_PUBLIC_SITE_URL=http://localhost:8787
OAUTH_REDIRECT_URI=http://localhost:8787/api/auth/callback/google
```

`wrangler dev` / `pnpm preview` 会自动加载。

---

## 12. 第九步：本地开发与部署

### 12.1 本地 D1

```bash
# 初始化本地 D1 表
npx wrangler d1 execute headcanon-auth --local --file=./migrations/0001_init.sql

# 本地预览（OpenNext + 本地 D1）
pnpm preview
```

访问 `http://localhost:8787`，测试 Google 登录（Redirect URI 需在 Google Console 配 localhost）。

### 12.2 部署到生产

```bash
# 远程 D1 迁移（首次）
npx wrangler d1 execute headcanon-auth --remote --file=./migrations/0001_init.sql

# 部署 Worker
pnpm run deploy:cloudflare
# 或 GitHub Actions 自动部署
```

### 12.3 部署后验证

1. `https://www.headcanonforge.com/api/auth/google` → 应跳转 Google
2. 授权后回到首页，Cookie 里有 `session`
3. `GET /api/auth/me` → 返回用户信息 JSON
4. D1 控制台查 `users`、`sessions` 有数据：

```bash
npx wrangler d1 execute headcanon-auth --remote --command "SELECT * FROM users LIMIT 5;"
```

---

## 13. 第十步：生产环境检查清单

### Google Cloud

- [ ] OAuth 同意屏幕已配置
- [ ] Redirect URI 含生产域名 `/api/auth/callback/google`
- [ ] Client ID / Secret 已填入 Cloudflare Secrets

### Cloudflare D1

- [ ] 数据库已创建
- [ ] `wrangler.jsonc` 已绑定 `DB`
- [ ] 远程已执行 `0001_init.sql`
- [ ] 生产 Worker 能访问 D1（部署后查日志）

### Cloudflare Worker

- [ ] 环境变量齐全
- [ ] 自定义域名 `www.headcanonforge.com` 正常
- [ ] HTTPS 正常（Cookie Secure 依赖 HTTPS）

### 功能测试

- [ ] Google 登录完整流程
- [ ] 退出后 Session 从 D1 删除
- [ ] 未登录访问 `/api/generate` 返回 401
- [ ] 登录后生成记录写入 D1 `headcanon_generations`
- [ ] Explore 页能读到 D1 数据

### 从 Supabase 迁移（若适用）

- [ ] 移除 Supabase 环境变量
- [ ] 删除 Supabase Auth 相关代码
- [ ] 旧用户数据迁移脚本（可选，Supabase `auth.users` → D1 `users`）
- [ ] 更新 Supabase Redirect URLs（不再使用可忽略）

---

## 14. 安全注意事项

1. **Client Secret** 仅存 Cloudflare Secret，禁止进 Git、禁止 `NEXT_PUBLIC_*`
2. **Session Cookie** 必须 `HttpOnly` + `Secure` + `SameSite=Lax`
3. **PKCE + state** 防 CSRF 与授权码拦截
4. **Session 过期** 定期清理；敏感操作可缩短 Max-Age
5. **D1 查询** 使用参数绑定（`.bind()`），防 SQL 注入
6. **service_role 思维** 不再需要；D1 访问只在 Worker 服务端，前端拿不到 DB
7. **Google Token** 换完 userinfo 即可丢弃，不必长期存储
8. **Rate Limiting** 可在 Cloudflare WAF / Rate Limiting 规则保护 `/api/auth/*`

---

## 15. 常见问题

### Q1：Cloudflare 有现成的 Google 登录吗？

没有。Cloudflare Access 是企业内网 SSO，不是给公开网站用的 Google 社交登录。需要自己实现 OAuth 或用 Auth.js 等库。

### Q2：D1 和 KV 选哪个存用户？

**D1**。用户、Session、业务记录需要关系查询和 SQL，D1 合适。KV 适合简单键值缓存。

### Q3：OpenNext 里能用 D1 吗？

能。在 `wrangler.jsonc` 绑定 D1，Route Handler 里用 `getCloudflareContext().env.DB`。

### Q4：redirect_uri_mismatch 报错？

Google Console 里的 Redirect URI 必须与代码里 **完全一致**（含 https、路径、无多余斜杠）。

### Q5：登录成功但刷新又掉了？

检查 Cookie `Domain`/`Path`/`Secure`；确认 www 与裸域统一；Session 是否写入 D1。

### Q6：本地能测 Google 登录吗？

能。Google Console 加 `http://localhost:8787/api/auth/callback/google`，`.dev.vars` 配好 Secret。

### Q7：Auth.js（NextAuth）能用吗？

可以，有 `@auth/d1-adapter` 等方案，但 OpenNext + Cloudflare 需确认兼容版本。本文档是 **自研 OAuth + D1** 的最透明方案。

---

## 16. 附录：完整 SQL 初始化脚本

文件路径建议：`migrations/0001_init.sql`

```sql
-- users: Google 用户主表
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  google_sub   TEXT NOT NULL UNIQUE,
  email        TEXT NOT NULL,
  name         TEXT,
  avatar_url   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- sessions: 登录会话
CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  user_agent   TEXT,
  ip_address   TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- headcanon_generations: 业务数据示例
CREATE TABLE IF NOT EXISTS headcanon_generations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT NOT NULL,
  type         TEXT NOT NULL,
  input_data   TEXT NOT NULL,
  output_data  TEXT NOT NULL,
  is_favorite  INTEGER NOT NULL DEFAULT 0,
  is_deleted   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON headcanon_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON headcanon_generations(created_at DESC);

-- oauth_states: PKCE / state 临时存储（可选，也可用 Cookie）
CREATE TABLE IF NOT EXISTS oauth_states (
  state          TEXT PRIMARY KEY,
  code_verifier  TEXT NOT NULL,
  expires_at     TEXT NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);
```

执行：

```bash
npx wrangler d1 execute headcanon-auth --local  --file=./migrations/0001_init.sql
npx wrangler d1 execute headcanon-auth --remote --file=./migrations/0001_init.sql
```

---

## 附录 B：Wrangler 完整配置示例

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "headcanon-generator",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-06-16",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "headcanon-auth",
      "database_id": "YOUR_DATABASE_ID_HERE"
    }
  ],
  "observability": {
    "enabled": true,
    "logs": { "enabled": true, "invocation_logs": true }
  },
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "routes": [
    { "pattern": "www.headcanonforge.com", "custom_domain": true },
    { "pattern": "headcanonforge.com", "custom_domain": true }
  ]
}
```

---

## 附录 C：推荐实施顺序

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 1 | Google Cloud OAuth 客户端 + D1 建库建表 | 1 小时 |
| 2 | 实现 `/api/auth/google` + `/api/auth/callback/google` | 2～4 小时 |
| 3 | 实现 `getCurrentUser` + `/api/auth/me` + logout | 1 小时 |
| 4 | 改造 `/api/generate`、Explore 读写 D1 | 2～3 小时 |
| 5 | 前端登录按钮 + 移除 Supabase | 1 小时 |
| 6 | 本地 + 生产联调 | 1～2 小时 |

---

**文档版本：** 2026-06-17  
**适用项目：** Headcanon Forge（Cloudflare Workers + OpenNext + D1）  
**维护：** 实现 OAuth 路由或 D1 schema 变更时同步更新本文档
