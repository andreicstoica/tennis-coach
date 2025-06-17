import { api } from "~/trpc/server";
import { Chat } from "~/components/chat";

export default async function PracticeSessionChat({
  params,
}: {
  params: { id: string };
}) {
  const practiceSessionId = Number(params.id);

  try {
    const practiceSession = await api.practiceSession.get({
      id: practiceSessionId,
    });

    if (!practiceSession) {
      throw new Error("Practice session not found");
    }

    const chatId = practiceSession.chatId;

    if (!chatId) {
      const newChatId = await api.chat.create({
        practiceSessionId: practiceSessionId,
      });

      console.log(`new chat id: ${newChatId}`);
      return <Chat chatId={newChatId} />;
    }
  } catch (error) {
    console.error("error loading practice session:", error);
    return <div>error loading practice session</div>;
  }
}
