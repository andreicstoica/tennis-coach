"use client";

import { useRef } from "react";
import { BouncingBallAnimation } from "~/components/bouncing-ball";
import NewPracticeSessionForm from "~/components/new-practice-session-form";
import { useSession } from "~/lib/auth-client";
import { useRouter } from "next/navigation";

export default function NewPracticeSession() {
  const formRef = useRef<HTMLDivElement | null>(null);

  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user.id) {
    router.push("/");
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <NewPracticeSessionForm ref={formRef} />
      <div className="pointer-events-none fixed inset-0 z-0">
        <BouncingBallAnimation ref={formRef} />
      </div>
    </div>
  );
}
