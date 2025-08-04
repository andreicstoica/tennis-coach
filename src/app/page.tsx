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
    <div className="flex w-full flex-col">
      {/* Hero Section with Background */}
      <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center px-10 py-20">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75"
          style={{ backgroundImage: "url(/background.png)" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white" />

        {/* Welcome Card */}
        <div className="relative z-10">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Welcome back,{" "}
                <span className="text-chart-2">
                  {session.user.name.trim().split(" ")[0] ?? session.user.email}
                </span>
                !
              </CardTitle>
              <CardDescription className="text-center">
                Ready to improve your tennis game? Create a new practice
                session.
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
        </div>
      </div>

      {/* Previous sessions - peeking through */}
      <section className="bg-background w-full px-10 pb-10">
        <h2 className="mb-4 ml-1.5 text-lg font-bold">
          Previous Practice Sessions
        </h2>
        <div className="flex w-full justify-start">
          <PreviousPracticeSessions />
        </div>
      </section>
    </div>
  );
}
