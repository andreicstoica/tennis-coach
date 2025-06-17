"use client";

import { useChat, type Message } from "@ai-sdk/react";
import { createIdGenerator } from "ai";

interface ChatProps {
  practiceSessionId: string;
  initialMessages: {
    userFocus: string;
    practiceOutline: string;
  };
}

export default function Chat({
  practiceSessionId,
  initialMessages,
}: ChatProps) {
  const { messages } = useChat({});
}
