# Clerk 管理员角色设置教程

本文档将教你如何在 Clerk 中设置管理员和普通用户角色。

## 1. 在 Clerk Dashboard 中设置

### 步骤 1: 访问 Clerk Dashboard

1. 登录到 [Clerk Dashboard](https://dashboard.clerk.com)
2. 选择你的应用程序

### 步骤 2: 设置用户元数据

1. 在左侧菜单中，点击 **Users**
2. 找到你想要设置为管理员的用户，点击进入用户详情页
3. 滚动到 **Public metadata** 部分
4. 点击 **Edit**，添加以下 JSON：

```json
{
  "role": "admin"
}
```

5. 点击 **Save**

### 步骤 3: 设置普通用户

- 普通用户不需要特殊设置
- 如果用户的 Public metadata 中没有 `role` 字段，或者 `role` 不是 `"admin"`，系统会自动将其视为普通用户

## 2. 通过代码设置（可选）

### 创建用户时自动设置角色

你可以在用户注册时自动设置角色。在 Clerk 的 Webhook 中处理 `user.created` 事件：

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    // 默认设置为普通用户
    await clerkClient.users.updateUser(id, {
      publicMetadata: {
        role: "user",
      },
    });
  }

  return new Response("", { status: 200 });
}
```

### 提升用户为管理员的 API

```typescript
// app/api/admin/promote-user/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId: currentUserId } = await auth();

  // 检查当前用户是否是管理员
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await clerkClient.users.getUser(currentUserId);
  if (currentUser.publicMetadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 获取要提升的用户 ID
  const { targetUserId } = await req.json();

  // 提升用户为管理员
  await clerkClient.users.updateUser(targetUserId, {
    publicMetadata: {
      role: "admin",
    },
  });

  return NextResponse.json({ success: true });
}
```

## 3. 角色验证

### 前端检查

```typescript
import { useUser } from "@clerk/nextjs";

export function AdminComponent() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

### 后端检查

```typescript
// lib/auth.ts 文件中已经包含了这些函数
import { isAdmin, requireAdmin } from "@/lib/auth";

// 在服务器组件中使用
export default async function AdminPage() {
  await requireAdmin(); // 如果不是管理员会自动重定向
  // 管理员内容
}
```

## 4. 测试角色设置

### 测试管理员访问

1. 设置一个用户为管理员（按照步骤 2）
2. 用该用户登录
3. 访问 `/admin` 路径
4. 应该能看到管理员页面

### 测试普通用户访问

1. 用没有管理员角色的用户登录
2. 尝试访问 `/admin` 路径
3. 应该被重定向到 `/user-home`

## 5. 安全注意事项

⚠️ **重要安全建议：**

1. **永远在服务器端验证角色**

   - 不要只依赖前端检查
   - 所有敏感操作都要在服务器端验证

2. **保护 API 路由**

   ```typescript
   export async function POST(req: Request) {
     const { userId } = await auth();
     if (!userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const isUserAdmin = await isAdmin();
     if (!isUserAdmin) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
     }

     // 管理员操作
   }
   ```

3. **数据库层面的保护**
   - 在 Prisma 查询中验证用户权限
   - 普通用户只能查询自己的数据

## 6. 常见问题

### Q: 如何批量设置多个管理员？

A: 使用 Clerk 的 API 或编写脚本批量更新用户的 publicMetadata。

### Q: 可以有多个角色吗？

A: 可以，你可以使用数组或更复杂的结构：

```json
{
  "roles": ["admin", "moderator"]
}
```

### Q: 角色信息会暴露给客户端吗？

A: `publicMetadata` 是公开的，但只有在用户已登录的情况下才能访问自己的元数据。如果需要完全私密的信息，使用 `privateMetadata`。

### Q: 如何移除管理员角色？

A: 在 Clerk Dashboard 中编辑用户的 Public metadata，删除 `role` 字段或将其改为 `"user"`。

## 7. 下一步

- 实现更细粒度的权限控制（如编辑权限、删除权限等）
- 添加角色管理界面让管理员可以在应用内管理其他用户的角色
- 集成审计日志记录管理员操作

## 参考文档

- [Clerk User Metadata](https://clerk.com/docs/users/metadata)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks/overview)
- [Next.js Authentication with Clerk](https://clerk.com/docs/quickstarts/nextjs)
