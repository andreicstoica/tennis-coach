"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import * as motion from "motion/react-client";

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
    <Link href={`/practice-session/${session.id}`}>
      <motion.div
        whileHover="hover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "backInOut" }}
      >
        <Image
          src={"/tennis-ball.svg"}
          alt="tennis ball"
          width={2}
          height={2}
        />
      </motion.div>

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
