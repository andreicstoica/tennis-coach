import { api } from "~/trpc/server";
import { Chat } from "~/components/chat";

export default async function PracticeSessionChat({
  params,
}: {
  params: { id: string };
}) {
  const practiceSessionId = Number(params.id);
  const newChatId = await api.chat.create({
    practiceSessionId: practiceSessionId,
  });

  console.log(`new chat id: ${newChatId}`);

  return <Chat chatId={newChatId} />;
}
