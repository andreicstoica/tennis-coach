"use client";

import { useSession } from "~/lib/auth-client";
import { LandingPage } from "~/components/landing-page";
import { HomePage } from "~/components/home-page";

export default function Page() {
  const { data: session } = useSession();

  if (!session) {
    return <LandingPage />;
  }

  return <HomePage user={session.user} />;
}
