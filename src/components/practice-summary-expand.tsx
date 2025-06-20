import {
  Expandable,
  ExpandableCard,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from "./ui/expandable";
import { Label } from "./ui/label";

interface PracticeSession {
  plan: string | null;
  id: number | null;
  chatId: string | null;
  createdAt: Date | null;
  userId: string | null;
  focusArea: string;
}

interface Plan {
  warmup: string;
  drill: string;
  game: string;
}

interface PracticeSessionCardProps {
  session: PracticeSession;
}

export const PracticeSummaryExpand = ({
  session,
}: PracticeSessionCardProps) => {
  const formattedDate = new Date(session.createdAt!).toLocaleDateString();
  const planJson = JSON.parse(session.plan!) as Plan;

  return (
    <Expandable expandDirection="both" expandBehavior="push">
      <ExpandableTrigger className="w-full">
        <ExpandableCard
          className="w-full items-start justify-start"
          collapsedSize={{ width: 350, height: 125 }}
          expandedSize={{ width: 400 }}
          hoverToExpand={false}
          expandDelay={100}
          collapseDelay={400}
        >
          <ExpandableCardHeader>
            <div className="font-bold">
              <div className="text-md truncate font-bold text-ellipsis capitalize">
                {session.focusArea}
              </div>
              <Label>{formattedDate}</Label>
            </div>
          </ExpandableCardHeader>

          <ExpandableContent preset="blur-md" stagger staggerChildren={0.3}>
            <div className="text-sm font-medium">Warmup</div>
            <div className="text-sm font-light">{planJson.warmup}</div>
          </ExpandableContent>

          <ExpandableContent preset="blur-md" stagger staggerChildren={0.3}>
            <div className="text-sm font-medium">Drill</div>
            <div className="text-sm font-light">{planJson.drill}</div>
          </ExpandableContent>

          <ExpandableContent preset="blur-md" stagger staggerChildren={0.3}>
            <div className="text-sm font-medium">Game</div>
            <div className="text-sm font-light">{planJson.game}</div>
          </ExpandableContent>

          <ExpandableCardFooter>
            {/* <Button>Revisit Chat</Button> */}
          </ExpandableCardFooter>
        </ExpandableCard>
      </ExpandableTrigger>
    </Expandable>
  );
};
