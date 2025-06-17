"use client";

import { signOut } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="mb-4 text-gray-600">Profile settings coming soon...</p>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
