import { api } from "~/trpc/react";
import { Chat } from "~/components/chat";

// type Session = {
//   warmup: string;
//   drill: string;
//   game: string;
// };

export default function PracticeSessionChat() {
  const practiceSession = api.practiceSession.get("id");
  // TODO
  // have the chat load, with the auto populated focus as the first user message,
  // and the practice session generative UI card as the first AI message.
  // i want the user to be able to clarify the session or change parts of it,
  // and then rate it at the end.
  // if it is a high rating, it should appear in their profile as a favorite
}
