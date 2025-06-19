import { Badge } from "./ui/badge";
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from "./ui/expandable";

type PracticeUiProps = {
  warmup: string;
  drill: string;
  game: string;
};

export const PracticeUi = ({ warmup, drill, game }: PracticeUiProps) => {
  return (
    <Expandable
      expandDirection="both"
      initialDelay={0.1}
      expandBehavior="replace"
    >
      {({ isExpanded }) => (
        <ExpandableTrigger className="w-full">
          <ExpandableCard
            className="w-full"
            expandedSize={{ width: 1000 }}
            hoverToExpand={false}
            expandDelay={200}
            collapseDelay={500}
          >
            <ExpandableCardHeader className="font-bold">
              {!isExpanded && <Badge className="mr-3">Expand to see ;)</Badge>}
            </ExpandableCardHeader>
            <ExpandableCardContent>
              <ExpandableContent preset="blur-md" stagger staggerChildren={0.2}>
                <Badge>Warmup</Badge>
                <p>{warmup}</p>
              </ExpandableContent>
              <ExpandableContent preset="blur-md" stagger staggerChildren={0.2}>
                <ExpandableContent
                  preset="blur-md"
                  stagger
                  staggerChildren={0.2}
                >
                  <Badge>Drill</Badge>
                  <p>{drill}</p>
                </ExpandableContent>
                <ExpandableContent
                  preset="blur-md"
                  stagger
                  staggerChildren={0.2}
                >
                  <Badge>Game</Badge>
                  <p>{game}</p>
                </ExpandableContent>
              </ExpandableContent>
              {isExpanded && <></>}
            </ExpandableCardContent>
          </ExpandableCard>
        </ExpandableTrigger>
      )}
    </Expandable>
  );
};
