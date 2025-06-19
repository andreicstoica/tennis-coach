import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { PracticeSummarySkeleton } from "./practice-summary-skeleton";

interface PracticeSession {
  plan: string | null;
  id: number;
  chatId: string | null;
  createdAt: Date | null;
  userId: string | null;
  focusArea: string;
}

export async function PracticeSummary({
  practiceSession,
}: {
  practiceSession: PracticeSession;
}) {
  if (!practiceSession.plan) {
    return <PracticeSummarySkeleton />;
  }

  return (
    <ScrollArea className="border-l p-4">
      <div className="">
        <h2 className="mb-4 text-lg font-semibold">Practice Plan</h2>
        <div className="space-y-2">
          {Object.entries(
            JSON.parse(practiceSession.plan) as Record<string, string>,
          ).map(([key, value]) => (
            <Accordion
              key={key}
              type="single"
              collapsible
              defaultValue="warmup"
            >
              <AccordionItem value={key}>
                <AccordionTrigger className="text-md font-semibold capitalize">
                  {key}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 rounded-md">
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
    </ScrollArea>
  );
}
