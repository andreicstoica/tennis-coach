type PracticeUiProps = {
  warmup: string;
  drill: string;
  game: string;
};

export const PracticeUi = ({ warmup, drill, game }: PracticeUiProps) => {
  return (
    <div>
      <h2>Here&aposs the plan:</h2>
      <p>Warmup: {warmup}</p>
      <p>Drill: {drill}</p>
      <p>Game: {game}</p>
    </div>
  );
};
