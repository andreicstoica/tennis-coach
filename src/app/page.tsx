"use client";

import Link from "next/link";
import Footer from "~/components/footer";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useSession } from "~/lib/auth-client";

export default function HomePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="background flex h-screen min-h-screen flex-col justify-between">
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
      <main className="flex flex-1 items-center justify-center px-4">
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
      </main>

      <Footer />
    </div>
  );
}
