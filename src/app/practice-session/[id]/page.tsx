import { api } from "~/trpc/server";
import { Chat } from "~/components/chat";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

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
      <div className="flex h-full flex-row">
        <Chat chatId={chatId} />
        <div className="w-1/2 border-l p-4">
          <h2 className="mb-4 text-lg font-semibold">Practice Plan</h2>
          <div className="space-y-2">
            {Object.entries(
              JSON.parse(practiceSession.plan) as Record<string, string>,
            ).map(([key, value]) => (
              <Accordion key={key} type="single" collapsible>
                <AccordionItem value={key}>
                  <AccordionTrigger className="font-semiboldcapitalize">
                    {key}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 rounded-md p-3">
                      <div className="text-sm font-semibold">
                        Duration: {key === "warmup" ? "10" : "15"} minutes
                      </div>
                      <p className="text-base">{value}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("error loading practice session:", error);
    return <div>Error loading practice session</div>;
  }
}
