"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";

interface PracticeSession {
  plan: string | null;
  id: number | null;
  chatId: string | null;
  createdAt: Date | null;
  userId: string | null;
  focusArea: string;
}

interface Plan {
  warmup: string;
  drill: string;
  game: string;
}

interface NotebookPracticeCardProps {
  session: PracticeSession;
  index: number;
}

export const NotebookPracticeCard = ({
  session,
}: NotebookPracticeCardProps) => {
  const formattedDate = new Date(session.createdAt!).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  let planJson: Plan | null = null;
  try {
    planJson = session.plan ? (JSON.parse(session.plan) as Plan) : null;
  } catch (error) {
    console.error("Failed to parse practice plan:", error);
  }

  // Color mapping for focus areas
  const getFocusColor = (focus: string) => {
    const colors: Record<string, string> = {
      serve: "#FF6B6B",
      backhand: "#4ECDC4",
      footwork: "#45B7D1",
      volley: "#96CEB4",
      forehand: "#FFEAA7",
      strategy: "#DDA0DD",
    };
    return colors[focus.toLowerCase()] ?? "#007AFF";
  };

  // Create shortened descriptions
  const getTruncatedText = (text: string, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const focusColor = getFocusColor(session.focusArea);

  return (
    <Link href={`/practice-session/${session.id}`} className="block">
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        <Card className="h-full w-full rounded-lg border border-gray-200 bg-white p-0 shadow-md">
          <CardContent className="flex h-full flex-col p-0">
            {/* Spine Row */}
            <div
              className="flex items-center justify-between rounded-t-lg px-3 py-2"
              style={{ backgroundColor: focusColor }}
            >
              <div className="text-sm font-semibold text-white">
                {formattedDate}
              </div>
              <div className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm">
                <span className="text-xs font-bold tracking-wide text-white uppercase">
                  {session.focusArea}
                </span>
              </div>
            </div>

            {/* Dotted separator */}
            <div className="border-t border-dashed border-gray-300"></div>

            {/* Cover Section */}
            <div className="flex-1 p-4">
              {planJson ? (
                <div className="space-y-3">
                  {/* Warmup */}
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400"></div>
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
                        Warmup
                      </div>
                      <div className="text-sm text-gray-700">
                        {getTruncatedText(planJson.warmup, 60)}
                      </div>
                    </div>
                  </div>

                  {/* Drill */}
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-400"></div>
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-green-600 uppercase">
                        Drill
                      </div>
                      <div className="text-sm text-gray-700">
                        {getTruncatedText(planJson.drill, 60)}
                      </div>
                    </div>
                  </div>

                  {/* Game */}
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-orange-400"></div>
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-orange-600 uppercase">
                        Game
                      </div>
                      <div className="text-sm text-gray-700">
                        {getTruncatedText(planJson.game, 60)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {session.focusArea} Session
                    </div>
                    <div className="text-xs opacity-75">
                      Click to view details
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};
