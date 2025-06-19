import { api } from "~/trpc/server";
import { Chat } from "~/components/chat";

export default async function PracticeSessionChat({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const practiceSessionId = Number(id);

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

    return (
      // keeping this makes me feel safe @ harrison :))) <3
      // <div className="flex h-full flex-row">
      //   <div className="w-[70%]">
      //     <Chat chatId={chatId} />
      //   </div>

      //   <div className="w-[30%]">
      //     <PracticeSummary practiceSession={practiceSession} />
      //   </div>
      // </div>
      <Chat chatId={chatId} />
    );
  } catch (error) {
    console.error("error loading practice session:", error);
    return <div>Error loading practice session</div>;
  }
}
