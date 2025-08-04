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
import { type PracticePlan } from "~/lib/schemas/practice-plan";

export function Chat({ chatId }: { chatId: string }) {
  const { data: chatData } = api.chat.get.useQuery({ chatId });

  // Get practice session data to display practice plan
  const { data: practiceSessionData } =
    api.practiceSession.getByChatId.useQuery({ chatId }, { enabled: !!chatId });

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
    // Server handles all message saving in onFinish callback
    onError: (error) => {
      console.error("client side ai stream error:", error);
    },
  });

  // Add status change logging
  useEffect(() => {
    console.log(`[Chat] Status changed to: ${status}`);
    if (status === "streaming") {
      console.log(`[Chat] Streaming started at ${new Date().toISOString()}`);
    }
  }, [status]);

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
    const hasAssistantResponse = chatData.messages.some(
      (msg) => msg.role === "assistant",
    );
    const isNewChat = chatData.messages.length <= 1;

    console.log("[Chat] Reload check:", {
      initialUserMessageExists,
      hasAssistantResponse,
      isNewChat,
      messageCount: chatData.messages.length,
      chatId,
    });

    // Only reload if it's a new chat with just the initial user message
    if (initialUserMessageExists && !hasAssistantResponse && isNewChat) {
      console.log(
        "[Chat] Initial user message found without assistant response. Triggering AI reload.",
      );
      hasInitialReloadOccurred.current[chatId] = true;
      void reload();
    }
  }, [chatData?.messages, reload, chatId, setMessages, hasInitialized]);

  // --- CYCLING "THINKING" MESSAGES ---
  const [currentThinkingMessageIndex, setCurrentThinkingMessageIndex] =
    useState(0);

  // Check if we have any assistant messages with actual content
  const hasAssistantResponse = messages.some(
    (m) => m.role === "assistant" && m.content && m.content.trim().length > 0,
  );

  const isThinking = status === "streaming" && !hasAssistantResponse;

  // Debug logging for thinking state
  useEffect(() => {
    console.log(
      `[Chat] isThinking: ${isThinking}, status: ${status}, hasAssistantResponse: ${hasAssistantResponse}`,
    );
    console.log(
      `[Chat] Messages:`,
      messages.map((m) => ({
        role: m.role,
        contentLength: m.content?.length || 0,
      })),
    );
  }, [isThinking, status, hasAssistantResponse, messages]);

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
          {/* Render practice plan once at the top if it exists and we have assistant messages */}
          {practiceSessionData?.plan &&
            messages.some((m) => m.role === "assistant") && (
              <div className="mb-4">
                {(() => {
                  try {
                    const practice = JSON.parse(
                      practiceSessionData.plan,
                    ) as PracticePlan;
                    return (
                      <PracticeUi
                        warmup={practice.warmup}
                        drill={practice.drill}
                        game={practice.game}
                      />
                    );
                  } catch (error) {
                    console.error("Failed to parse practice plan:", error);
                    return null; // Failed to parse practice plan
                  }
                })()}
              </div>
            )}

          {/* Render all messages normally */}
          {messages.map((message) =>
            message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  // Skip assistant messages that contain practice plans if we already rendered the plan UI
                  if (
                    message.role === "assistant" &&
                    practiceSessionData?.plan &&
                    message.content.includes("Here's your") &&
                    message.content.includes("practice session")
                  ) {
                    return null;
                  }

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
                default:
                  return null;
              }
            }),
          )}

          {/* Show loading state when streaming and no assistant messages yet */}
          {isThinking && (
            <Card className="bg-muted mr-auto max-w-[80%]">
              <CardContent className="p-4">
                <div className="mb-1 text-sm font-medium">Coach</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
