import { Separator } from "./ui/separator";

export default function Header() {
  return (
    <header className="pt-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-green-700">
        Courtly
      </h1>
      <p className="text-muted-foreground pt-4 text-lg">
        Personlized sessions to improve your game and reflect on progress.
      </p>
      <Separator className="my-4 bg-green-200" />
    </header>
  );
}
