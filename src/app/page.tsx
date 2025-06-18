"use client";

import Link from "next/link";
import { useSession } from "~/lib/auth-client";
import { PreviousPracticeSessions } from "~/components/previous-practice-sessions";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function HomePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex min-h-[inherit] flex-col items-center p-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Courtly</CardTitle>
            <CardDescription>
              Sign in to start creating personalized practice sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-4">
      {/* Top banner */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            Welcome back,{" "}
            {session.user.name.trim().split(" ")[0] ?? session.user.email}!
          </CardTitle>
          <CardDescription>
            Ready to improve your tennis game? Create a new practice session
            tailored to your goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/practice-session">
            <Button className="w-full" size="lg">
              Create New Practice Session
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Previous sessions */}
      <section>
        <h2 className="mb-4 ml-1.5 text-lg font-bold">
          Previous Practice Sessions
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <PreviousPracticeSessions />
        </div>
      </section>
    </div>
  );
}
