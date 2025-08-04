"use client";

import { useSession } from "~/lib/auth-client";
import { ProfileSheet } from "~/components/profile";

export function UserSettingsIcon() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <ProfileSheet user={session.user} />
    </div>
  );
}
