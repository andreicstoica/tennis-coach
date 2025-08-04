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
import { LettersPullUp } from "~/components/letters-pull-up";
import { motion } from "framer-motion";

export function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      <div className="relative flex min-h-screen w-full flex-col items-center justify-start px-6 py-20 pt-32">
        {/* Background with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85"
          style={{ backgroundImage: "url(/background.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-white/90" />

        {/* Content */}
        <div className="relative z-10 mt-8 flex max-w-4xl flex-col items-center text-center">
          {/* Main heading with animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6"
          >
            <LettersPullUp
              text="Welcome to Courtly"
              className="text-5xl font-bold text-white md:text-7xl lg:text-8xl"
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mb-12 text-xl font-medium text-white/90 md:text-2xl lg:text-3xl"
          >
            Your AI-Powered Tennis Coach
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="mb-12 max-w-2xl text-lg text-white/80 md:text-xl"
          >
            Transform your tennis game with personalized practice sessions,
            AI-driven insights, and structured training plans designed just for
            you.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full px-8 py-6 text-lg font-semibold sm:w-auto"
              >
                Start Your Journey
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/30 bg-white/10 px-8 py-6 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="w-full bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Why Choose Courtly?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Experience the future of tennis training with our innovative
              AI-powered platform
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardHeader>
                    <div className="mb-4 text-4xl">{feature.icon}</div>
                    <CardTitle className="text-xl text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: "📱",
    title: "Companion Mobile App",
    description:
      "Take your training on the go with our dedicated mobile app, designed for seamless court-side practice.",
  },
  {
    icon: "🏅",
    title: "NYC Court Badges",
    description:
      "Collect badges by visiting and playing at different tennis courts across New York City.",
  },
  {
    icon: "🤖",
    title: "AI Practice Generation",
    description:
      "Get structured practice sessions generated by AI based on your specific focus areas and goals.",
  },
];
