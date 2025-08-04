"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { PreviousPracticeSessions } from "~/components/previous-practice-sessions";
import { motion } from "framer-motion";

interface HomePageProps {
  user: {
    name: string;
    email: string;
  };
}

export function HomePage({ user }: HomePageProps) {
  const firstName = user.name.trim().split(" ")[0] ?? user.email;

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
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <Card className="w-full max-w-lg border-white/20 shadow-2xl backdrop-blur-sm">
            <CardHeader className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <CardTitle className="mb-2 text-2xl">
                  Welcome back,{" "}
                  <span className="text-chart-2">{firstName}</span>!
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <CardDescription>
                  Ready to improve your tennis game? Create a new practice
                  session or continue where you left off.
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-3"
              >
                <Link href="/practice-session">
                  <Button className="w-full" size="lg">
                    Create New Practice Session
                  </Button>
                </Link>
                <div className="text-muted-foreground text-center text-sm">
                  or review your previous sessions below
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Previous sessions section */}
      <section className="bg-background w-full px-10 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 ml-1.5 text-2xl font-bold">
            Previous Practice Sessions
          </h2>
          <div className="flex w-full justify-start">
            <PreviousPracticeSessions />
          </div>
        </motion.div>
      </section>

      {/* Quick stats or tips section */}
      <section className="bg-muted/30 w-full px-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <h2 className="mb-8 text-center text-2xl font-bold">
            Keep Improving Your Game
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickTips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
              >
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 text-3xl">{tip.icon}</div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {tip.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

const quickTips = [
  {
    icon: "🎯",
    title: "Consistency First",
    description:
      "Focus on consistent practice sessions rather than intensity. Regular training builds muscle memory and technique.",
  },
  {
    icon: "📈",
    title: "Track Progress",
    description:
      "Review your previous sessions to identify patterns and areas where you're improving or need more focus.",
  },
  {
    icon: "⚡",
    title: "Mix It Up",
    description:
      "Vary your practice sessions with different drills and techniques to keep training engaging and comprehensive.",
  },
];
