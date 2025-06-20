"use client";

import { useChat } from "@ai-sdk/react";
import { createIdGenerator, type Message } from "ai";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Loader2 } from "lucide-react";
import { ChatSkeleton } from "~/components/chat-skeleton";
import { PracticeUi } from "~/components/practice-ui";
import { THINKING_MESSAGES } from "./thinking-messages";
import { motion } from "framer-motion";

type PracticeType = {
  warmup: string;
  drill: string;
  game: string;
};

export function Chat({ chatId }: { chatId: string }) {
  const { data: chatData } = api.chat.get.useQuery({ chatId });

  // Get the practice session linked to this chat
  const { data: practiceSession } = api.practiceSession.getByChatId.useQuery(
    {
      chatId,
    },
    {
      enabled: !!chatId,
    },
  );

  const addPlanMutation = api.practiceSession.addPlan.useMutation();

  const practiceSessionRef = useRef(practiceSession);
  useEffect(() => {
    practiceSessionRef.current = practiceSession;
  }, [practiceSession]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    status,
    reload,
    setMessages,
  } = useChat({
    id: chatId,
    initialMessages: [],
    api: "/api/practice-session",
    sendExtraMessageFields: true,
    maxSteps: 5,
    experimental_throttle: 50,
    generateId: createIdGenerator({
      size: 16,
    }),
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "createPractice") {
        console.log("[Chat] Tool call started - generating practice plan...");
      }
    },
    onFinish: (message) => {
      const hasCompletedTool = message.parts?.some(
        (part) =>
          part.type === "tool-invocation" &&
          part.toolInvocation.state === "result" &&
          part.toolInvocation.toolName === "createPractice",
      );

      if (hasCompletedTool && practiceSessionRef.current?.id) {
        const toolPart = message.parts?.find(
          (part) =>
            part.type === "tool-invocation" &&
            part.toolInvocation.toolName === "createPractice",
        );

        if (
          toolPart?.type === "tool-invocation" &&
          toolPart.toolInvocation.state === "result"
        ) {
          addPlanMutation.mutate({
            practiceSessionId: practiceSessionRef.current.id,
            plan: toolPart.toolInvocation.result as string,
          });
          console.log("Saved plan to db");
        }
      }
    },
    onError: (error) => {
      console.error("client side ai stream error:", error);
    },
  });

  // Reload for first practice session tool call
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

  // Initialize messages and check for reload
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (
      !chatData?.messages ||
      chatData.messages.length === 0 ||
      hasInitialized
    ) {
      return;
    }

    // Set initial messages from database ONLY ONCE to stop double messages
    setMessages((prev) => {
      const map = new Map<string, Message>();
      if (chatData.messages) {
        [...prev, ...chatData.messages].forEach((m) => map.set(m.id, m));
      }
      return Array.from(map.values());
    });
    setHasInitialized(true);

    // Check if we need to reload
    if (hasInitialReloadOccurred.current[chatId]) {
      return;
    }

    const initialUserMessageExists = chatData.messages[0]?.role === "user";
    const hasToolResult = chatData.messages.some((msg) => {
      return msg.parts?.some(
        (part) =>
          part.type === "tool-invocation" &&
          part.toolInvocation.state === "result",
      );
    });

    if (initialUserMessageExists && !hasToolResult) {
      console.log(
        "[Chat] Initial user message found without complete tool response. Triggering AI reload.",
      );
      hasInitialReloadOccurred.current[chatId] = true;
      void reload();
    }
  }, [chatData?.messages, reload, chatId, setMessages, hasInitialized]);

  // --- CYCLING "THINKING" MESSAGES ---
  const [currentThinkingMessageIndex, setCurrentThinkingMessageIndex] =
    useState(0);

  const isThinking =
    status === "streaming" ||
    messages.some((m) =>
      m.parts?.some(
        (p) =>
          p.type === "tool-invocation" && p.toolInvocation.state !== "result",
      ),
    );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isThinking) {
      intervalId = setInterval(() => {
        setCurrentThinkingMessageIndex(
          (prevIndex) => (prevIndex + 1) % THINKING_MESSAGES.length,
        );
      }, 3000); // Change message every 3 seconds
    } else {
      // Reset index when not thinking
      setCurrentThinkingMessageIndex(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isThinking]); // Re-run effect when isThinking changes
  // --- END CYCLING "THINKING" MESSAGES ---

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
                  // Skip text if this message has a completed tool result
                  const hasCompletedTool = message.parts.some(
                    (p) =>
                      p.type === "tool-invocation" &&
                      p.toolInvocation.state === "result",
                  );

                  if (hasCompletedTool) return null;

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
                  const { state, toolName } = part.toolInvocation;

                  if (state === "result" && toolName === "createPractice") {
                    try {
                      // Parse the tool result directly instead of message content
                      const result = part.toolInvocation.result as string;
                      const practice = JSON.parse(result) as PracticeType;
                      return (
                        <div key={`${message.id}-${i}`}>
                          <PracticeUi
                            warmup={practice.warmup}
                            drill={practice.drill}
                            game={practice.game}
                          />
                        </div>
                      );
                    } catch (err) {
                      console.error("Failed to parse practice JSON:", err);
                      return (
                        <Card
                          key={`${message.id}-${i}`}
                          className="bg-muted mr-auto max-w-[80%]"
                        >
                          <CardContent className="p-4">
                            <div className="text-sm text-red-500">
                              Error: Invalid practice plan format
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                  } else {
                    return (
                      <Card
                        key={`${message.id}-${i}`}
                        className="bg-muted mr-auto max-w-[80%]"
                      >
                        <CardContent className="p-4">
                          <div className="mb-1 text-sm font-medium">Coach</div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              <motion.div
                                key={currentThinkingMessageIndex}
                                className="text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.75 }}
                              >
                                {THINKING_MESSAGES[currentThinkingMessageIndex]}
                              </motion.div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                default:
                  return null;
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
