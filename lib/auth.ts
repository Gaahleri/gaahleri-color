import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
// 对管理员的身份验证
/**
 * Check if the current user is an admin
 * Returns true if user has "admin" role in their publicMetadata
 */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Require admin access - redirects to home if not admin
 */
export async function requireAdmin() {
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    redirect("/user-home");
  }
}

/**
 * Require admin access for Server Actions - throws error if not admin
 */
export async function requireAdminForAction(): Promise<void> {
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
}

// 检查用户是否登陆/对用户的身份验证
/**
 * Require authentication - redirects to home page if not authenticated
 */
// 用户登陆后才能执行后续代码
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return userId;
}

/**
 * Get current user's Clerk ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication for API routes - returns userId or throws error
 * Use this in API routes instead of requireAuth
 */
export async function requireAuthForApi(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: Authentication required");
  }

  return userId;
}
