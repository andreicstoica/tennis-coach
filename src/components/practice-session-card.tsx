"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface PracticeSession {
  plan: string;
  id: number;
  chatId: string | null;
  createdAt: Date | null;
  userId: string | null;
  focusArea: string;
}

interface PracticeSessionCardProps {
  session: PracticeSession;
}

export function PracticeSessionCard({ session }: PracticeSessionCardProps) {
  const formattedDate = new Date(session.createdAt!).toLocaleDateString(); // maybe make this just month and day

  return (
    // <div className="mb-4 rounded-lg border p-4 shadow-sm">
    //   <h3 className="text-lg font-semibold">{session.focus}</h3>
    //   <p className="text-sm text-gray-500">{formattedDate}</p>
    //   <p className="mt-2 text-base">{session.tldr}</p>
    // </div>

    <Link href={`/practice-session/${session.id}`}>
      <Card className="shadow-blue/10 w-full shadow-2xl">
        <CardHeader>
          <CardTitle className="capitalize">{session.focusArea}</CardTitle>
          <CardDescription>{formattedDate}</CardDescription>
        </CardHeader>
        <CardContent className="line-clamp-2 text-pretty">
          {session.plan}
        </CardContent>
      </Card>
    </Link>
  );
}
