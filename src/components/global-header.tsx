"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useSession } from "~/lib/auth-client";
import { Separator } from "./ui/separator";
import { ProfileSheet } from "~/components/profile";

export function GlobalHeader() {
  const { data: session } = useSession();

  return (
    <header>
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-green-700">Courtly</div>
        </Link>

        <div className="flex items-center space-x-4">
          {session ? (
            <ProfileSheet user={session.user} />
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
      <Separator />
    </header>
  );
}
