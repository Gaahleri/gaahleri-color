# Gaahleri Color Studio - 开发教程

> 🎨 手把手教你搭建一个专业的颜料调色网站

## 目录

1. [项目概览](#1-项目概览)
2. [技术栈介绍](#2-技术栈介绍)
3. [环境搭建](#3-环境搭建)
4. [数据库设计](#4-数据库设计)
5. [认证系统](#5-认证系统)
6. [核心功能开发](#6-核心功能开发)
7. [性能优化](#7-性能优化)
8. [部署上线](#8-部署上线)

---

## 1. 项目概览

### 1.1 这个项目是什么？

Gaahleri Color Studio 是一个专业的颜料调色网站，主要功能包括：

- 🎨 **颜色库浏览** - 展示 Gaahleri 品牌的所有颜料颜色
- 🧪 **调色功能** - 使用真实颜料混合算法模拟调色
- 📚 **配方保存** - 用户可以保存自己的调色配方
- 👤 **用户系统** - 登录、收藏、个人颜色库
- 🛠️ **管理后台** - 管理员可以增删改查颜色数据

### 1.2 项目结构

```
gaahleri-color/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── admin/             # 管理员页面
│   ├── make-color/        # 调色页面
│   ├── user-home/         # 用户主页
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── admin/            # 管理后台组件
│   └── *.tsx             # 业务组件
├── lib/                   # 工具函数
│   ├── auth.ts           # 认证相关
│   ├── prisma.ts         # 数据库客户端
│   ├── fetcher.ts        # SWR fetcher
│   └── utils.ts          # 通用工具
├── prisma/               # 数据库
│   ├── schema.prisma     # 数据模型
│   └── seed.ts           # 种子数据
└── public/               # 静态资源
```

---

## 2. 技术栈介绍

### 2.1 为什么选择这些技术？

| 技术             | 用途     | 为什么选它                                     |
| ---------------- | -------- | ---------------------------------------------- |
| **Next.js 16**   | 全栈框架 | React 生态最强框架，支持 SSR/SSG，App Router   |
| **TypeScript**   | 类型安全 | 减少 bug，提升开发体验                         |
| **Prisma**       | ORM      | 类型安全的数据库操作，自动生成 TypeScript 类型 |
| **PostgreSQL**   | 数据库   | 可靠、强大的关系型数据库                       |
| **Clerk**        | 认证     | 开箱即用的用户认证，支持多种登录方式           |
| **SWR**          | 数据获取 | 缓存、重新验证、乐观更新                       |
| **shadcn/ui**    | UI 组件  | 美观、可定制、基于 Radix UI                    |
| **Tailwind CSS** | 样式     | 快速开发，一致的设计系统                       |
| **mixbox**       | 颜色混合 | 真实的颜料混合算法                             |

### 2.2 核心概念解释

#### Server Components vs Client Components

```tsx
// Server Component（默认）- 在服务器运行
// 可以直接访问数据库、读取文件
export default async function Page() {
  const data = await prisma.color.findMany(); // ✅ 可以直接查数据库
  return <div>{data.length} colors</div>;
}

// Client Component - 在浏览器运行
// 需要用户交互（点击、输入）时使用
("use client");
export default function Counter() {
  const [count, setCount] = useState(0); // ✅ 可以用 hooks
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

#### App Router 路由规则

```
app/
├── page.tsx              → /
├── user-home/page.tsx    → /user-home
├── admin/page.tsx        → /admin
├── api/colors/route.ts   → /api/colors (API)
└── api/colors/[id]/route.ts → /api/colors/123 (动态 API)
```

---

## 3. 环境搭建

### 3.1 创建项目

```bash
# 1. 创建 Next.js 项目
npx create-next-app@latest gaahleri-color --typescript --tailwind --eslint --app

# 2. 进入项目目录
cd gaahleri-color

# 3. 安装核心依赖
npm install @clerk/nextjs @prisma/client swr sonner mixbox
npm install -D prisma

# 4. 安装 UI 组件库
npx shadcn@latest init
npx shadcn@latest add button card dialog input label select slider tabs textarea alert-dialog
```

### 3.2 配置 shadcn/ui

运行 `npx shadcn@latest init` 后会创建 `components.json`：

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### 3.3 环境变量

创建 `.env` 文件：

```env
# 数据库 (推荐使用 Neon 免费 PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Clerk 认证
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## 4. 数据库设计

### 4.1 思考数据模型

在写代码之前，先想清楚需要存储什么数据：

```
用户想要：
1. 浏览颜色 → 需要 Color 表
2. 颜色分系列 → 需要 Series 表
3. 收藏颜色 → 需要 UserRecord 表（用户-颜色关联）
4. 保存配方 → 需要 Recipe 表
5. 配方包含多个颜色和比例 → 需要 RecipeIngredient 表
```

### 4.2 Prisma Schema

创建 `prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户角色枚举
enum UserRole {
  USER
  ADMIN
}

// 系列 - 颜色分组
model Series {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?  @db.Text
  colors      Color[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 颜色
model Color {
  id          String  @id @default(cuid())
  name        String
  hex         String  // #FF0000
  rgb         String  // "255,0,0"
  buyLink     String? // 购买链接
  seriesId    String
  series      Series  @relation(fields: [seriesId], references: [id], onDelete: Cascade)

  userRecords       UserRecord[]
  recipeIngredients RecipeIngredient[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([name, seriesId])
  @@index([seriesId])
  @@index([updatedAt])
}

// 用户 - 与 Clerk 同步
model User {
  id      String   @id @default(cuid())
  clerkId String   @unique
  email   String   @unique
  name    String?
  role    UserRole @default(USER)

  userRecords UserRecord[]
  recipes     Recipe[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 用户收藏的颜色
model UserRecord {
  id      String @id @default(cuid())
  userId  String
  user    User   @relation(fields: [userId], references: [clerkId], onDelete: Cascade)
  colorId String
  color   Color  @relation(fields: [colorId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, colorId]) // 同一颜色只能收藏一次
  @@index([userId])
}

// 配方
model Recipe {
  id          String  @id @default(cuid())
  name        String
  description String? @db.Text
  resultHex   String  // 混合后的颜色
  resultRgb   String

  userId String
  user   User   @relation(fields: [userId], references: [clerkId], onDelete: Cascade)

  ingredients RecipeIngredient[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 配方成分
model RecipeIngredient {
  id       String @id @default(cuid())
  recipeId String
  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  colorId  String
  color    Color  @relation(fields: [colorId], references: [id], onDelete: Cascade)
  parts    Int    // 份数

  @@unique([recipeId, colorId])
}
```

### 4.3 数据库命令

```bash
# 生成 Prisma Client（每次修改 schema 后执行）
npx prisma generate

# 创建迁移并应用到数据库
npx prisma migrate dev --name init

# 查看数据（可视化工具）
npx prisma studio
```

### 4.4 创建 Prisma 客户端

创建 `lib/prisma.ts`：

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

> ⚠️ **为什么要这样写？**
>
> Next.js 开发模式下会热重载，每次重载都会创建新的 PrismaClient 实例。
> 这个写法把实例存在全局变量中，避免创建过多连接。

---

## 5. 认证系统

### 5.1 配置 Clerk

#### 安装和初始化

```bash
npm install @clerk/nextjs
```

#### 配置根布局 `app/layout.tsx`

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

#### 配置中间件 `middleware.ts`

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 定义需要保护的路由
const isProtectedRoute = createRouteMatcher([
  "/user-home(.*)",
  "/make-color(.*)",
  "/admin(.*)",
  "/api/user(.*)",
  "/api/recipes(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 5.2 认证工具函数

创建 `lib/auth.ts`：

```typescript
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// 检查是否是管理员
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role === "admin";
  } catch {
    return false;
  }
}

// 要求登录（用于页面）
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  return userId;
}

// 要求登录（用于 API）
export async function requireAuthForApi(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// 要求管理员权限
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) redirect("/user-home");
}
```

### 5.3 页面中使用认证

```tsx
// app/user-home/page.tsx
import { requireAuth } from "@/lib/auth";

export default async function UserHomePage() {
  const userId = await requireAuth(); // 未登录会自动跳转

  return <div>Welcome, user {userId}!</div>;
}
```

### 5.4 API 中使用认证

```typescript
// app/api/user/colors/route.ts
import { requireAuthForApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = await requireAuthForApi();

    const records = await prisma.userRecord.findMany({
      where: { userId },
      include: { color: true },
    });

    return NextResponse.json(records);
  } catch (error) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

---

## 6. 核心功能开发

### 6.1 颜色列表 API

创建 `app/api/colors/route.ts`：

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const colors = await prisma.color.findMany({
      include: {
        series: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(colors, {
      headers: {
        // 缓存控制：公开缓存 5 分钟
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return NextResponse.json(
      { error: "Failed to fetch colors" },
      { status: 500 }
    );
  }
}
```

### 6.2 颜色卡片组件

创建 `components/color-card.tsx`：

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Plus, Palette, ShoppingCart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorCardProps {
  color: {
    id: string;
    name: string;
    hex: string;
    rgb: string;
    buyLink: string | null;
    series: { name: string };
  };
  isSelected?: boolean;
  isSaved?: boolean;
  onCardClick?: (color: any) => void;
  onSaveClick?: (colorId: string, e: React.MouseEvent) => void;
  onDeleteClick?: (colorId: string, e: React.MouseEvent) => void;
}

export default function ColorCard({
  color,
  isSelected = false,
  isSaved = false,
  onCardClick,
  onSaveClick,
  onDeleteClick,
}: ColorCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer bg-card",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onCardClick?.(color)}
    >
      {/* 操作按钮 */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {onSaveClick && (
          <Button
            variant={isSaved ? "default" : "secondary"}
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              if (!isSaved) onSaveClick(color.id, e);
            }}
            disabled={isSaved}
          >
            {isSaved ? (
              <Palette className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
        {onDeleteClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(color.id, e);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
        {color.buyLink && (
          <a href={color.buyLink} target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </a>
        )}
      </div>

      {/* 颜色圆圈 */}
      <div
        className="w-20 h-20 rounded-full border-2 shadow-sm mb-3"
        style={{ backgroundColor: color.hex }}
      />

      {/* 颜色信息 */}
      <div className="text-center">
        <h3 className="font-medium text-sm">{color.name}</h3>
        <p className="text-xs text-muted-foreground">{color.hex}</p>
        <p className="text-xs text-muted-foreground">{color.series.name}</p>
      </div>
    </div>
  );
}
```

### 6.3 数据获取与缓存（SWR）

创建 `lib/fetcher.ts`：

```typescript
export const fetcher = (url: string) => fetch(url).then((res) => res.json());
```

在组件中使用 SWR：

```tsx
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function ColorList() {
  // SWR 自动缓存、重新验证、错误处理
  const {
    data: colors = [],
    isLoading,
    error,
  } = useSWR("/api/colors", fetcher, {
    revalidateOnFocus: true, // 窗口获得焦点时重新验证
    dedupingInterval: 5000, // 5秒内不重复请求
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading colors</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {colors.map((color) => (
        <ColorCard key={color.id} color={color} />
      ))}
    </div>
  );
}
```

### 6.4 乐观更新（Optimistic UI）

乐观更新让用户操作感觉更快：先更新 UI，再发请求，失败则回滚。

```tsx
const { data: savedColors = [], mutate } = useSWR("/api/user/colors", fetcher);

const handleSaveColor = async (colorId: string) => {
  // 1. 保存旧数据（用于回滚）
  const previous = savedColors;

  // 2. 乐观更新：立即在 UI 上显示新数据
  const optimistic = [...previous, { id: `temp-${Date.now()}`, colorId }];
  mutate(optimistic, false); // false = 不重新获取

  try {
    // 3. 发送请求
    const res = await fetch("/api/user/colors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colorId }),
    });

    if (res.ok) {
      // 4. 成功：用服务器返回的真实数据替换
      mutate();
    } else {
      // 5. 失败：回滚到旧数据
      mutate(previous, false);
      toast.error("保存失败");
    }
  } catch (error) {
    mutate(previous, false);
    toast.error("网络错误");
  }
};
```

### 6.5 颜色混合算法（mixbox）

mixbox 是一个真实的颜料混合库，不是简单的 RGB 平均。

```tsx
import mixbox from "mixbox";

// 将 hex 转为 RGB 数组
const hexToRgb = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

// 将 RGB 数组转为 hex
const rgbToHex = (rgb: [number, number, number]): string => {
  return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

// 混合多个颜色
const mixColors = (ingredients: { hex: string; parts: number }[]) => {
  if (ingredients.length === 0) return null;
  if (ingredients.length === 1) return ingredients[0].hex;

  const totalParts = ingredients.reduce((sum, ing) => sum + ing.parts, 0);

  // mixbox 使用 latent space 混合
  const z_mix = [0, 0, 0, 0, 0, 0, 0];

  for (const ing of ingredients) {
    const rgb = hexToRgb(ing.hex);
    const z = mixbox.rgbToLatent(rgb);
    const weight = ing.parts / totalParts;

    for (let i = 0; i < z_mix.length; i++) {
      z_mix[i] += z[i] * weight;
    }
  }

  const result = mixbox.latentToRgb(z_mix);
  return rgbToHex(result);
};
```

### 6.6 虚拟滚动（处理大量数据）

当颜色很多时，不能一次渲染所有卡片。使用 `react-window` 只渲染可见区域：

```tsx
"use client";

import { FixedSizeGrid as Grid } from "react-window";
import ColorCard from "./color-card";

interface VirtualizedColorGridProps {
  colors: Color[];
  onCardClick: (color: Color) => void;
}

export default function VirtualizedColorGrid({
  colors,
  onCardClick,
}: VirtualizedColorGridProps) {
  const columnCount = 4; // 每行4个
  const rowCount = Math.ceil(colors.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= colors.length) return null;

    const color = colors[index];
    return (
      <div style={style} className="p-2">
        <ColorCard color={color} onCardClick={onCardClick} />
      </div>
    );
  };

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={200}
      height={600}
      rowCount={rowCount}
      rowHeight={250}
      width={800}
    >
      {Cell}
    </Grid>
  );
}
```

---

## 7. 性能优化

### 7.1 数据库索引

在 Prisma schema 中添加索引加速查询：

```prisma
model Color {
  // ...
  @@index([seriesId])     // 按系列筛选
  @@index([updatedAt])    // 按时间排序
  @@index([hex])          // 按颜色查找
}

model UserRecord {
  // ...
  @@index([userId])       // 查询用户的收藏
  @@index([colorId])      // 查询颜色被多少人收藏
  @@index([createdAt])    // 按时间排序
}
```

### 7.2 API 缓存策略

```typescript
// 公开数据：可以被 CDN 缓存
return NextResponse.json(data, {
  headers: {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  },
});

// 私有数据：只能客户端缓存
return NextResponse.json(data, {
  headers: {
    "Cache-Control": "private, max-age=30",
  },
});
```

### 7.3 SWR 缓存配置

```tsx
// 频繁变化的数据
useSWR("/api/user/colors", fetcher, {
  revalidateOnFocus: true,
  dedupingInterval: 5000,
});

// 很少变化的数据
useSWR("/api/series", fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1分钟内不重复请求
});
```

### 7.4 避免 Hydration 错误

Radix UI 组件在服务端和客户端生成的 ID 不同，会导致 hydration mismatch。

**解决方案：** 把包含 Radix 组件的部分提取到客户端组件：

```tsx
// ❌ 错误：Server Component 中直接使用 Tabs
export default async function Page() {
  return <Tabs>...</Tabs>; // 会报 hydration 错误
}

// ✅ 正确：提取到 Client Component
// components/my-tabs.tsx
("use client");
export default function MyTabs() {
  return <Tabs>...</Tabs>;
}

// app/page.tsx
export default async function Page() {
  return <MyTabs />;
}
```

---

## 8. 部署上线

### 8.1 数据库（Neon）

1. 注册 [Neon](https://neon.tech)（免费）
2. 创建 PostgreSQL 数据库
3. 复制连接字符串到 `.env`

### 8.2 认证（Clerk）

1. 注册 [Clerk](https://clerk.com)
2. 创建应用
3. 复制 API Keys 到 `.env`
4. 配置 OAuth providers（Google, GitHub 等）

### 8.3 部署（Vercel）

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量
4. 部署

```bash
# 或者用 Vercel CLI
npm i -g vercel
vercel
```

### 8.4 部署前检查清单

- [ ] 所有环境变量已配置
- [ ] 数据库迁移已执行 (`npx prisma migrate deploy`)
- [ ] 种子数据已导入（如需要）
- [ ] 管理员账号已设置
- [ ] 测试核心功能

---

## 附录

### A. 常用命令

```bash
# 开发
npm run dev

# 数据库
npx prisma generate    # 生成客户端
npx prisma migrate dev # 创建迁移
npx prisma studio      # 可视化管理
npx prisma db push     # 快速同步 schema（不创建迁移）

# 构建
npm run build
npm run start
```

### B. 调试技巧

1. **React DevTools** - 检查组件状态
2. **Network 面板** - 检查 API 请求
3. **Prisma Studio** - 查看数据库数据
4. **Console 日志** - 服务端日志在终端，客户端在浏览器

### C. 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Clerk 文档](https://clerk.com/docs)
- [SWR 文档](https://swr.vercel.app)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

## 总结

搭建这个项目的顺序建议：

1. **创建项目** - Next.js + TypeScript + Tailwind
2. **设置数据库** - Prisma + PostgreSQL
3. **配置认证** - Clerk
4. **开发 API** - CRUD 接口
5. **开发组件** - 从小到大，先 UI 组件再业务组件
6. **添加功能** - 调色、收藏、配方
7. **性能优化** - 缓存、虚拟滚动
8. **部署上线**

记住：**先让它工作，再让它变好**。不要一开始就追求完美，先实现核心功能，然后逐步优化。

Happy Coding! 🚀
