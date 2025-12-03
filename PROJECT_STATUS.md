# Gaahleri Color Studio - 项目说明

## 📋 项目概述

Gaahleri Color Studio 是一个专业的颜料调色模拟网站，帮助用户通过虚拟混合 Gaahleri 商店的颜料来发现和创建新的颜色组合。

## ✅ 已完成的任务

### 1. Prisma 数据模型优化

已创建完整的数据库 schema，包含以下模型：

- **Series（系列）**: 颜料系列/集合
- **Color（颜色）**: 单个颜料颜色
- **User（用户）**: 用户信息（与 Clerk 同步）
- **UserRecord（用户记录）**: 用户保存的颜色
- **ColorMix（调色记录）**: 用户创建的调色组合
- **ColorMixIngredient（调色成分）**: 调色中使用的各个颜色及比例

**重要特性：**
- 添加了 `UserRole` 枚举（USER, ADMIN）
- 完整的关系设置和级联删除
- 优化的索引提高查询性能
- 支持记录调色比例和结果

### 2. 用户界面组件

#### Guest Landing Page（访客页面）
- ✅ 精美的欢迎页面
- ✅ 介绍 Gaahleri 品牌和功能
- ✅ 注册/登录引导
- ✅ 功能展示和使用流程说明

#### Navigation Bar（导航栏）
- ✅ 响应式设计
- ✅ 包含所有必要链接：Home, Create Your Color, Analyse Your Color, Dashboard
- ✅ 明暗主题切换
- ✅ 用户登录/登出和头像显示
- ✅ 只在登录后显示导航链接

#### User Home Page（用户主页）
- ✅ 登录用户的欢迎页面
- ✅ 快速操作卡片
- ✅ 功能介绍和使用指南

#### Dashboard（用户仪表盘）
- ✅ 我的调色记录
- ✅ 保存的颜色
- ✅ 最近活动
- ✅ 标签式导航
- ✅ 仅显示用户自己的数据

#### Admin Page（管理员页面）
- ✅ 仅管理员可访问
- ✅ 系列管理入口
- ✅ 颜色管理入口
- ✅ 数据统计概览

### 3. 权限和安全

#### Clerk 集成
- ✅ 完整的 Clerk 认证集成
- ✅ 基于角色的访问控制（RBAC）
- ✅ 服务器端权限验证

#### 权限保护函数
创建了以下工具函数（`lib/auth.ts`）：
- `isAdmin()`: 检查用户是否为管理员
- `requireAdmin()`: 要求管理员权限，否则重定向
- `requireAuth()`: 要求登录，否则重定向
- `getCurrentUserId()`: 获取当前用户 ID

#### 路由保护
- ✅ `/admin/*` - 仅管理员可访问
- ✅ `/user-home` - 需要登录
- ✅ `/dashboard` - 需要登录，仅显示用户自己的数据
- ✅ `/make-color` - 需要登录
- ✅ `/analyze-color` - 需要登录
- ✅ `/` - 公开页面，已登录用户自动重定向到 `/user-home`

### 4. 文档

- ✅ **CLERK_ADMIN_SETUP.md**: 详细的 Clerk 管理员设置教程
  - 如何在 Clerk Dashboard 设置管理员
  - 如何通过代码设置角色
  - 角色验证方法
  - 安全最佳实践
  - 常见问题解答

## 📁 项目结构

```
gaahleri-color/
├── app/
│   ├── page.tsx                    # 主页（Guest Landing 或重定向）
│   ├── layout.tsx                  # 根布局（包含 Navbar）
│   ├── user-home/
│   │   └── page.tsx               # 用户主页
│   ├── admin/
│   │   └── page.tsx               # 管理员页面
│   ├── dashboard/
│   │   └── page.tsx               # 用户仪表盘
│   ├── make-color/
│   │   └── page.tsx               # 调色页面（占位）
│   └── analyze-color/
│       └── page.tsx               # 分析页面（占位）
├── components/
│   ├── navbar.tsx                 # 导航栏组件
│   ├── guest-landing.tsx          # 访客页面组件
│   ├── theme-toggle.tsx           # 主题切换组件
│   └── ui/                        # shadcn UI 组件
├── lib/
│   ├── auth.ts                    # 权限验证工具函数
│   ├── prisma.ts                  # Prisma 客户端
│   └── utils.ts                   # 工具函数
├── prisma/
│   └── schema.prisma              # 数据库 Schema
├── CLERK_ADMIN_SETUP.md           # Clerk 管理员设置教程
└── README.md                      # 项目说明
```

