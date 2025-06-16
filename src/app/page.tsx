//import TennisCoachChat from "~/components/tennis-coach-chat";
import { Separator } from "~/components/ui/separator";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-green-700">
            Courtly
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Personlized sessions to improve your game and reflect on progress.
          </p>
        </header>
        <Separator className="my-8 bg-green-200" />
        <main>
          {/* <TennisCoachChat /> */}
          hello
        </main>
        <footer className="text-muted-foreground mt-12 border-t border-green-200 pt-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} Personlized sessions to improve
            your game and reflect on progress.
          </p>
        </footer>
      </div>
    </div>
  );
}
