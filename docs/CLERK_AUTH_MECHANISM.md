# Clerk 身份验证机制详解

本文档详细解释了本项目（Gaahleri Color Studio）如何使用 Clerk 进行身份验证、管理员权限控制以及 Navbar 的集成方式。

## 1. 普通用户登录保护 (User Authentication)

为了确保只有登录用户才能访问特定功能（如 `/user-home`），项目采取了以下机制：

### 核心机制

- **ClerkProvider**: 在 `app/layout.tsx` 中，整个应用被 `<ClerkProvider>` 包裹，这是 Clerk 工作的基石。
- **页面级保护**: 在关键页面（如 `app/user-home/page.tsx`）中，使用服务端验证逻辑。

### 实现细节

在 `lib/auth.ts` 中定义了 `requireAuth` 函数（或者直接使用 `auth()`）：

```typescript
// lib/auth.ts (简化逻辑)
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/"); // 未登录则重定向到首页
  }
  return userId;
}
```

在 `app/user-home/page.tsx` 中：

```typescript
export default async function UserHomePage() {
  const { userId } = await auth();

  // 如果没有用户ID（未登录），强制重定向回首页
  if (!userId) {
    redirect("/");
  }

  // ... 渲染页面
}
```

同时，在首页 `app/page.tsx` 中也有反向逻辑：如果用户已登录，访问首页会自动跳转到 `/user-home`。

## 2. 管理员权限控制 (Admin Authorization)

管理员页面 (`/admin`) 不仅需要登录，还需要特定的管理员权限。

### 角色定义

管理员身份是通过 Clerk 用户的 `publicMetadata` 中的 `role` 字段来标记的。如果 `user.publicMetadata.role === "admin"`，则视为管理员。

### 页面保护

在 `app/admin/page.tsx` 中，调用了 `requireAdmin()`：

```typescript
// app/admin/page.tsx
export default async function AdminPage() {
  await requireAdmin(); // 核心检查点
  // ... 渲染管理员界面
}
```

`requireAdmin` 的实现 (`lib/auth.ts`)：

1. 获取当前用户 ID。
2. 通过 `clerkClient` 获取用户完整信息。
3. 检查 `user.publicMetadata.role` 是否为 `"admin"`。
4. 如果不是，重定向回 `/user-home`。

### Server Actions 保护

为了防止绕过前端直接调用后端接口，所有管理员相关的 Server Actions (在 `app/admin/actions.ts` 中) 都包含 `requireAdminForAction()` 检查：

```typescript
export async function createColor(...) {
  await requireAdminForAction(); // 验证失败会抛出错误
  // ... 执行数据库操作
}
```

## 3. Clerk 与 Nav (导航栏) 的关系

`components/navbar.tsx` 使用 Clerk 提供的 React 组件来根据登录状态动态展示内容。

### 关键组件

- **`<SignedIn>`**: 只有用户**已登录**时，包裹在这其中的内容才会显示。
- **`<SignedOut>`**: 只有用户**未登录**时，包裹在这其中的内容才会显示。
- **`<UserButton>`**: Clerk 提供的用户头像按钮，包含管理账户、退出登录等功能。

### 导航逻辑

Navbar 根据这些组件实现了动态视图：

1. **未登录状态 (`<SignedOut>`)**:

   - 显示 "Sign In" 按钮。
   - 隐藏主要的导航链接（Home, Create Colors, etc.）。

2. **登录状态 (`<SignedIn>`)**:
   - 显示完整的导航菜单 (`navItems`)。
   - 显示 `<UserButton>` (用户头像)。
   - 移动端汉堡菜单 (`Sheet`) 也只在登录后显示。

```tsx
// components/navbar.tsx 示例结构
<nav>
  {/* 只有登录后才显示的链接 */}
  <SignedIn>
    <div className="links">
      <Link href="/user-home">Home</Link>
      <Link href="/make-color">Create Colors</Link>
      {/* ... */}
    </div>
  </SignedIn>

  <div className="auth-buttons">
    <SignedIn>
      <UserButton />
    </SignedIn>

    <SignedOut>
      <SignInButton />
    </SignedOut>
  </div>
</nav>
```

### 总结

Clerk 通过 `auth()` 函数在后端提供安全验证，通过 `<SignedIn>` 等组件在前端控制 UI 展示，两者配合实现了完整的身份验证体验。
