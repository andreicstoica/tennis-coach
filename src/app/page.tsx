"use client";

import Link from "next/link";
import Footer from "~/components/footer";
import { PreviousPracticeSessions } from "~/components/previous-practice-sessions";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useSession } from "~/lib/auth-client";

export default function HomePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex h-screen min-h-screen flex-col justify-between">
        <main className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Welcome to Courtly</CardTitle>
              <CardDescription>
                Sign in to start creating personalized practice sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/signin" className="w-full">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-screen flex-col justify-between">
      <main className="flex flex-1 flex-col items-center justify-center gap-10 p-4">
        {/* top card to start new practice */}
        <Card className="w-full max-w-lg">
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

        {/* previous practice card table */}
        <div>
          <div className="text-md pb-4 pl-1.5 font-bold">
            Previous Practice Sessions
          </div>
          <ScrollArea
            className="w-full"
            style={{ height: "calc(100vh - 400px)" }}
          >
            <div className="grid w-full grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
              <PreviousPracticeSessions />
            </div>
          </ScrollArea>
        </div>
      </main>

      <Footer />
    </div>
  );
}
