"use client";

import { usePathname } from "next/navigation";
import { useSession } from "~/lib/auth-client";
import { Button } from "./ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export function HomeButton() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show if not logged in
  if (!session) {
    return null;
  }

  // Don't show on the home page (/)
  if (pathname === "/") {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        variant="ghost"
        size="icon"
        className="bg-background/80 rounded-full shadow-sm backdrop-blur-sm"
        asChild
      >
        <Link href="/" aria-label="Go to home">
          <Home className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}
