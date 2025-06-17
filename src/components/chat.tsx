"use client";

import { useChat, type Message } from "@ai-sdk/react";
import { createIdGenerator } from "ai";
import { useEffect, useRef } from "react";
import { useSession } from "~/lib/auth-client";
import { api } from "~/trpc/react";

export function Chat({ chatId }: { chatId: string }) {
  /*
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    status,
  } = useChat({
    id: chatId,
    initialMessages: undefined, //TODO later
    api: "api/practice-session",
    sendExtraMessageFields: true,
    maxSteps: 5,
    experimental_throttle: 50,
    generateId: createIdGenerator({
      prefix: "msgc",
      size: 16,
    }),
    onError: (error) => {
      console.error("client side ai stream error:", error);
    },
  });

  // auto scroll when message is streaming
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  */
  const { data, isLoading, error } = api.chat.get.useQuery({ chatId });
  const name = useSession().data?.user.name;

  if (data) {
    return (
      <div>
        hello: {name}, data is: {data.messages?.toString()}
      </div>
    );
  }
}
