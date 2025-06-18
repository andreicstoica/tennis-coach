"use client";

import { signOut } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { MoveLeft } from "lucide-react";

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
      <Button onClick={() => router.back()}>
        <MoveLeft />
        Back
      </Button>
      <h1 className="mt-12 mb-6 text-3xl font-bold">Profile Settings</h1>
      <Button
        onClick={handleSignOut}
        variant="outline"
        className="border-red-600 text-red-600 hover:bg-red-50"
      >
        Sign out
      </Button>
    </div>
  );
}
