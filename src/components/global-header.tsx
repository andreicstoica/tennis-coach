"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useSession } from "~/lib/auth-client";

export function GlobalHeader() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-green-700">Courtly</div>
        </Link>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm text-gray-700">
                Hello, {session.user.name || session.user.email}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
