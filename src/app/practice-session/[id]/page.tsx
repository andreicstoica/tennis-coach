import { api } from "~/trpc/react";
import { Chat } from "~/components/chat";
import { useSession } from "~/lib/auth-client";
import router from "next/router";
import { useEffect, useState } from "react";

export default function PracticeSessionChat({
  params,
}: {
  params: { id: string };
}) {
  const [chatId, setChatId] = useState<string | null>(null);
  const createChatMutation = api.chat.create.useMutation();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) {
      router
        .push("/signin")
        .then(() => {
          return;
        })
        .catch((error) => {
          console.log(error);
        });
    }

    createChatMutation.mutate(
      { practiceSessionId: Number(params.id) },
      {
        onSuccess: (newChatId) => setChatId(newChatId),
        onError: (error) => console.error(error),
      },
    );
  }, [params.id, session?.user?.id, createChatMutation]);

  if (createChatMutation.isPending || !chatId) {
    return <div>Loading...</div>;
  }

  return <Chat chatId={chatId} />;
}