## 🚀 下一步操作

### 1. 设置 Clerk 管理员（重要！）

请参考 `CLERK_ADMIN_SETUP.md` 文档设置管理员用户：

1. 访问 [Clerk Dashboard](https://dashboard.clerk.com)
2. 进入你的应用
3. 找到要设置为管理员的用户
4. 在 Public Metadata 中添加：
   ```json
   {
     "role": "admin"
   }
   ```

### 2. 数据库迁移

**⚠️ 重要：你要求我先不要迁移到 Neon，所以这一步暂时不执行。**

当你准备好后，执行以下步骤：

```bash
# 1. 确保 .env 文件中有 DATABASE_URL
# DATABASE_URL="postgresql://..."

# 2. 生成 Prisma Client
npx prisma generate

# 3. 创建数据库迁移
npx prisma migrate dev --name init

# 4. （可选）打开 Prisma Studio 查看数据库
npx prisma studio
```

### 3. 测试应用

```bash
# 启动开发服务器
npm run dev
```

测试流程：
1. 访问 `http://localhost:3000` - 应该看到 Guest Landing Page
2. 注册/登录
3. 应该自动重定向到 `/user-home`
4. 测试导航到各个页面
5. 尝试访问 `/admin` - 如果不是管理员应该被重定向
6. 设置管理员角色后再次访问 `/admin`

### 4. 后续开发任务

#### Admin 管理功能
- [ ] 创建 Series 管理页面（CRUD）
- [ ] 创建 Color 管理页面（CRUD）
- [ ] 添加图片上传功能

#### 调色功能
- [ ] 实现调色选择器
- [ ] 颜色混合算法（RGB/HSL）
- [ ] 比例调整滑块
- [ ] 实时预览
- [ ] 保存调色记录

#### 分析功能
- [ ] 显示用户的调色历史
- [ ] 颜色成分分解
- [ ] 统计图表
- [ ] 导出功能

#### 优化
- [ ] 添加 loading 状态
- [ ] 错误处理
- [ ] 表单验证
- [ ] SEO 优化
- [ ] 性能优化

## 🔧 技术栈

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Clerk
- **Database ORM**: Prisma 7
- **Database**: PostgreSQL (Neon)
- **Icons**: Lucide React

## 📝 重要说明

### Clerk 权限验证

本项目使用 Clerk 的 `publicMetadata` 来存储用户角色：

```typescript
// 检查管理员权限（服务器端）
import { isAdmin, requireAdmin } from '@/lib/auth';

// 方法 1: 检查并返回布尔值
const userIsAdmin = await isAdmin();

// 方法 2: 要求管理员权限，否则重定向
await requireAdmin();
```

### 数据访问控制

- 管理员可以：
  - 访问 `/admin` 页面
  - 增删改 Series 和 Color
  - 查看所有用户数据（如需要）

- 普通用户可以：
  - 浏览所有颜色
  - 创建调色记录
  - 仅查看自己的 UserRecord 和 ColorMix

### 数据库 Schema 说明

#### ColorMix 表
记录用户的调色实验：
- 可以命名和描述
- 记录最终结果的颜色（hex 和 rgb）
- 如果结果匹配某个 Gaahleri 颜色，会关联该颜色
- 可选择公开或私有

#### ColorMixIngredient 表
记录调色中使用的各个颜色：
- 关联到 ColorMix
- 关联到具体的 Color
- 记录使用比例（1-100）

## 📞 需要帮助？

如有任何问题，请查看：
1. `CLERK_ADMIN_SETUP.md` - Clerk 设置说明
2. Prisma 文档: https://www.prisma.io/docs
3. Clerk 文档: https://clerk.com/docs
4. Next.js 文档: https://nextjs.org/docs

---

**当前状态**: ✅ 所有基础架构已完成，数据库 schema 已优化，等待你查看后进行迁移。
