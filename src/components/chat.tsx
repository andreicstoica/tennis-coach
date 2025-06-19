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
import { PracticeUi } from "~/components/practice-ui";

type PracticeType = {
  warmup: string;
  drill: string;
  game: string;
};

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
    reload,
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

  // reload for first practice session tool call
  const hasInitialReloadOccurred = useRef<Record<string, boolean>>({});

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

  // Initialize messages when the first (focus) loads
  useEffect(() => {
    if (!chatData?.messages || chatData.messages.length === 0) {
      return;
    }

    setMessages(chatData.messages);

    // already reloaded once
    if (hasInitialReloadOccurred.current[chatId]) {
      return;
    }

    const initialUserMessageExists = chatData.messages[0]?.role === "user";
    // const hasAssistantResponse = chatData.messages.some(
    //   (message) => message.role === "assistant",
    // );
    const hasToolResult = chatData.messages.some((msg) => {
      msg.parts?.map((part) => {
        if (part.type === "tool-invocation") {
          return part.toolInvocation.state === "result";
        }
        // not a tool invocation part
        return false;
      });
    });

    if (initialUserMessageExists && !hasToolResult) {
      console.log(
        "[Chat] Initial user message found without complete tool response. Triggering AI reload.",
      );
      hasInitialReloadOccurred.current[chatId] = true;
      void reload();
    }
  }, [chatData?.messages, setMessages, reload, chatId]);

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
          <div className="py-8 text-center text-gray-400">
            No messages yet. Start the conversation!
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) =>
            message.parts.map((part, i) => {
              switch (part.type) {
                // normal messages
                case "text":
                  return (
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
                  );

                // practice gen tool
                case "tool-invocation":
                  // only one tool invocation so far
                  // can add another switch for future tools
                  console.log("made it to tool invocation");
                  const { state } = part.toolInvocation;
                  if (state === "result") {
                    // need to make json bc string in db :{
                    const practice = JSON.parse(
                      message.content,
                    ) as PracticeType;
                    return (
                      <div key={`${message.id}-${i}`}>
                        <PracticeUi
                          warmup={practice.warmup}
                          drill={practice.drill}
                          game={practice.game}
                        />
                      </div>
                    );
                  } else {
                    <Loader2 className="h-4 w-4 animate-spin" />;
                  }
              }
            }),
          )}

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
