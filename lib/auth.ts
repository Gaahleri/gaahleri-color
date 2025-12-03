import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
 * Require authentication - redirects to home page if not authenticated
 */
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
