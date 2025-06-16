import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";

export default async function PracticeSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((h) => h.headers()),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  return <>{children}</>;
}
