"use client";

import { useChat } from "@ai-sdk/react";
import { createIdGenerator } from "ai";
import { useEffect, useRef } from "react";
import { useSession } from "~/lib/auth-client";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Chat({ chatId }: { chatId: string }) {
  const {
    data: chatData,
    isLoading,
    error,
  } = api.chat.get.useQuery({ chatId });
  //const name = useSession().data?.user.name;

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    error: chatError,
    isLoading: isChatLoading,
  } = useChat({
    id: chatId,
    initialMessages: chatData?.messages ?? [],
    api: "/api/practice-session",
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
    onFinish: (message) => {
      // TODO: Save messages back to DB
      console.log("Chat finished, should save:", message);
    },
  });

  // Auto scroll when message is streaming
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize messages when chat data loads
  useEffect(() => {
    if (chatData?.messages && messages.length === 0) {
      setMessages(chatData.messages);
    }
  }, [chatData?.messages, setMessages, messages.length]);

  if (isLoading) {
    return <div>Loading chat...</div>;
  }

  if (error) {
    return <div>Error loading chat: {error.message}</div>;
  }

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col">
      <div className="flex-shrink-0 border-b p-4">
        <h2 className="text-lg font-semibold">Chat with your Tennis Coach</h2>
        <p className="text-sm text-gray-600">
          Ask questions about your practice plan
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg p-3 ${
              message.role === "user"
                ? "ml-auto max-w-[80%] bg-blue-100"
                : "mr-auto max-w-[80%] bg-gray-100"
            }`}
          >
            <div className="mb-1 text-sm font-medium capitalize">
              {message.role === "user" ? "You" : "Coach"}
            </div>
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}

        {isChatLoading && (
          <div className="mr-auto max-w-[80%] rounded-lg bg-gray-100 p-3">
            <div className="mb-1 text-sm font-medium">Coach</div>
            <div className="text-sm">Typing...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex-shrink-0 border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your practice plan..."
            className="flex-1"
            disabled={isChatLoading}
          />
          <Button type="submit" disabled={isChatLoading || !input.trim()}>
            Send
          </Button>
        </div>
        {chatError && (
          <p className="mt-2 text-sm text-red-600">
            Error: {chatError.message}
          </p>
        )}
      </form>
    </div>
  );
}
