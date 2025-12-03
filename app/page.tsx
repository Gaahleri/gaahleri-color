import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GuestLanding from "@/components/guest-landing";

export default async function HomePage() {
  const { userId } = await auth();

  // If user is logged in, redirect to their home page
  if (userId) {
    redirect("/user-home");
  }

  // Show guest landing page for non-authenticated users
  return <GuestLanding />;
}
