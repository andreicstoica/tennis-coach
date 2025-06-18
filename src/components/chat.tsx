"use client";

import { useChat } from "@ai-sdk/react";
import { createIdGenerator } from "ai";
import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Loader2 } from "lucide-react";
import { ChatSkeleton } from "~/components/chat-skeleton";

export function Chat({ chatId }: { chatId: string }) {
  const { data: chatData } = api.chat.get.useQuery({ chatId });

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
    initialMessages: [], // need to set messages when data loads since there are 2 that will load in
    api: "/api/practice-session",
    sendExtraMessageFields: true,
    maxSteps: 5,
    experimental_throttle: 50,
    generateId: createIdGenerator({
      size: 16,
    }),
    onError: (error) => {
      console.error("client side ai stream error:", error);
    },
  });

  // Auto scroll when message is streaming
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial scroll on mount
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Initialize messages when the first 2 load in
  useEffect(() => {
    if (chatData?.messages && chatData.messages.length > 0) {
      setMessages(chatData.messages);
    }
  }, [chatData?.messages, setMessages]);

  if (chatData === undefined) {
    return <ChatSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        Error loading chat: {error.message}
      </div>
    );
  }

  if (!chatData) {
    return (
      <div className="flex h-screen items-center justify-center">
        Chat not found
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !status && (
          <div className="py-8 text-center text-gray-500">
            No messages yet. Start the conversation!
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                  : "bg-muted mr-auto max-w-[80%]"
              }`}
            >
              <CardContent className="p-4">
                <div className="mb-1 text-sm font-medium">
                  {message.role === "user" ? "You" : "Coach"}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
              </CardContent>
            </Card>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-shrink-0 border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your practice plan..."
            className="flex-1"
            disabled={status === "streaming"}
          />
          <Button
            type="submit"
            disabled={status === "streaming" || !input.trim()}
            className="w-20"
          >
            {status === "streaming" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
      </form>
    </div>
  );
}
